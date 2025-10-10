// 创建虎椒支付订单返回数据类型
export interface CreatePayOrderResult {
  /** 订单号 */
  order_id: string
  /** 扫码支付链接 */
  pay_url: string
}
