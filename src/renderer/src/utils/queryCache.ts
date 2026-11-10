/** 有容量和有效期限制的会话缓存；相同的并发读取共享请求。 */
export const createQueryCache = <T>(limit = 40, ttl = 5 * 60 * 1000) => {
  const values = new Map<string, { value: T; expires: number }>()
  const pending = new Map<string, Promise<T>>()
  let generation = 0
  return {
    clear: () => {
      generation++
      values.clear()
      pending.clear()
    },
    get: (key: string, load: () => Promise<T>): Promise<T> => {
      const cached = values.get(key)
      if (cached && cached.expires > Date.now()) {
        values.delete(key)
        values.set(key, cached)
        return Promise.resolve(cached.value)
      }
      if (pending.has(key)) return pending.get(key)!
      const current = generation
      const task = load()
        .then((value) => {
          if (current === generation) {
            values.delete(key)
            values.set(key, { value, expires: Date.now() + ttl })
            while (values.size > limit) values.delete(values.keys().next().value!)
          }
          return value
        })
        .finally(() => {
          if (pending.get(key) === task) pending.delete(key)
        })
      pending.set(key, task)
      return task
    }
  }
}
