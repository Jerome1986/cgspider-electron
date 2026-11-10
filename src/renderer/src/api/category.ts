import { request } from '@/utils/request'
import type { Category, CategoryWithChildren } from '@/types/CateItem'

/** 公开分类入口，保留客户端三级分类的直属子级读取方式。 */
export const categoryListGetApi = async (type: string, parentId: string | null = null) => {
  if (!parentId) return request<Category[]>({ url: '/cate-first', params: { pageType: type } })
  const result = await request<CategoryWithChildren[]>({
    url: '/cate-sub',
    params: { cateId: parentId }
  })
  return { ...result, data: result.data[0]?.subCategories ?? [] }
}
