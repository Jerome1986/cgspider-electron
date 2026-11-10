import { request } from '@/utils/request'
import type { TagAittribuleItem, TagColorItem } from '@/types/Tags'
import type { PageResult } from '@/types/Api'

/** 标签是服务端共享字典，不再提交旧版type参数。 */
export const attributeTagGetApi = async (_type: string) => {
  const res = await request<PageResult<TagAittribuleItem>>({ url: '/api/attributeTag-get' })
  return { ...res, data: res.data.list }
}
export const colorTagGetApi = async (_type: string) => {
  const res = await request<PageResult<TagColorItem>>({ url: '/api/colorTag-get' })
  return { ...res, data: res.data.list }
}
