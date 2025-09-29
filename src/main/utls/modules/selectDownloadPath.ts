import { app, BrowserWindow, dialog } from 'electron'

// 在当前交互窗口打开dialog 选择路径 ---- 选择下载路径函数
export const selectDownloadPath = async (mainWindow: BrowserWindow) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '选择下载路径',
      buttonLabel: '选择文件夹',
      defaultPath: app.getPath('downloads')
    })

    if (result.canceled) {
      return null
    }
    return result.filePaths[0]
  } catch (error) {
    console.error('Error in select-download-path:', error)
    throw error
  }
}
