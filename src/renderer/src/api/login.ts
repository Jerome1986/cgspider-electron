import { request } from '@/utils/request'
import type { UserProfile } from '@/types/Users'
import { useUserStore } from '@/stores'
import { userIdInfoGetApi } from './user'

/**
 * 用户登录
 * /user-login
 * @param username - 用户名
 * @param password - 密码
 */
export const LoginApi = async (username: string, password: string) => {
  const result = await request<UserProfile>({
    method: 'POST',
    url: '/user-login',
    data: { username, password }
  })
  useUserStore().setUserInfo(result.data)
  const current = await userIdInfoGetApi()
  return { ...result, data: { ...current.data, token: result.data.token } }
}

/**
 * 用户注册
 * /user-register
 * @param username - 用户名
 * @param password - 密码
 */
export const registerApi = async (username: string, password: string) => {
  await request<{ _id: string; username: string }>({
    method: 'POST',
    url: '/user-register',
    data: { username, password }
  })
  return LoginApi(username, password)
}
