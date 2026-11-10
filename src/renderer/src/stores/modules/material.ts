import { createQueryCache } from '@/utils/queryCache'
import type { MaterialPageResult } from '@/types/Material'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import { useCategoryStore } from './category'
import { useTagStore } from './tags'
import { MaterialDownLoad, MaterialItem, MaterialLoveResult } from '@/types/Material'
import { materialDownLoadListApiGet, materialListGetApi, materialListLoveGetApi } from '@/api/material'

export const useMaterialStore = defineStore(
  'material',
  () => {
    const listCache = createQueryCache<MaterialPageResult>()
    const loading = ref<boolean>(true)
    // 本地路径仅按当前账号保存，不再从服务端下载历史推断“本机有”。
    const localDownloads = ref<Record<string, Record<string, string>>>({})
    const rememberLocal = (id: string, filePath: string) => {
      const owner = useUserStore().userInfo._id
      localDownloads.value[owner] = { ...localDownloads.value[owner], [id]: filePath }
    }
    const localMaterialIds = async () => {
      const owner = useUserStore().userInfo._id
      const rows = Object.entries(localDownloads.value[owner] ?? {})
      const valid: string[] = []
      // 分批并行检查，避免逐条IPC阻塞，也限制同时发送的请求数。
      for (let offset = 0; offset < rows.length; offset += 8) {
        const batch = rows.slice(offset, offset + 8)
        const exists = await Promise.all(
          batch.map(([, path]) => window.electron.ipcRenderer.invoke('path-exists', path))
        )
        batch.forEach(([id, path], index) => {
          if (exists[index]) valid.push(id)
          else if (localDownloads.value[owner]?.[id] === path) delete localDownloads.value[owner][id]
        })
      }
      return valid
    }
    const keyword = ref('')
    let requestVersion = 0
    const clearSession = () => {
      requestVersion++
      listCache.clear()
      materialList.value = []
      materialTotal.value = 0
      materialLoveList.value = []
      downLoadList.value = []
      keyword.value = ''
      loading.value = false
    }
    // 是否勾选下载和收藏
    const collect = ref(false)
    const download = ref(false)
    const setCollect = (val: boolean) => {
      collect.value = val
    }
    const setDownload = (val: boolean) => {
      download.value = val
    }
    const checkListFilter = ref([]) // 筛选组 放入store，防止刷新后状态丢失
    // 统一设置分页
    const materialTotal = ref(0)
    const pageNum = ref(1)
    const pageSize = ref(10)
    const setPageNum = (num: number) => (pageNum.value = num)
    const setPageSize = (size: number) => (pageSize.value = Math.max(1, Math.min(100, size)))
    // 请求素材列表
    const materialList = ref<MaterialItem[]>([])
    const materialListFilterGet = async (
      type: string,
      top_id: string,
      sub_id: string,
      third_id: string,
      aittributeTags: string[],
      colorTags: string[],
      isDownloaded: boolean,
      isLoved: boolean,
      user_id: string
    ) => {
      const version = ++requestVersion
      loading.value = true
      try {
        const page = pageNum.value
        const size = Math.min(100, pageSize.value)
        const search = keyword.value
        const load = async () =>
          (
            await materialListGetApi(
              type,
              top_id,
              sub_id,
              third_id,
              aittributeTags,
              colorTags,
              isDownloaded,
              isLoved,
              user_id,
              page,
              size,
              search
            )
          ).data
        // 收藏与本机文件筛选读取实时状态，普通列表缓存按账号隔离。
        const key = JSON.stringify([
          user_id,
          type,
          top_id,
          sub_id,
          third_id,
          [...aittributeTags].sort(),
          [...colorTags].sort(),
          page,
          size,
          search
        ])
        const data = isDownloaded || isLoved ? await load() : await listCache.get(key, load)
        if (version !== requestVersion) return
        materialList.value = data.list
        materialTotal.value = data.total
      } catch (error) {
        if (version === requestVersion) {
          materialList.value = []
          materialTotal.value = 0
        }
        console.error(error)
      } finally {
        if (version === requestVersion) loading.value = false
      }
    }

    // 是否显示素材文本
    const showText = ref(false)

    // 获取素材的收藏列表
    const materialLoveList = ref<MaterialLoveResult[]>()
    const materialLoveListGet = async (userId: string) => {
      if (!useUserStore().userInfo.token) {
        materialLoveList.value = []
        return
      }
      const res = await materialListLoveGetApi(userId)
      if (useUserStore().userInfo._id === userId) materialLoveList.value = res.data
    }

    // 筛选里是否勾选已收藏
    const filterLove = ref(false)
    const setFilterLove = (love: boolean) => {
      filterLove.value = love
    }

    // 前端是否显示收藏的UI状态函数
    const isLove = (materialId: string): boolean => {
      if (!materialLoveList.value?.length) return true

      const love = materialLoveList.value.some((item) => item.material_id === materialId)
      // console.log('是否收藏', love)
      return !love
    }

    // 获取下载列表
    const downLoadList = ref<MaterialDownLoad[]>([])
    const downLoadListGet = async (userId: string) => {
      if (!useUserStore().userInfo.token) {
        downLoadList.value = []
        return
      }
      const res = await materialDownLoadListApiGet(userId)
      if (useUserStore().userInfo._id !== userId) return
      const localIds = await localMaterialIds()
      if (useUserStore().userInfo._id !== userId) return
      downLoadList.value = localIds.map((id) => ({
        _id: res.data.find((row) => row.material_id === id)?._id ?? id,
        user_id: userId,
        material_id: id,
        file_path: localDownloads.value[userId][id]
      }))
    }

    // 返回当前用户对应素材的下载路径
    const downLoadFilePathGet = (materialId: string): string => {
      const item = downLoadList.value.find((item) => item.material_id === materialId)
      console.log('打开', item?.file_path)
      return item?.file_path || '' // 找不到就返回空字符串，避免 undefined
    }

    // 前端是否显示下载的UI状态函数
    const isDownloaded = (materialId: string): boolean => {
      if (!downLoadList.value?.length) return false
      // console.log('是否下载', downLoad)
      return downLoadList.value.some((item) => item.material_id === materialId)
    }

    // 显示下载进度UI
    /**
     * 存储每个素材的下载进度百分比
     * key: 素材ID (materialId)
     * value: 下载进度百分比 (0-100)
     */
    const downloadPctMap = ref<Record<string, number>>({})

    /**
     * 设置指定素材的下载进度
     * @param id 素材ID
     * @param received 已接收的字节数
     * @param total 总字节数
     * @returns 如果total为0，返回0；否则返回undefined
     */
    const setDownloadProgress = (id: string, received: number, total: number): number | void => {
      if (!total) return (downloadPctMap.value[id] = 0)
      downloadPctMap.value[id] = Math.min(100, Math.round((received / total) * 100))
    }

    /**
     * 清除指定素材的下载进度
     * @param id 素材ID
     */
    const clearDownloadProgress = (id: string) => {
      delete downloadPctMap.value[id]
    }

    /**
     * 获取指定素材的下载进度百分比
     * @param id 素材ID
     * @returns 下载进度百分比，如果不存在则返回0
     */
    const getPct = (id: string) => downloadPctMap.value[id] ?? 0

    /**
     * 判断是否显示指定素材的下载进度UI
     * @param id 素材ID
     * @returns 当进度大于0且小于100时返回true，表示下载中
     */
    const isDownShow = (id: string) => {
      const pct = downloadPctMap.value[id]
      return pct > 0 && pct < 100
    }

    // 根据关键词搜索素材
    const searchKeywords = async (pageType: string, searchValue: string) => {
      keyword.value = searchValue.trim()
      const category = useCategoryStore(),
        tags = useTagStore()
      await materialListFilterGet(
        pageType,
        category.currentCateId,
        category.currentSubCateId,
        category.currentThirdCateId,
        tags.selectedAittribuleIds,
        tags.selectedColorIds,
        download.value,
        collect.value,
        useUserStore().userInfo._id
      )
    }

    return {
      clearSession,
      localDownloads,
      rememberLocal,
      localMaterialIds,
      keyword,
      loading,
      collect,
      download,
      setCollect,
      setDownload,
      checkListFilter,
      pageNum,
      pageSize,
      setPageNum,
      setPageSize,
      materialTotal,
      materialList,
      materialListFilterGet,
      materialLoveList,
      materialLoveListGet,
      isLove,
      filterLove,
      setFilterLove,
      downLoadList,
      downLoadFilePathGet,
      downLoadListGet,
      isDownloaded,
      setDownloadProgress,
      clearDownloadProgress,
      getPct,
      isDownShow,
      showText,
      searchKeywords
    }
  },
  {
    persist: { pick: ['pageSize', 'showText', 'localDownloads'] }
  }
)
