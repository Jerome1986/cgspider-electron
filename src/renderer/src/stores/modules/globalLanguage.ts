import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MenuItem } from '@/config/menu'
import { Title } from '@/views/vipProduct/configData'
import { ProductItem } from '@/types/ProductItem'

export const useLanguageStore = defineStore(
  'language',
  () => {
    // 语言切换 false-中文  true-英文
    const languageSwitch = ref(false)

    // 当前语言的开关
    const setLanguageSwitch = (value: boolean) => {
      languageSwitch.value = value
    }

    // 设置左侧tab切换
    const t = (it: MenuItem): string => (languageSwitch.value ? (it.en_name ?? it.name) : it.name)

    // 全局文本切换
    const gt = (cn: string, en: string): string => (languageSwitch.value ? en : cn)

    // 会员页面--文本助手（优先英文，缺失则回退中文）
    const getTitle = (title: Title): string => (languageSwitch.value ? (title.en_name ?? title.name) : title.name)
    const getItemName = (it: ProductItem): string =>
      languageSwitch.value ? (it.en_name ?? it.productName) : it.productName
    const getItemDesc = (it: ProductItem): string =>
      languageSwitch.value ? (it.en_description ?? it.description) : it.description
    const getItemType = (it: ProductItem): string =>
      languageSwitch.value ? (it.en_productType ?? it.productType) : it.productType

    return {
      t,
      gt,
      getTitle,
      getItemName,
      getItemDesc,
      getItemType,
      languageSwitch,
      setLanguageSwitch
    }
  },
  {
    persist: true
  }
)
