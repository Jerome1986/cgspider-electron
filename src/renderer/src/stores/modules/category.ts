import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoryListGetApi } from '@/api/category'
import { Category } from '@/types/CateItem'

// 用户模块
export const useCategoryStore = defineStore(
  'category',
  () => {
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
      categoryListGet
    }
  },
  {
    persist: true // 持久化
  }
)
