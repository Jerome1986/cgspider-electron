import { BrowserWindow } from 'electron'

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
      mainWindow.close()
      break
  }
}
