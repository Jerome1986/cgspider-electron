/** 当前服务端尚未提供支付下单；禁止请求旧支付服务。 */
export const payOrderApi = async (_userId: string, _productId: string): Promise<never> => {
  throw new Error('充值购买暂未开放')
}
