// 监听下载进度函数
import { materialDownLoadListApiAdd } from '@/api/material'
import { useMaterialStore, useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const materialStore = useMaterialStore()

export const onProgress = (_e, p: { materialId: string; received: number; total: number }) => {
  materialStore.setDownloadProgress(p.materialId, p.received, p.total)
}

interface Done {
  state: 'completed' | 'cancelled' | 'interrupted'
  path: string
  name: string
  materialId: string
  error?: string
}

// 下载完成
export async function onDone(_, p: Done) {
  // 添加到下载列表
  await materialDownLoadListApiAdd(userStore.userInfo._id, p.materialId, p.path)
  if (p.state === 'completed') {
    //  下载成功给与提示并重新获取下载列表刷新状态

    await materialStore.downLoadListGet(userStore.userInfo._id)
    setTimeout(() => ElMessage.success('下载成功'), 500)
  }
  materialStore.clearDownloadProgress(p.materialId)
}
