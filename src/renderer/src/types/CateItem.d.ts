/** 公开分类接口的兼容字段。 */
export interface Category {
  /** 唯一标识 */
  _id: string
  /** 父级ID，如果没有，为NULL 自身就是父级 */
  parent_id: string | null
  /** 当前分类分明 */
  name: string
  /** 分类英文名称 */
  en_name: string
  /** 所属页面类型 */
  type: string
  /** 排序值 */
  sort: number
}

/** 公开子分类接口保留父分类与直属子级数组。 */
export interface CategoryWithChildren extends Category {
  /** 直属子分类 */
  subCategories: Category[]
}
