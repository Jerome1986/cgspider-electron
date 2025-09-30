import { request } from '@/utils/request'
import { Category } from '@/types/CateItem'

/**
 * 获取分类
 * /cate-first
 * @param pageType
 */
export const categoryListGetApi = (pageType: string) => {
  return request<Category[]>({
    method: 'GET',
    url: '/cate-first',
    params: { pageType }
  })
}
