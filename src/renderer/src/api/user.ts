import { request } from '@/utils/request'
import { LoginResponse } from '@/types/Users'

/**
 * 根据用户id获取用户信息
 * /userById
 * @param userId - 用户id
 */
export const userIdInfoGetApi = (userId: string) => {
  return request<LoginResponse>({
    method: 'GET',
    url: '/userById',
    params: { userId }
  })
}

/**
 * /vipEndTime
 * @param userId - 用户ID
 */
export const vipEndTimePutApi = (userId: string) => {
  return request({
    method: 'POST',
    url: '/vipEndTime',
    params: { userId }
  })
}
