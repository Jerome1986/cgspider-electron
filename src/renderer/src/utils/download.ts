import { downloadVerifyApi, materialDownLoadListApiAdd } from '@/api/material'
import { userIdInfoGetApi } from '@/api/user'
import { baseURL } from '@/utils/request'
import { useMaterialStore, useUserStore } from '@/stores'
import type { MaterialItem } from '@/types/Material'
import { ElMessage } from 'element-plus'
import type { DownloadResult } from '../../../shared/download'

const busy = new Set<string>()
/** 原生进程逐文件下载进度。 */
export const onProgress = (_event: unknown, progress: { materialId: string; received: number; total: number }) => {
  useMaterialStore().setDownloadProgress(progress.materialId, progress.received, progress.total)
}
/** 下载授权由服务端幂等扣费；所有文件落盘后确认历史，本地路径只留在本机。 */
export const downloadMaterial = async (item: MaterialItem) => {
  const user = useUserStore(),
    material = useMaterialStore()
  const token = user.userInfo.token,
    owner = user.userInfo._id
  if (!token || busy.has(item._id)) return
  busy.add(item._id)
  try {
    const grant = await downloadVerifyApi(item._id)
    if (user.userInfo.token !== token) return
    user.setUserCoins(grant.data.coins)
    const { usePathStore } = await import('@/stores')
    const result: DownloadResult = await window.electron.ipcRenderer.invoke('download-file', {
      apiBase: baseURL,
      authorization: token,
      saveDir: usePathStore().downloadPath,
      materialId: item._id,
      name: item.name,
      type: item.type,
      files: grant.data.files
    })
    if (user.userInfo.token !== token) return
    if (!result.ok) throw new Error(result.message || '下载失败，可使用原授权重试')
    material.rememberLocal(item._id, result.directory)
    await materialDownLoadListApiAdd(owner, item._id, result.directory)
    await material.downLoadListGet(owner)
    ElMessage.success('全部文件下载完成')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '下载失败，可复用原授权重试')
  } finally {
    busy.delete(item._id)
    material.clearDownloadProgress(item._id)
    if (user.userInfo.token === token) {
      try {
        const current = await userIdInfoGetApi()
        if (user.userInfo.token === token) user.setUserInfo(current.data)
      } catch {
        /* 请求工具已统一提示，原授权在重试时继续复用。 */
      }
    }
  }
}
