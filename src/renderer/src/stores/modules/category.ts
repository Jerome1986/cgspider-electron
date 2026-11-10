import { createQueryCache } from '@/utils/queryCache'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoryListGetApi } from '@/api/category'
import { Category } from '@/types/CateItem'

// 用户模块
export const useCategoryStore = defineStore(
  'category',
  () => {
    // 当前选择的分类ID
    const currentCateId = ref('') // 一级分类ID
    const currentSubCateId = ref('') // 二级分类ID
    const currentThirdCateId = ref('') // 三级分类ID
    const setCurrentCateId = (id: string) => (currentCateId.value = id)
    const setCurrentSubCateId = (id: string) => (currentSubCateId.value = id)
    const setCurrentThirdCateId = (id: string) => (currentThirdCateId.value = id)
    // 分类列表
    const cateList = ref<Category[]>([]) //一级分类
    const subCateList = ref<Category[]>([]) //二级分类
    const thirdCateList = ref<Category[]>([]) //三级分类
    const cache = createQueryCache<Category[]>(100)
    const versions = [0, 0, 0, 0]
    // 相同分类读取复用缓存；过时响应不能覆盖后来选中的分类。
    const categoryListGet = async (type: string, parentId: string | null = null, level = 1) => {
      const version = ++versions[level]
      const data = await cache.get(
        JSON.stringify([type, parentId]),
        async () => (await categoryListGetApi(type, parentId)).data
      )
      if (version !== versions[level]) return
      if (level === 1) cateList.value = data
      if (level === 2 && currentCateId.value === parentId) subCateList.value = data
      if (level === 3 && currentSubCateId.value === parentId) thirdCateList.value = data
    }

    return {
      cateList,
      subCateList,
      thirdCateList,
      categoryListGet,
      currentCateId,
      currentSubCateId,
      currentThirdCateId,
      setCurrentCateId,
      setCurrentSubCateId,
      setCurrentThirdCateId
    }
  },
  {
    persist: true // 持久化
  }
)
