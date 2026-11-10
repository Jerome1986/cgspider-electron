import { request } from '@/utils/request'
import type { watermarkItem } from '@/types/watermark'

/**
 * 一次性获取所有水印
 * /watermark-get
 * @param type - 请求类型：1为带分页 2为不带分页
 */
export const watermarkGetApi = async (_type: number) => {
  const result = await request<Pick<watermarkItem, 'images'>>({
    method: 'GET',
    url: '/api/watermark-randomGet'
  })
  return result
}
