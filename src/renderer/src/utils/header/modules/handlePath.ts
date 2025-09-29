// 选择路径
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { usePathStore } from '@/stores'

const pathStore = usePathStore()

export const currentPath = ref(pathStore.downloadPath ?? 'D:\\') // 当前选择的路径
export const handleSelectPath = async () => {
  const path = await window.electron.ipcRenderer.invoke('select-download-path')
  if (!path) return
  console.log('选择事件', path)
  currentPath.value = path
}

// 保存路径
export const handleSavePath = () => {
  if (!currentPath.value) {
    ElMessage({
      message: '请先选择下载路径',
      type: 'warning'
    })
    return
  }

  pathStore.setDownloadPath(currentPath.value)

  ElMessage({
    message: '下载路径设置成功',
    type: 'success'
  })

  pathStore.setPathDialog(false)
}
