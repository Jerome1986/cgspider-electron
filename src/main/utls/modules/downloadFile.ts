import { BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import extractZip from 'extract-zip'

export type DownloadPayload = {
  url: string
  fileName?: string
  saveDir: string
  subDirs?: string[]
  materialId: string
}

// 简单清洗：移除 Windows 非法字符，避免写入失败
function sanitizeName(input: string): string {
  return (input || '').replace(/[\\/:*?"<>|\r\n]/g, '').trim() || 'unnamed'
}

// 目录清洗：统一分隔符并去掉尾随分隔符
function normalizeDir(dir: string): string {
  const raw = (dir || '').replace(/\//g, path.win32.sep)
  return path.win32.normalize(raw).replace(/[\\/]+$/, '')
}
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// 下载处理函数
export async function handleDownload(win: BrowserWindow, payload: DownloadPayload) {
  if (!win) return { ok: false, message: 'no active window' }
  if (!payload?.url) return { ok: false, message: 'no url' }
  if (!payload?.saveDir) return { ok: false, message: 'no saveDir' }

  const baseDir = normalizeDir(payload.saveDir)
  const subDirs = (payload.subDirs ?? []).map((s) => sanitizeName(s)).filter(Boolean)
  const finalDir = path.win32.join(baseDir, ...subDirs)
  const materialId = payload.materialId
  ensureDir(finalDir)

  win.webContents.session.once('will-download', (_event, item) => {
    const suggested = sanitizeName(item.getFilename())
    const finalPath = path.win32.join(finalDir, suggested)
    // 设置存储路径
    item.setSavePath(finalPath)

    // 确保目录存在
    const dir = path.win32.dirname(finalPath)
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      item.cancel()
      win.webContents.send('download-done', {
        state: 'interrupted',
        path: finalPath,
        name: path.win32.basename(finalPath),
        error: 'mkdir failed'
      })
      return
    }

    // 监听进度
    item.on('updated', (_e2, state) => {
      win.webContents.send('download-progress', {
        state,
        received: item.getReceivedBytes(),
        total: item.getTotalBytes(),
        name: suggested,
        materialId
      })
    })

    // 下载完成时
    item.once('done', async (_e3, state) => {
      // 先发送下载完成事件
      win.webContents.send('download-done', {
        state,
        path: finalPath,
        name: suggested,
        materialId
      })

      // 如果下载成功且是压缩文件，尝试解压
      if (state === 'completed') {
        const ext = path.extname(finalPath).toLowerCase()
        console.log('文件扩展名:', ext) // 调试用

        if (ext === '.zip') {
          // 只处理 .zip 文件
          // 创建同名文件夹作为解压目标
          const { dir, name } = path.parse(finalPath)
          const extractDir = path.win32.join(dir, name)

          // 确保解压目标目录存在
          try {
            ensureDir(extractDir)
            console.log('开始解压到:', extractDir) // 调试用

            await extractZip(finalPath, { dir: extractDir })
            console.log('解压成功') // 调试用

            win.webContents.send('unzip-done', {
              ok: true,
              path: finalPath,
              extractDir,
              materialId
            })
          } catch (err) {
            console.error('解压失败:', err) // 调试用
            win.webContents.send('unzip-done', {
              ok: false,
              error: String(err),
              path: finalPath,
              materialId
            })
          }
        }
      }
    })
  })

  // 注册 session.once('will-download', …)，再调用 downloadURL(url)，确保这次下载被你的监听捕获
  // 让指定窗口的 WebContents 启动对该 URL 的下载（不导航页面）
  win.webContents.downloadURL(payload.url)
  return { ok: true }
}
