// 监听下载进度函数
import { downloadVerifyApi, materialDownLoadListApiAdd } from '@/api/material'
import { useMaterialStore, useUserStore } from '@/stores'

// 定义store
const userStore = useUserStore()
const materialStore = useMaterialStore()

// 设顶指定素材的下载进度
export const onProgress = (_e, p: { materialId: string; received: number; total: number }) => {
  // console.log('onProgress', p.received)
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
  console.log('onDone', p.path)
  // 添加到下载列表
  await materialDownLoadListApiAdd(userStore.userInfo._id, p.materialId, p.path)
  if (p.state === 'completed') {
    //  下载成功给与提示并重新获取下载列表刷新状态
    await materialStore.downLoadListGet(userStore.userInfo._id)
  }
  materialStore.clearDownloadProgress(p.materialId)
}

// 下载前验证函数
export const downloadVerify = async (materialId: string, userId: string) => {
  const isDownloaded = materialStore.isDownloaded(materialId)
  if (!isDownloaded) {
    // 验证并更新次数/金币
    const res = await downloadVerifyApi(userId)
    console.log('downloadVerify', res)
    // 失败错误已经在后端处理，前端通过axios自动返回错误
    // 成功返回--更新store
    res.data.type === 'limit'
      ? userStore.setUserDownload(res.data.resultLimit!)
      : userStore.setUserCoins(res.data.newCoins!)
  }
}
