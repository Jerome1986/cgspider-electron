const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// 直接执行源码，隔离网络和Electron，不依赖构建产物。
const load = (file, mocks = {}, globals = {}) => {
  const source = fs.readFileSync(path.join(__dirname, '../src/renderer/src', file), 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText
  const exports = {}
  vm.runInNewContext(code, {
    exports, console, ...globals,
    require: (id) => {
      if (!(id in mocks)) throw new Error(`Unexpected dependency: ${id}`)
      return mocks[id]
    }
  })
  return exports
}
const { createQueryCache } = load('utils/queryCache.ts')
const deferred = () => {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}

test('重复和并发读取复用结果；失败允许重试', async () => {
  const cache = createQueryCache()
  const request = deferred()
  let calls = 0
  const fetch = () => { calls++; return request.promise }
  const first = cache.get('a', fetch)
  assert.equal(cache.get('a', fetch), first)
  request.resolve('value')
  await first
  assert.equal(await cache.get('a', fetch), 'value')
  assert.equal(calls, 1)
  await assert.rejects(cache.get('bad', async () => { throw Error('offline') }))
  assert.equal(await cache.get('bad', async () => 'retry'), 'retry')
})

test('过期重新读取，容量限制淘汰最久未访问项', async () => {
  let now = 0
  const { createQueryCache: create } = load('utils/queryCache.ts', {}, { Date: { now: () => now } })
  const cache = create(2, 10)
  await cache.get('a', async () => 1)
  await cache.get('b', async () => 2)
  await cache.get('a', async () => 9)
  await cache.get('c', async () => 3)
  assert.equal(await cache.get('b', async () => 4), 4)
  now = 11
  assert.equal(await cache.get('b', async () => 5), 5)
})

test('清空后旧请求不能重新填入缓存或删除新请求', async () => {
  const cache = createQueryCache()
  const old = deferred(), fresh = deferred()
  const first = cache.get('a', () => old.promise)
  cache.clear()
  const second = cache.get('a', () => fresh.promise)
  old.resolve('old')
  await first
  assert.equal(cache.get('a', async () => 'wrong'), second)
  fresh.resolve('new')
  await second
  assert.equal(await cache.get('a', async () => 'wrong'), 'new')
})

const material = (fetch) => load('stores/modules/material.ts', {
  '@/utils/queryCache': { createQueryCache },
  pinia: { defineStore: (_name, setup) => setup },
  vue: { ref: (value) => ({ value }) },
  './user': { useUserStore: () => ({ userInfo: { _id: 'owner', token: 'token' } }) },
  './category': {}, './tags': {},
  '@/api/material': { materialListGetApi: fetch }
}).useMaterialStore()
const result = (id) => ({ data: { list: [{ _id: id }], total: 1 } })
const query = (store, category = 'a', local = false, loved = false, owner = 'owner') =>
  store.materialListFilterGet('material', category, '', '', [], [], local, loved, owner)

test('翻页返回命中缓存；账号隔离；个人筛选实时读取', async () => {
  let calls = 0
  const store = material(async () => { calls++; return result(String(calls)) })
  await query(store)
  store.setPageNum(2)
  await query(store)
  store.setPageNum(1)
  await query(store)
  assert.equal(calls, 2)
  assert.equal(store.materialList.value[0]._id, '1')
  await query(store, 'a', false, false, 'other')
  assert.equal(calls, 3)
  await query(store, 'a', false, true)
  await query(store, 'a', false, true)
  await query(store, 'a', true)
  await query(store, 'a', true)
  assert.equal(calls, 7)
  store.clearSession()
  await query(store)
  assert.equal(calls, 8)
})

test('刷新期间保留旧列表；较早响应不能覆盖新查询', async () => {
  const a = deferred(), b = deferred()
  const store = material(async (_type, category) => category === 'a' ? a.promise : b.promise)
  store.materialList.value = [{ _id: 'visible' }]
  const first = query(store, 'a')
  assert.equal(store.materialList.value[0]._id, 'visible')
  const second = query(store, 'b')
  b.resolve(result('b'))
  await second
  a.resolve(result('a'))
  await first
  assert.equal(store.materialList.value[0]._id, 'b')
  assert.equal(store.loading.value, false)
})

test('退出登录后返回的旧响应不恢复列表', async () => {
  const request = deferred()
  const store = material(() => request.promise)
  const pending = query(store)
  store.clearSession()
  request.resolve(result('old-account'))
  await pending
  assert.equal(store.materialList.value.length, 0)
})
