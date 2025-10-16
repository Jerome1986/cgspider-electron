// types/user.ts

// 用户角色类型
export type UserRole = 'admin' | 'user' | 'vip'

// 用户状态类型
export type UserStatus = 0 | 1 // 0: 禁用, 1: 启用

// 会员类型-annual年费会员 permanent-永久会员 free-非会员
export type MembershipType = 'annual' | 'permanent' | 'free'

// 登录成功响应接口
export interface LoginResponse {
  /** JWT 认证令牌，用于后续接口鉴权 */
  token?: string
  /** MongoDB 唯一标识符 */
  _id: string
  /** 用户名，用于登录和显示 */
  username: string
  /** 用户角色，决定权限等级 */
  role: UserRole
  /** 用户状态：0-禁用，1-启用 */
  status: UserStatus
  /** 用户拥有的硬币数量，用于消费 */
  coins: number
  /** 用户头像的 URL 地址 */
  userAvatarUrl: string
  /** 用户账号创建时间 */
  createdAt: string | Date
  /** 每日下载限制次数 */
  dailyDownloadLimit: number
  /** 今日已使用的下载次数 */
  dailyDownloadsUsed: number
  /** 最后一次下载时间，新用户可能没有下载记录 */
  lastDownloadDate?: string | Date
  /** 会员到期时间 */
  membershipExpiry: string | Date | null
  /** 会员类型，决定权限和限制 */
  membershipType: MembershipType
}

export interface updateDownloadInfo {
  /** 本次更新的类型 */
  type: 'limit' | 'coins'
  /** 更新后的可下载次数 */
  resultLimit?: number
  /** 更新后的可用的金币数量 */
  newCoins?: number
}
