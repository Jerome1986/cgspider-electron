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
    // 获取树级分类接口
    const categoryListGet = async (type: string, parentId: string | null = null, level: number = 1) => {
      switch (level) {
        case 1: {
          const res = await categoryListGetApi(type, parentId)
          console.log('分类结果', res.data)
          cateList.value = res.data
          break
        }
        case 2: {
          const res = await categoryListGetApi(type, parentId)
          console.log('分类结果', res.data)
          subCateList.value = res.data
          break
        }
        case 3: {
          const res = await categoryListGetApi(type, parentId)
          console.log('分类结果', res.data)
          thirdCateList.value = res.data
          break
        }
      }
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
