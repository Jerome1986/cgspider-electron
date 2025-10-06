import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuList } from '@/config/menu'

export const usePageTypeStore = defineStore(
  'pageType',
  () => {
    // 当前页面类型
    const currentPageType = ref('')

    // 当前页面路径
    const currentPagePath = ref('')

    // 设置当前页面类型
    const setCurrentPageType = (path: string) => {
      switch (path) {
        case '/model':
          currentPageType.value = '模型'
          break
        case '/maps':
          currentPageType.value = '贴图'
          break
        case '/lighting':
          currentPageType.value = '灯光'
          break
        case '/material':
          currentPageType.value = '材质'
          break
        default:
          currentPageType.value = menuList[0].name
          break
      }
    }
    // 设置当前页面路径
    const setCurrentPagePath = (page: string) => {
      currentPagePath.value = page
    }

    return {
      currentPageType,
      setCurrentPageType,
      currentPagePath,
      setCurrentPagePath
    }
  },
  {
    persist: true
  }
)
