import { request } from '@/utils/request'
import type { ProductItem } from '@/types/ProductItem'

/**
 * 获取产品列表
 */
export const productsGetApi = () => {
  return request<ProductItem[]>({
    method: 'GET',
    url: '/api/products-get'
  })
}
