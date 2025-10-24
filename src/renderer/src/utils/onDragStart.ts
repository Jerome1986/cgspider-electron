// 定义store
import { useMaterialStore, usePageTypeStore } from '@/stores'
import { ElMessage } from 'element-plus'

const materialStore = useMaterialStore()
const pageTypeStore = usePageTypeStore()

// 处理拖拽
export const onDragStart = async (materialId: string) => {
  // 1.先判断当前素材是否为下载过的素材
  const isDownload = materialStore.isDownloaded(materialId)
  if (!isDownload) {
    ElMessage.error('当前文件还未下载')
    return
  }

  // 2.准备参数
  const basePath = materialStore.downLoadFilePathGet(materialId) // 对应文件的本地路径
  const fileType = pageTypeStore.currentPagePath.replace(/^\/+/, '') // 用正则去掉路径的/  获取类型
  let txtFile = '' // 拖拽过程中生成的临时文本文件名，用于存放“资源路径”给脚本读取
  switch (fileType) {
    case 'model':
      txtFile = 'moldata.txt'
      break
    case 'lighting':
      txtFile = 'iesdata.txt'
      break
    case 'material':
      txtFile = 'matdata.txt'
      break
  }
  console.log('Drag start', isDownload, basePath, fileType, txtFile)
  await window.electron.ipcRenderer.invoke('startDrag', basePath, fileType, txtFile)
}
