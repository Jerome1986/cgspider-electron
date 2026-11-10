import { createQueryCache } from '@/utils/queryCache'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TagAittribuleItem, TagColorItem } from '@/types/Tags'
import { attributeTagGetApi, colorTagGetApi } from '@/api/tag'

export const useTagStore = defineStore(
  'cgs-tags',
  () => {
    const attributeCache = createQueryCache<TagAittribuleItem[]>(1)
    const colorCache = createQueryCache<TagColorItem[]>(1)
    let attributeVersion = 0
    let colorVersion = 0
    //  属性标签
    const aittributeTag = ref<TagAittribuleItem[]>([])
    // 当前选择的属性标签
    const selectedAittribuleTag = ref<TagAittribuleItem[]>([])
    // 获取属性标签
    const aittribuleTagGet = async (type: string) => {
      const version = ++attributeVersion
      const data = await attributeCache.get('attributes', async () => (await attributeTagGetApi(type)).data)
      if (version !== attributeVersion) return
      aittributeTag.value = data.map((item) => ({
        ...item,
        isSelected: selectedAittribuleTag.value.some((tag) => tag._id === item._id)
      }))
    }

    // 将属性标签的某一项设置为已选择
    const setAittributeTag = (tagId: string) => {
      aittributeTag.value.forEach((item) => {
        if (item._id === tagId) item.isSelected = !item.isSelected
        // 同步更新已选的标签数组
        selectedAittribuleTag.value = aittributeTag.value.filter((item) => item.isSelected)
      })
    }

    // 所有已选的属性标签的ID集合
    const selectedAittribuleIds = computed(() => {
      return selectedAittribuleTag.value.map((item) => item._id)
    })

    /**
     * ----------------------------------  颜色标签 ------------------------------
     */

    // 获取所有颜色标签
    const colorList = ref<TagColorItem[]>([])
    // 当前选择的属性标签
    const selectedColorTag = ref<TagColorItem[]>([])
    const getColorTagList = async (type: string) => {
      const version = ++colorVersion
      const data = await colorCache.get('colors', async () => (await colorTagGetApi(type)).data)
      if (version !== colorVersion) return
      colorList.value = data.map((item) => ({
        ...item,
        isSelected: selectedColorTag.value.some((tag) => tag._id === item._id)
      }))
    }

    // 将颜色标签的某一项设置为已选择
    const setColorTag = (tagId: string) => {
      colorList.value.forEach((item) => {
        if (item._id === tagId) item.isSelected = !item.isSelected
        // 同步更新已选的标签数组
        selectedColorTag.value = colorList.value.filter((item) => item.isSelected)
      })
    }

    // 所有已选的属性标签的ID集合
    const selectedColorIds = computed(() => {
      return selectedColorTag.value.map((item) => item.color)
    })

    return {
      aittributeTag,
      aittribuleTagGet,
      setAittributeTag,
      selectedAittribuleTag,
      selectedAittribuleIds,
      colorList,
      getColorTagList,
      selectedColorTag,
      setColorTag,
      selectedColorIds
    }
  },
  {
    persist: true
  }
)
