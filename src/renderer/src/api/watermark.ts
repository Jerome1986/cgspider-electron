import { request } from '@/utils/request'
import { watermarkItem } from '@/types/watermark'

/**
 * 一次性获取所有水印
 * /watermark-get
 * @param type - 请求类型：1为带分页 2为不带分页
 */
export const watermarkGetApi = (type: number) => {
  return request<watermarkItem[]>({
    method: 'GET',
    url: '/watermark-get',
    params: { type }
  })
}
