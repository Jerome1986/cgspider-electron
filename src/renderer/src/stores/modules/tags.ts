import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TagAittribuleItem, TagColorItem } from '@/types/Tags'
import { attributeTagGetApi, colorTagGetApi } from '@/api/tag'

export const useTagStore = defineStore(
  'cgs-tags',
  () => {
    //  属性标签
    const aittributeTag = ref<TagAittribuleItem[]>([])
    // 当前选择的属性标签
    const selectedAittribuleTag = ref<TagAittribuleItem[]>([])
    // 获取属性标签
    const aittribuleTagGet = async (type: string) => {
      const res = await attributeTagGetApi(type)
      aittributeTag.value = res.data.map((item) => ({ ...item, isSelected: false }))
      console.log('标签结果', aittributeTag.value)
    }

    // 将属性标签的某一项设置为已选择
    const setAittributeTag = (tagId: string) => {
      aittributeTag.value.forEach((item) => {
        if (item._id === tagId) item.isSelected = !item.isSelected
        // 同步更新已选的标签数组
        selectedAittribuleTag.value = aittributeTag.value.filter((item) => item.isSelected)
      })
    }

    /**
     * ----------------------------------  颜色标签 ------------------------------
     */

    // 获取所有颜色标签
    const colorList = ref<TagColorItem[]>([])
    // 当前选择的属性标签
    const selectedColorTag = ref<TagColorItem[]>([])
    const getColorTagList = async (type: string) => {
      const res = await colorTagGetApi(type)
      console.log('获取', res.data)
      colorList.value = res.data.map((item) => ({ ...item, isSelected: false }))
    }

    // 将颜色标签的某一项设置为已选择
    const setColorTag = (tagId: string) => {
      colorList.value.forEach((item) => {
        if (item._id === tagId) item.isSelected = !item.isSelected
        // 同步更新已选的标签数组
        selectedColorTag.value = colorList.value.filter((item) => item.isSelected)
      })
    }

    return {
      aittributeTag,
      aittribuleTagGet,
      setAittributeTag,
      selectedAittribuleTag,
      colorList,
      getColorTagList,
      selectedColorTag,
      setColorTag
    }
  },
  {
    persist: true
  }
)
