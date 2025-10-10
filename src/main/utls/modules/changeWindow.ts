import { BrowserWindow, dialog } from 'electron'

// 控制窗口状态 --最小化 --最大化 --关闭窗口
export const changeWindow = (val: string, mainWindow: BrowserWindow) => {
  switch (val) {
    case 'min':
      mainWindow.minimize()
      break
    case 'max':
      mainWindow.maximize()
      break
    case 'unMax':
      mainWindow.unmaximize()
      break
    case 'close':
      console.log('程序退出')
      mainWindow.close()
      break
  }
}

// 关闭退出程序
export const quitWindow = async (mainWindow: BrowserWindow) => {
  return await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: '提示',
    message: '确定要退出程序吗？',
    buttons: ['取消', '确定退出'],
    defaultId: 1, // 默认选中确定
    cancelId: 0,
    normalizeAccessKeys: true // 在Windows/Linux上可能会影响布局
  })
}
