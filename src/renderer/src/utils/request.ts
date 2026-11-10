import { useUserStore } from '@/stores'
import axios, { isAxiosError } from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig } from 'axios'
import type { ApiResult } from '@/types/Api'

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const messageText = (value: unknown): string =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').join('；')
    : typeof value === 'string'
      ? value
      : '网络连接失败，请稍后重试'
export const getErrorMessage = (error: unknown): string =>
  isAxiosError(error)
    ? messageText(error.response?.data?.message || error.message)
    : error instanceof Error
      ? error.message
      : messageText(error)

export const request = async <T>(options: AxiosRequestConfig): Promise<ApiResult<T>> => {
  const user = useUserStore()
  const token = user.userInfo.token
  try {
    const response = await axios.request<ApiResult<T>>({
      ...options,
      baseURL,
      timeout: 30000,
      paramsSerializer: { indexes: null },
      headers: { ...options.headers, ...(token ? { Authorization: token } : {}) }
    })
    if (response.data?.code !== 200) throw new Error(messageText(response.data?.message))
    return response.data
  } catch (error) {
    // 旧账号请求的401不得清理后来登录的新身份。
    if (isAxiosError(error) && error.response?.status === 401 && token && user.userInfo.token === token) {
      user.clearToken()
      if (router.currentRoute.value.path !== '/login') await router.replace('/login')
    }
    ElMessage({ type: 'error', message: getErrorMessage(error), grouping: true })
    throw error
  }
}
export { baseURL }
