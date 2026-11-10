import { request } from '@/utils/request'
import type { LoginResponse, UserProfile, DownloadStatus } from '@/types/Users'

/** 当前身份由令牌确认，不再通过任意用户ID读取。 */
export const userIdInfoGetApi = async (_userId = '') => {
  const [info, quota] = await Promise.all([
    request<UserProfile>({ url: '/api/user-web-get' }),
    request<DownloadStatus>({ url: '/api/user-download-status' })
  ])
  const role = info.data.role
  const membershipType: LoginResponse['membershipType'] =
    role === 'permanent' ? 'permanent' : quota.data.member ? 'annual' : 'free'
  return {
    ...info,
    data: {
      ...info.data,
      membershipExpiry: info.data.endDate,
      membershipType,
      dailyDownloadsUsed: quota.data.dailyUsed
    }
  }
}
