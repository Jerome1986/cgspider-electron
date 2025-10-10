// 素材项类型
export interface MaterialItem {
  /** 唯一标识 (MongoDB _id) */
  _id: string
  /** 中文名或原始名 */
  name: string
  /** 英文名 */
  en_name: string
  /** 封面图地址 */
  cover_url: string
  /** 文件下载地址数组 */
  files_url: string
  /** 一级分类ID */
  top_id?: string
  /** 二级分类ID */
  sub_id?: string
  /** 三级分类ID */
  third_id?: string
  /** 分类路径 (例: "皮革/人造皮") */
  cate_path?: string
  /** 属性标签 (关键词集合) */
  aittributeTags?: string[]
  /** 颜色标签 (关键词集合) */
  colorTags?: string[]
  /** 分类类型 (例: "材质") */
  type: string
  /** 关键词 */
  keywords: string
  /** 状态 (1=启用, 0=禁用) */
  status?: number
  /** 创建时间 (ISO 格式) */
  createAt?: string
  /** 更新时间 (ISO 格式) */
  updateAt?: string
}

// 素材分页返回类型
export interface MaterialPageResult {
  list: MaterialItem[]
  total: number
  pageNum: number
  pageSize: number
  totalPage: number
}

// 素材收藏返回类型
export interface MaterialLoveResult {
  _id: string
  user_id: string
  material_id: string
}
