import type { BrowserWindow } from 'electron'
import fs from 'node:fs'
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import extractZip from 'extract-zip'
import type { AuthorizedFile, DownloadResult } from '../../../shared/download'

/** 来自服务端授权的下载任务；不接收素材列表中的原始URL。 */
export interface DownloadPayload {
  /** 后端根地址 */
  apiBase: string
  /** 当前登录令牌 */
  authorization: string
  /** 下载根目录 */
  saveDir: string
  /** 素材编号 */
  materialId: string
  /** 素材名称 */
  name: string
  /** 素材类型 */
  type: string
  /** 服务端签发的全部文件 */
  files: AuthorizedFile[]
}
const safeName = (value: string): string =>
  value
    .split('')
    .filter((char) => char.charCodeAt(0) >= 32)
    .join('')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[. ]+$/, '')
    .slice(0, 100) || 'material'

/** 校验本机路径有实际文件，不把空目录与.part文件当作下载完成。 */
export const hasLocalFiles = async (target: string): Promise<boolean> => {
  try {
    const info = await fsp.lstat(target)
    if (info.isSymbolicLink()) return false
    if (info.isFile()) return !target.endsWith('.part')
    if (!info.isDirectory()) return false
    for (const row of await fsp.readdir(target, { withFileTypes: true })) {
      if (row.isSymbolicLink()) continue
      if (row.isFile() && !row.name.endsWith('.part')) return true
      if (row.isDirectory() && (await hasLocalFiles(path.join(target, row.name)))) return true
    }
  } catch {
    /* 路径删除或不可访问时判定为本机无文件。 */
  }
  return false
}

/** 流式保存全部授权文件后返回结果，失败不写下载完成历史。 */
export const handleDownload = async (win: BrowserWindow, payload: DownloadPayload): Promise<DownloadResult> => {
  const { apiBase, authorization, saveDir, materialId, name, type, files } = payload
  const origin = new URL(apiBase).origin
  if (!['https://api.topcg.top', 'http://localhost:3000', 'http://127.0.0.1:3000'].includes(origin))
    throw new Error('下载后端地址无效')
  if (
    !authorization ||
    !path.isAbsolute(saveDir) ||
    !/^[1-9]\d*$/.test(materialId) ||
    !Array.isArray(files) ||
    !files.length ||
    files.length > 100
  )
    throw new Error('下载参数无效')
  const tasks = files.map((file) => {
    const url = new URL(file.path, origin)
    if (
      url.origin !== origin ||
      url.pathname !== '/api/user-download-file' ||
      url.searchParams.get('material_id') !== materialId
    )
      throw new Error('下载路径不是当前素材授权入口')
    return { url, name: safeName(file.name) }
  })
  const directory = path.join(saveDir, safeName(type), safeName(name) + '_' + materialId + '_' + randomUUID())
  await fsp.mkdir(directory, { recursive: true })
  for (const [index, task] of tasks.entries()) {
    const target = path.join(directory, String(index + 1).padStart(3, '0') + '_' + task.name)
    const temporary = target + '.part'
    try {
      let response = await fetch(task.url, {
        headers: { Authorization: authorization, 'X-CGS-Direct-Download': '1', 'Accept-Encoding': 'identity' },
        redirect: 'manual'
      })
      if (response.status === 307) {
        const location = new URL(response.headers.get('location') || '')
        await response.body?.cancel()
        if (
          location.origin !== 'https://download.topcg.top' ||
          !/^\/materials\/[a-f0-9-]{36}\.[a-z0-9]{1,12}$/.test(location.pathname) ||
          !location.searchParams.has('q-signature')
        )
          throw new Error('云存储授权地址无效')
        // 跨域只发送签名地址，不转发用户Authorization。
        response = await fetch(location, { redirect: 'error' })
      }
      if (response.status !== 200 || response.headers.has('content-range') || !response.body) {
        await response.body?.cancel()
        throw new Error('下载失败（HTTP ' + response.status + '），可复用原授权重试')
      }
      const encoding = response.headers.get('content-encoding')
      const total = !encoding || encoding === 'identity' ? Number(response.headers.get('content-length')) : 0
      const digest = response.headers.get('x-cos-meta-sha256')
      const hash = digest ? createHash('sha256') : null
      let received = 0
      const meter = new Transform({
        transform(chunk, _encoding, callback) {
          received += chunk.length
          hash?.update(chunk)
          if (!win.isDestroyed())
            win.webContents.send('download-progress', {
              materialId,
              received,
              total,
              fileIndex: index + 1,
              fileTotal: tasks.length
            })
          callback(null, chunk)
        }
      })
      await pipeline(
        Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
        meter,
        fs.createWriteStream(temporary, { flags: 'wx' })
      )
      if (total && total !== received) throw new Error('文件内容不完整，请重试')
      if (hash && hash.digest('hex') !== digest) throw new Error('文件校验失败，请重试')
      if (path.extname(target).toLowerCase() === '.zip') {
        // extract-zip校验越界路径；先在独立临时目录解压，成功后才发布。
        const staging = target + '.unpacking'
        const extracted = target.slice(0, -4)
        await extractZip(temporary, {
          dir: staging,
          onEntry(entry) {
            if (((entry.externalFileAttributes >>> 16) & 0xf000) === 0xa000) throw new Error('压缩包不允许符号链接')
          }
        })
        await fsp.rename(staging, extracted)
      }
      await fsp.rename(temporary, target)
    } catch (error) {
      await fsp.unlink(temporary).catch(() => {})
      throw error
    }
  }
  return { ok: true, directory }
}
