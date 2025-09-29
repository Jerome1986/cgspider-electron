import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { changeWindow, selectDownloadPath, toggleOnTop } from '@main/utls'

function createWindow(): void {
  // 创建浏览器窗口。
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 处理窗口鼠标按住移动---拖拽效果
  ipcMain.handle('custom-adsorption', (_, res) => {
    mainWindow.setPosition(res.appX, res.appY)
  })

  // 处理窗口缩小放大和关闭
  ipcMain.handle('change-window', (_, val) => changeWindow(val, mainWindow))

  // 处理窗口置顶
  ipcMain.handle('toggle-on-top', (_, isOnTop) => toggleOnTop(isOnTop))

  // 添加选择文件夹处理
  ipcMain.handle('select-download-path', () => selectDownloadPath(mainWindow))

  // 显示主窗口
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 外部链接处理-- action: 'deny'   点击链接通过浏览器打开，而不是通过electron打开
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then((r) => console.log(r))
    return { action: 'deny' }
  })

  // 使用 electron-vite CLI 为渲染进程启用 HMR。
  // 开发环境加载远程 URL，生产环境加载本地 HTML 文件。
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then((r) => console.log(r))
    mainWindow.webContents.openDevTools()
    console.log(is)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).then((r) => console.log(r))
  }
}

// 当 Electron 初始化完成
// 并准备创建浏览器窗口时会调用此方法。
// 某些 API 只能在此事件发生后使用。
app.whenReady().then(() => {
  // 为 Windows 设置应用的 user model id
  electronApp.setAppUserModelId('com.electron')

  // 在开发环境中通过 F12 默认打开或关闭 DevTools
  // 在生产环境中忽略 CommandOrControl + R
  // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // 在 macOS 上，当点击 Dock 图标且没有其他窗口打开时
    // 通常会在应用内重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口都关闭时退出应用，macOS 除外。
// 在 macOS 上，通常会保持应用及其菜单栏处于活动状态，
// 直到用户按下 Cmd + Q 显式退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 你可以在此文件中编写应用特定的主进程代码。
// 也可以把它们放到独立文件中并在这里引入。
