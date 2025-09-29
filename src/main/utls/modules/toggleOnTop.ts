import { BrowserWindow } from 'electron'

// 切换窗口指定该
export const toggleOnTop = (isOnTop: boolean) => {
  // 获取当前交互的窗口 (确保操作的是用户当前交互的窗口)  PS:也可以直接使用 mainWindow 处理
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    win.setAlwaysOnTop(isOnTop)
    return isOnTop // 返回设置后的状态
  }
  return false // 当没有窗口时返回false
}
