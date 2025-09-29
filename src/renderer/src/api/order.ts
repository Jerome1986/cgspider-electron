import { request } from '@/utils/request'
import { CreatePayOrderResult } from '@/types/Order'

/**
 * 支付并创建订单
 * /order-add
 * @param  user_id - 当前支付的用户id
 * @param  product_id - 当前支付的产品id
 */

export const payOrderApi = (user_id: string, product_id: string) => {
  return request<CreatePayOrderResult>({
    method: 'POST',
    url: '/order-add',
    data: { user_id, product_id }
  })
}
