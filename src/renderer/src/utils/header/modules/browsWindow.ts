import { ref } from 'vue'

// 窗口变化处理
const isMinAndMax = ref(true)
export const handleBrowWindowChange = (val: string) => {
  switch (val) {
    case 'min':
      window.electron.ipcRenderer.invoke('change-window', val)
      break
    case 'max':
      isMinAndMax.value = !isMinAndMax.value
      isMinAndMax.value ? (val = 'unMax') : (val = 'max')
      window.electron.ipcRenderer.invoke('change-window', val)
      break
    case 'close':
      window.electron.ipcRenderer.invoke('change-window', val)
      break
  }
}

// 置顶功能
export const isOnTop = ref(false)
export const toggleOnTop = async () => {
  try {
    const newState = !isOnTop.value
    // 根据主进程返回的结果更新状态
    isOnTop.value = await window.electron.ipcRenderer.invoke('toggle-on-top', newState)
  } catch (error) {
    console.error('置顶操作失败:', error)
    // 可以在这里添加用户提示
  }
}
