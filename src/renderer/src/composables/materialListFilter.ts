import { useCategoryStore, useMaterialStore, usePageTypeStore, useTagStore, useUserStore } from '@/stores'

// 定义 Store
const pageTypeStore = usePageTypeStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const materialStore = useMaterialStore()
const userStore = useUserStore()

export const materialListFilter = async () => {
  // 渲染数据
  await materialStore.materialListFilterGet(
    pageTypeStore.currentPageType,
    categoryStore.currentCateId,
    categoryStore.currentSubCateId,
    categoryStore.currentThirdCateId,
    tagStore.selectedAittribuleIds,
    tagStore.selectedColorIds,
    materialStore.download,
    materialStore.collect,
    userStore.userInfo._id
  )
}
