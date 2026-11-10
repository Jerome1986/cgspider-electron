// 运行已构建的完整renderer，所有API在隔离会话内模拟，不连接生产、不测试封面性能。
const { app, BrowserWindow, session, ipcMain } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const root = path.resolve(__dirname, '..')
app.setPath('userData', path.join(root, '.integration-profile-' + Date.now()))
const logPath = path.join(root, '.integration-result.json')
const calls = [], scenarios = [], runtimeErrors = []
let win
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const js = (code) => win.webContents.executeJavaScript(code)
async function until(code) {
  for (let i = 0; i < 100; i++) { if (await js(code)) return; await pause(100) }
  throw new Error('UI condition timed out: ' + code)
}
const user = { _id: '1', username: 'tester1', role: 'annual', status: 1, coins: 20,
  dailyDownloadLimit: 10, endDate: '2099-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z', userAvatarUrl: '' }
app.whenReady().then(async () => {
  const ses = session.fromPartition('api-contract-' + Date.now())
  ses.protocol.handle('https', async (req) => {
    const url = new URL(req.url), q = url.searchParams
    const body = req.method === 'POST' ? await req.json() : undefined
    calls.push({ path: url.pathname, method: req.method, query: Object.fromEntries(q), body, auth: req.headers.get('authorization') === 'jwt-test' })
    let data
    switch (url.pathname) {
      case '/user-login': data = { ...user, token: 'jwt-test' }; break
      case '/api/user-web-get': data = user; break
      case '/api/user-download-status': data = { dailyUsed: 2, member: true }; break
      case '/api/user-loveList-get': data = []; break
      case '/api/user-downloadList-get': data = []; break
      case '/cate-first': data = [{ _id: '11', name: '分类', en_name: 'Category', type: q.get('pageType'), parent_id: null, sort: 0 }]; break
      case '/cate-sub': data = [{ _id: '11', subCategories: [] }]; break
      case '/api/attributeTag-get': data = { list: [{ _id: '31', name: '现代', en_name: 'Modern' }], total: 1, currentPage: 1, pageSize: 1 }; break
      case '/api/colorTag-get': data = { list: [{ _id: '41', color: '#FFFFFF' }], total: 1, currentPage: 1, pageSize: 1 }; break
      case '/api/watermark-randomGet': data = { images: '' }; break
      case '/api/filterMaterial': case '/api/user-material-filter': {
        const state = body || Object.fromEntries(q)
        data = { list: [{ _id: '21', name: state.pageType + '素材', en_name: 'Material',
          type: state.pageType, cover_url: '', files_url: [] }], total: 1,
          currentPage: Number(state.pageNum || 1), pageSize: Number(state.pageSize || 10), tags: ['现代'], colors: ['#FFFFFF'] }
        break
      }
      case '/api/products-get': data = [{ _id: '51', productType: '金币充值', productName: '金币', en_name: 'Coins', price: 10, goldCoinsAmount: 50, isActive: true }]; break
      default: runtimeErrors.push('Unknown API: ' + url.pathname); return new Response('Unknown route', { status: 404 })
    }
    return new Response(JSON.stringify({ code: 200, message: 'success', data }), { headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })
  })
  ipcMain.handle('path-exists', () => false)
  win = new BrowserWindow({ show: false, width: 1440, height: 1000,
    webPreferences: { session: ses, preload: path.join(root, 'out/preload/index.js'), sandbox: false, backgroundThrottling: false } })
  win.webContents.on('console-message', (_event, level, message) => { if (level >= 3) runtimeErrors.push(message) })
  await win.loadFile(path.join(root, 'out/renderer/index.html'))
  await until("document.querySelectorAll('input').length >= 2")
  await js(`(() => {const i=document.querySelectorAll('input');for(const [n,value] of ['tester1','password1'].entries()) {i[n].value=value;i[n].dispatchEvent(new Event('input',{bubbles:true}))};[...document.querySelectorAll('button')].find(e=>e.textContent.includes('登录')).click()})()`)
  await until("document.querySelector('.materialItem') !== null")
  scenarios.push('账号登录、当前资料及每日剩余额度初始化')
  assert.ok(await js("document.querySelector('.cgsHeader').textContent.includes('8')"))
  for (const [route, type] of [['model', '模型'], ['maps', '贴图'], ['lighting', '灯光'], ['material', '材质']]) {
    await js(`location.hash='#/${route}'`)
    await until(`document.querySelector('.materialItem') !== null && document.querySelector('.sourceMaterial') !== null`)
    await pause(400)
    assert.ok(calls.some((c) => c.path === '/api/filterMaterial' && c.query.pageType === type))
  }
  scenarios.push('四类素材、分类与字典加载')
  await js("[...document.querySelectorAll('.filter-container button')].find(e=>e.textContent.trim()==='现代').click()")
  await until("document.querySelector('.materialItem') !== null")
  assert.ok(calls.some((c) => c.query.tags === '现代'))
  scenarios.push('属性标签使用名称筛选')
  await js("location.hash='#/vipProduct'")
  await until("document.querySelector('.buy-btn') !== null")
  assert.equal(await js("document.querySelector('.buy-btn').disabled"), true)
  assert.ok(!calls.some((c) => c.path === '/order-add'))
  scenarios.push('在售商品展示、购买禁用且无旧支付请求')
  assert.equal(runtimeErrors.length, 0, runtimeErrors.join('\n'))
  fs.writeFileSync(logPath, JSON.stringify({ passed: true, scenarios, requests: calls.length, calls, runtimeErrors }, null, 2))
  win.destroy(); app.quit()
}).catch((error) => {
  fs.writeFileSync(logPath, JSON.stringify({ passed: false, error: error.stack, scenarios, calls, runtimeErrors }, null, 2))
  app.exit(1)
})
setTimeout(() => { fs.writeFileSync(logPath, JSON.stringify({ passed: false, error: 'deadline', calls, runtimeErrors })); app.exit(2) }, 45000).unref()
