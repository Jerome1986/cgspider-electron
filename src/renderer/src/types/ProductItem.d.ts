export interface ProductItem {
  /** 产品唯一标识符 */
  _id: string
  /** 产品类型 */
  productType: string
  /** 产品名称（中文） */
  productName: string
  /** 产品英文名称（可选） */
  en_name?: string
  /** 产品价格（单位：分） */
  price: number
  /** 金币数量 */
  goldCoinsAmount: number
  /** 会员类型 */
  membershipType: string
  /** 每日下载限制 */
  dailyDownloadLimit: string
  /** 产品描述（中文） */
  description: string
  /** 产品英文描述（可选） */
  en_description?: string
  /** 产品英文类型（可选） */
  en_productType?: string
  /** 产品状态 */
  isActive: boolean
}
