import { request } from '@/utils/request'
import { TagAittribuleItem, TagColorItem } from '@/types/Tags'

/**
 * 根据页面类型获取标签
 * /web/tag/attributeTag-get
 * @param type - 页面类型
 */
export const attributeTagGetApi = (type: string) => {
  return request<TagAittribuleItem[]>({
    method: 'get',
    url: '/web/tag/attributeTag-get',
    params: { type }
  })
}

/**
 * 根据页面类型获取颜色标签
 * /web/tag/colorTag-get
 * @param type - 页面类型
 */
export const colorTagGetApi = (type: string) => {
  return request<TagColorItem[]>({
    method: 'GET',
    url: '/web/tag/colorTag-get',
    params: { type }
  })
}
