import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguageStore = defineStore(
  'language',
  () => {
    // 语言切换 false-中文  true-英文
    const languageSwitch = ref(false)

    const setLanguageSwitch = (value: boolean) => {
      languageSwitch.value = value
    }

    return {
      languageSwitch,
      setLanguageSwitch
    }
  },
  {
    persist: true
  }
)
