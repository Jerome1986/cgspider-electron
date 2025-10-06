// 属性标签类型
export interface TagAittribuleItem {
  /** 唯一标识 */
  _id: string
  /** 标签名称 */
  name: string
  /** 标签英文 */
  en_name: string
  /** 是否被勾选 */
  isSelected?: boolean
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

// 颜色标签类型
export interface TagColorItem {
  /** 唯一标识 */
  _id: string
  /** 色值 */
  color: string
  /** 所属页面类型 */
  type: string
  /** 是否被选择 */
  isSelected: boolean
  /** 创建时间 */
  createdAt?: Date
  /** 更新时间 */
  updatedAt?: Date
}
