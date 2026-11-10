import type { AuthorizedFile } from '../../../shared/download'

/** 素材展示项，公开列表不包含可直接下载的原始文件地址。 */
export interface MaterialItem {
  /** 服务端整数编号序列化为字符串 */
  _id: string
  /** 中文名或原始名 */
  name: string
  /** 英文名 */
  en_name: string
  /** 封面图地址 */
  cover_url: string
  /** 文件下载地址数组 */
  files_url: string | string[]
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

/** 素材分页返回类型。 */
export interface MaterialPageResult {
  /** 当前页素材 */
  list: MaterialItem[]
  /** 同筛选条件下素材总数 */
  total: number
  /** 当前页码 */
  currentPage: number
  /** 每页条数 */
  pageSize: number
  /** 匹配素材中的属性标签 */
  tags: string[]
  /** 匹配素材中的颜色 */
  colors: string[]
}

// 素材收藏返回类型
export interface MaterialLoveResult {
  /** 唯一标识 */
  _id: string
  /** 用户ID */
  user_id: string
  /** 对应素材ID */
  material_id: string
}

// 素材下载列表类型
export interface MaterialDownLoad {
  /** 唯一标识 */
  _id: string
  /** 用户ID */
  user_id: string
  /** 对应素材ID */
  material_id: string
  /** 用户对应下载素材本地的保存路径--用于后期点击直接打开文件 */
  file_path: string
}

/** 服务端下载授权，不包含可绕过身份验证的原始文件地址。 */
export interface DownloadGrant {
  /** 授权编号 */
  grantId: string
  /** 是否复用原授权 */
  reused: boolean
  /** 当前金币 */
  coins: number
  /** 全部文件的认证下载路径与文件名 */
  files: AuthorizedFile[]
}
