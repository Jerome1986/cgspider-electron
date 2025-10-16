import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LoginResponse } from '@/types/Users'
import { createDefaultUserInfo } from '@/config/BaseInfo'

// 用户模块
export const useUserStore = defineStore(
  'user',
  () => {
    // 用户登录后返回的信息
    const userInfo = ref<LoginResponse>(createDefaultUserInfo())

    // 设置用户信息
    const setUserInfo = (value: LoginResponse): void => {
      console.log('setUserInfo', value)
      userInfo.value = { ...userInfo.value, ...value }
    }

    // 同步下载次数
    const setUserDownload = (value: number): void => {
      userInfo.value.dailyDownloadLimit = value
    }

    // 同步金币
    const setUserCoins = (value: number): void => {
      userInfo.value.coins = value
    }

    // 清空token
    const clearToken = (): LoginResponse => (userInfo.value = createDefaultUserInfo())

    return {
      userInfo,
      setUserInfo,
      clearToken,
      setUserDownload,
      setUserCoins
    }
  },
  {
    persist: true // 持久化
  }
)
