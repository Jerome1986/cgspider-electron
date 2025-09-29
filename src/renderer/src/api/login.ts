import { request } from '@/utils/request'
import { LoginResponse } from '@/types/Users'

/**
 * 用户登录
 * /user-login
 * @param username - 用户名
 * @param password - 密码
 */
export const LoginApi = (username: string, password: string) => {
  return request<LoginResponse>({
    method: 'POST',
    url: '/user-login',
    data: { username, password }
  })
}

/**
 * 用户注册
 * /user-register
 * @param username - 用户名
 * @param password - 密码
 */
export const registerApi = (username: string, password: string) => {
  return request<LoginResponse>({
    method: 'POST',
    url: '/user-register',
    data: { username, password }
  })
}
