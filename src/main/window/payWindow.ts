import { BrowserWindow } from 'electron'
import { join } from 'path'
import icon from '../../../resources/icon.png?asset'
let payWin: BrowserWindow | null = null

// 创建或聚焦支付窗口
export function openPaymentWindow(payUrl?: string, parent?: BrowserWindow): BrowserWindow {
  // 已存在则聚焦并可更新地址
  if (payWin && !payWin.isDestroyed()) {
    if (payWin.isMinimized()) payWin.restore()
    payWin.focus()
    if (payUrl) payWin.loadURL(payUrl)
    return payWin
  }

  payWin = new BrowserWindow({
    width: 900,
    height: 680,
    show: false,
    icon: icon,
    autoHideMenuBar: true,
    parent,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  // 监听导航事件
  let status = 'cancel'
  payWin.webContents.on('did-navigate', (_, url) => {
    console.log('监听:', url)
    if (url === 'https://api.xunhupay.com/payments/home/success') {
      console.log('支付成功')
      status = 'success'

      setTimeout(() => {
        payWin?.close()
      }, 500)
    } else {
      status = 'cancel'
    }
  })

  payWin.on('ready-to-show', () => payWin?.show())
  // 监听窗口关闭
  payWin.on('closed', () => {
    // 发送消息到渲染进程
    parent?.webContents.send('payment-status', status)

    payWin = null
  })

  if (payUrl) {
    payWin.loadURL(payUrl)
  } else {
    // 如无外部地址，加载一个本地页面（按需替换为你的收银台页面）
    payWin.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return payWin
}
