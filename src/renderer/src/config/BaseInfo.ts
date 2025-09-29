import type { LoginResponse } from '@/types/Users'

// 用户基础数据
export function createDefaultUserInfo(): LoginResponse {
  return {
    token: '',
    _id: '',
    username: '',
    role: 'user',
    status: 1,
    coins: 0,
    userAvatarUrl: '',
    createdAt: new Date(0).toISOString(),
    dailyDownloadLimit: 0,
    dailyDownloadsUsed: 0,
    lastDownloadDate: undefined,
    membershipExpiry: null,
    membershipType: 'free'
  }
}
