import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePathStore = defineStore(
  'path',
  () => {
    // 显示下载路径弹框
    const showPathDialog = ref(false)

    // 设置路径弹框的显示状态
    const setPathDialog = (val: boolean) => {
      showPathDialog.value = val
    }

    // 默认下载路径
    const downloadPath = ref('未设置')

    // 设置下载路径
    const setDownloadPath = (path: string) => {
      downloadPath.value = path
      localStorage.setItem('downloadPath', path)
    }

    // 清除下载路径
    const closeDownloadPath = () => {
      downloadPath.value = '未设置'
      localStorage.removeItem('downloadPath')
    }

    return {
      showPathDialog,
      setPathDialog,
      downloadPath,
      setDownloadPath,
      closeDownloadPath
    }
  },
  {
    persist: true
  }
)
