import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MaterialItem, MaterialLoveResult } from '@/types/Material'
import { materialListGetApi, materialListLoveGetApi } from '@/api/material'

export const useMaterialStore = defineStore(
  'material',
  () => {
    // 加载骨架屏防抖
    const MIN_MS = 300
    const start = Date.now()
    const loading = ref<boolean>(true)
    // 统一设置分页
    const materialTotal = ref(0)
    const pageNum = ref(1)
    const pageSize = ref(10)
    const setPageNum = (num: number) => (pageNum.value = num)
    const setPageSize = (size: number) => (pageSize.value = size)
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
      loading.value = true
      try {
        const res = await materialListGetApi(
          type,
          top_id,
          sub_id,
          third_id,
          aittributeTags,
          colorTags,
          isDownloaded,
          isLoved,
          user_id,
          pageNum.value,
          pageSize.value
        )
        console.log('素材', res.data)
        materialList.value = res.data.list.map((item) => ({ ...item, isDownloaded: true, isLoved: true }))
        materialTotal.value = res.data.total
      } catch (error) {
        console.error(error)
      } finally {
        const elapsed = Date.now() - start
        if (elapsed < MIN_MS) await new Promise((r) => setTimeout(r, MIN_MS - elapsed))
        loading.value = false
      }
    }

    // 是否显示素材文本
    const showText = ref(false)

    // 获取素材的收藏列表
    const materialLoveList = ref<MaterialLoveResult[]>()
    const materialLoveListGet = async (userId: string) => {
      const res = await materialListLoveGetApi(userId)
      materialLoveList.value = res.data
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
      console.log('是否收藏', love)
      return !love
    }

    return {
      loading,
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
      showText
    }
  },
  {
    persist: true // 持久化
  }
)
