import { useUserStore } from '@/stores'
import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { isAxiosError } from 'axios'

// 基地址（优先环境变量，其次 /api 代理）
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

// 返回数据类型
type Data<T> = {
  code: number
  message: string
  data: T
}

function safeShowMessage(msg?: string) {
  if (!msg || !msg.trim()) return
  ElMessage({
    type: 'error',
    message: msg,
    duration: 2000,
    grouping: true
  })
}

// 错误信息提取
function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || '服务异常'
  }
  // if (error instanceof Error) {
  //   return error.message
  // }
  // return '服务异常'
}

// 请求函数
export const request = async <T>(options: AxiosRequestConfig): Promise<Data<T>> => {
  const userStore = useUserStore()

  const config: AxiosRequestConfig = {
    ...options,
    url: options.url && !/^https?:\/\//i.test(options.url) ? baseURL + options.url : options.url,
    timeout: 10000,
    headers: {
      ...(options.headers || {}),
      'source-client': 'admin-web',
      ...(userStore.token ? { Authorization: userStore.token } : {})
    },
    validateStatus: () => true // axios 不拦截，交给我们自己处理
  }

  try {
    const res: AxiosResponse<Data<T>> = await axios.request<Data<T>>(config)
    const { status, data } = res

    // 先判断 HTTP 状态
    if (status >= 500) {
      const msg = data?.message || '服务器开小差了'
      safeShowMessage(msg)
      throw new Error(msg)
    }

    // 业务状态判断
    if (!data || data.code !== 200) {
      const msg = data?.message || '请求错误'

      // 401 未登录/过期
      if (data?.code === 401 || status === 401) {
        userStore.clearToken()
        await router.push('/login')
      }

      safeShowMessage(msg)
      throw new Error(msg)
    }

    // 一切正常
    return data
  } catch (error) {
    const msg = getErrorMessage(error)
    safeShowMessage(msg)
    throw new Error(msg)
  }
}

export { baseURL, getErrorMessage }
