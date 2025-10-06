import { request } from '@/utils/request'
import { Category } from '@/types/CateItem'

/**
 * 获取分类带分页
 * /web/cate/byId
 * @param type - 页面类型
 * @param pageNum - 页码
 * @param pageSize - 条数
 * @param parentId - 父级ID
 */
export const categoryListGetApi = (type: string, parentId: string | null = null) => {
  return request<Category[]>({
    method: 'GET',
    url: '/web/cate/byId',
    params: { type, parentId }
  })
}
