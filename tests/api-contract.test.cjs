const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
function load(relative, imports, extra = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8')
    .replace('import.meta.env.VITE_API_BASE_URL', "'http://localhost:3000'")
  const code = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true
  } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(code, { module, exports: module.exports, console, URL, Set, Buffer, process,
    require: (name) => Object.hasOwn(imports, name) ? imports[name] : require(name), ...extra })
  return module.exports
}

test('分类、标签、商品、水印使用公开接口并正确解包', async () => {
  const calls = []
  const request = async (q) => {
    calls.push(q)
    return { code: 200, data: q.url === '/cate-sub' ? [{ subCategories: [{ _id: '2' }] }]
      : q.url.includes('watermark') ? { images: 'cover.png' }
      : q.url.includes('products') ? [{ _id: '1' }] : { list: [{ _id: '1' }] } }
  }
  const imports = { '@/utils/request': { request } }
  const category = load('src/renderer/src/api/category.ts', imports)
  assert.equal((await category.categoryListGetApi('模型', '1')).data[0]._id, '2')
  const tags = load('src/renderer/src/api/tag.ts', imports)
  assert.equal((await tags.attributeTagGetApi('模型')).data[0]._id, '1')
  assert.equal(calls.at(-1).params, undefined)
  const product = load('src/renderer/src/api/product.ts', imports)
  assert.equal((await product.productsGetApi()).data[0]._id, '1')
  const watermark = load('src/renderer/src/api/watermark.ts', imports)
  assert.equal((await watermark.watermarkGetApi(2)).data.images, 'cover.png')
  assert.equal(calls.at(-1).url, '/api/watermark-randomGet')
})

test('组合筛选传标签名称与本机ID，取消收藏发送明确false，授权不传用户伪身份', async () => {
  const calls = []
  const api = load('src/renderer/src/api/material.ts', {
    '@/utils/request': { request: async (q) => { calls.push(q); return { code: 200, data: {} } } },
    '@/stores': { useTagStore: () => ({ aittributeTag: [{ _id: '7', name: '现代' }] }),
      useMaterialStore: () => ({ localMaterialIds: async () => [], isLove: () => false }) }
  })
  await api.materialListGetApi('模型', '1', '2', '', ['7'], ['#FFFFFF'], true, true, '999', 2, 100, '沙发')
  const body = calls.at(-1).data
  assert.equal(calls.at(-1).url, '/api/user-material-filter')
  assert.equal(body.cateId, '2')
  assert.deepEqual(Array.from(body.tags), ['现代'])
  assert.deepEqual(Array.from(body.localIds), [])
  assert.equal(body.searchVal, '沙发')
  assert.equal(body.onlyFavorites, true)
  await api.materialListLoveApi('999', '3')
  assert.equal(calls.at(-1).data.collected, false)
  assert.equal(calls.at(-1).data.user_id, undefined)
  await api.downloadVerifyApi('3')
  assert.equal(calls.at(-1).data.material_id, '3')
  assert.equal(calls.at(-1).url, '/api/user-download-authorize')
})

test('401异常拒绝Promise、兼容数组错误，旧身份401不清理新身份', async () => {
  const user = { userInfo: { token: 'old' }, clearToken: () => { user.userInfo.token = ''; cleared++ } }
  let cleared = 0, toast, rejectRequest
  const error = { isAxiosError: true, response: { status: 401, data: { message: ['请重新登录'] } } }
  const api = load('src/renderer/src/utils/request.ts', {
    '@/stores': { useUserStore: () => user },
    axios: { request: () => new Promise((_, reject) => { rejectRequest = reject }), isAxiosError: (e) => e.isAxiosError },
    '@/router': { currentRoute: { value: { path: '/' } }, replace: async () => {} },
    'element-plus': { ElMessage: (q) => { toast = q.message } }
  })
  const pending = api.request({ url: '/api/user-web-get' })
  user.userInfo.token = 'new'
  rejectRequest(error)
  await assert.rejects(pending)
  assert.equal(cleared, 0)
  assert.equal(toast, '请重新登录')
  const second = api.request({ url: '/api/user-web-get' })
  rejectRequest(error)
  await assert.rejects(second)
  assert.equal(cleared, 1)
})

test('注册后显式登录并刷新当前资料，不把注册响应当成登录信息', async () => {
  const calls = [], stored = []
  const api = load('src/renderer/src/api/login.ts', {
    '@/utils/request': { request: async (q) => { calls.push(q.url); return { code: 200, data: q.url === '/user-login' ? { _id: '1', token: 'jwt' } : { _id: '1' } } } },
    '@/stores': { useUserStore: () => ({ setUserInfo: (value) => stored.push(value) }) },
    './user': { userIdInfoGetApi: async () => ({ data: { _id: '1', membershipType: 'free' } }) }
  })
  const result = await api.registerApi('tester', 'password')
  assert.deepEqual(calls, ['/user-register', '/user-login'])
  assert.equal(result.data.token, 'jwt')
  assert.equal(result.data.membershipType, 'free')
  assert.equal(stored[0].token, 'jwt')
})

test('原生下载保存全部文件、只向授权入口发送token，失败不发布完整文件', async (t) => {
  const tmp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'cgspider-contract-'))
  t.after(() => { if (path.dirname(tmp) === require('node:os').tmpdir() && path.basename(tmp).startsWith('cgspider-contract-')) fs.rmSync(tmp, { recursive: true, force: true }) })
  const calls = []
  const fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    if (String(url).includes('index=0')) return new Response(null, { status: 307,
      headers: { location: 'https://download.topcg.top/materials/11111111-1111-1111-1111-111111111111.bin?q-signature=test' } })
    return new Response('file', { status: 200, headers: { 'content-length': '4' } })
  }
  const api = load('src/main/utls/modules/downloadFile.ts', {}, { fetch, Response })
  const result = await api.handleDownload({ isDestroyed: () => false, webContents: { send: () => {} } }, {
    apiBase: 'http://localhost:3000', authorization: 'secret-token', saveDir: tmp, materialId: '1', name: 'material', type: '模型',
    files: [{ path: '/api/user-download-file?material_id=1&index=0', name: 'a.bin' }, { path: '/api/user-download-file?material_id=1&index=1', name: 'b.bin' }]
  })
  assert.equal(result.ok, true)
  assert.equal(fs.readdirSync(result.directory).length, 2)
  assert.equal(calls[0].options.headers.Authorization, 'secret-token')
  assert.equal(calls[1].options.headers, undefined)
  assert.equal(await api.hasLocalFiles(result.directory), true)
  const nested = path.join(result.directory, 'extracted', 'model')
  fs.mkdirSync(nested, { recursive: true })
  fs.writeFileSync(path.join(nested, 'asset.max'), 'model')
  const drag = load('src/main/utls/modules/startDrag.ts', { electron: { app: { isPackaged: false } } })
  assert.equal(drag.findResourceFile(result.directory, ['.max']), path.join(nested, 'asset.max'))
  const failing = load('src/main/utls/modules/downloadFile.ts', {}, { fetch: async () => new Response('x', { status: 403 }), Response })
  await assert.rejects(failing.handleDownload({ isDestroyed: () => false }, {
    apiBase: 'http://localhost:3000', authorization: 'token', saveDir: tmp, materialId: '2', name: 'failed', type: '模型',
    files: [{ path: '/api/user-download-file?material_id=2&index=0', name: 'x.bin' }]
  }), /HTTP 403/)
  const categoryDir = path.join(tmp, '模型')
  const failedDir = fs.readdirSync(categoryDir).find((name) => name.startsWith('failed_2_'))
  assert.ok(failedDir)
  assert.equal(await failing.hasLocalFiles(path.join(categoryDir, failedDir)), false)
})
