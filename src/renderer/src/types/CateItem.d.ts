// 分类数据类型
export interface Category {
  /** 唯一标识 */
  _id: string
  /** 父级ID，如果没有，为NULL 自身就是父级 */
  parentId: string | null // 顶级分类 parentId=null
  /** 父级名称 */
  parentName?: string
  /** 当前分类分明 */
  name: string
  /** 分类英文名称 */
  en_name: string
  /** 所属页面类型 */
  type: string
  /** 所属层级 */
  level: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updateAt: Date
}
