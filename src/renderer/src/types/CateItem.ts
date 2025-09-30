/** 一级分类/父类 */
export interface Category {
  /** 分类唯一标识 */
  _id?: string
  /** 分类名称 */
  name: string
  /** 英文名称 */
  en_name: string
  /** 分类类型，例如材质/颜色等 */
  type: string
  /** 父分类ID，一级分类为 null */
  parentId: string | null
  /** 排序权重 */
  sort: number
  /** 子分类列表（二级） */
  subCategories?: SubCategory[]
}

/** 第三级分类/孙类（最小字段集，方便渲染；其余字段可按需扩展） */
export interface ThirdCategory {
  /** 三级唯一标识 */
  _id: string
  /** 名称 */
  name: string
  /** 英文名称（可选） */
  en_name?: string
  /** 父级二级 id（可选，用于链路追踪） */
  parent_id?: string
  /** 排序（可选） */
  sort?: number
  /** 类型（可选） */
  type?: string
}

/** 二级分类/子类 */
export interface SubCategory {
  /** 子分类唯一标识 */
  _id: string
  /** 父分类ID */
  parent_id: string
  /** 父分类名称 */
  parent_name: string
  /** 子分类名称 */
  name: string
  /** 英文名称 */
  en_name: string
  /** 分类类型，例如材质/颜色等 */
  type: string
  /** 排序权重 */
  sort: number
  /** 三级分类列表（可选） */
  subCategories?: ThirdCategory[]
}
