/** cgs-api成功响应外壳，客户端保留该层而不重复解包。 */
export interface ApiResult<T> {
  /** 业务状态码 */
  code: number
  /** 提示信息 */
  message: string
  /** 业务数据 */
  data: T
  /** 旧搜索接口总数 */
  total?: number
}
/** 公开字典、商品与素材的分页响应。 */
export interface PageResult<T> {
  /** 当前页数据 */
  list: T[]
  /** 筛选后的总条数 */
  total: number
  /** 当前页码 */
  currentPage: number
  /** 每页条数 */
  pageSize: number
}
