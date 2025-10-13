<script setup lang="ts">
import { onMounted } from 'vue'
import {
  useCategoryStore,
  useLanguageStore,
  useMaterialStore,
  usePageTypeStore,
  useTagStore,
  useUserStore
} from '@/stores'

// 定义store
const pageTypeStore = usePageTypeStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const materialStore = useMaterialStore()
const userStore = useUserStore()
const languageStore = useLanguageStore()

// 一级分类
const selectAllCate = async () => {
  console.log('全部')
  categoryStore.setCurrentCateId('')
  categoryStore.setCurrentSubCateId('')
  categoryStore.setCurrentThirdCateId('')
  // 渲染素材
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

// 一级分类发生改变时
const handleChangeCate = async (cateId: string) => {
  console.log(cateId)
  // 重置二级分类
  categoryStore.setCurrentSubCateId('')
  categoryStore.setCurrentThirdCateId('')

  // 存入当前的一级分类ID
  categoryStore.setCurrentCateId(cateId)
  // 根据一级分类渲染二级分类
  await categoryStore.categoryListGet(pageTypeStore.currentPageType, cateId, 2)

  // 渲染素材
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

// 二级分类点击全部
const selectAllSub = async () => {
  categoryStore.setCurrentSubCateId('')
  categoryStore.setCurrentThirdCateId('')
  // 渲染素材
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

// 二级分类发生改变时
const handleChangeSubCate = async (cateId: string) => {
  console.log(cateId)
  // 重置三级分类ID
  categoryStore.setCurrentThirdCateId('')

  // 存入当前的二级分类ID
  categoryStore.setCurrentSubCateId(cateId)
  // 根据二级分类ID获取三级分类
  await categoryStore.categoryListGet(pageTypeStore.currentPageType, cateId, 3)
  // 获取对应素材
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

// 三级分类全部
const selectAllThird = async () => {
  categoryStore.setCurrentThirdCateId('')
  // 渲染素材
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

// 三级分类改变时
const handleChangeThirdCate = async (cateId: string) => {
  console.log(cateId)
  // 存入当前的三级分类ID
  categoryStore.setCurrentThirdCateId(cateId)
  // 获取对应素材
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

onMounted(async () => {
  // 默认渲染一级分类
  await categoryStore.categoryListGet(pageTypeStore.currentPageType)
})
</script>

<template>
  <div class="filter-container">
    <!-- 一级分类：单排，单选 -->
    <div class="filter-section">
      <h3>{{ languageStore.gt('一级分类', 'Top Level') }}</h3>
      <div class="row parent-row">
        <button :class="{ selected: categoryStore.currentCateId === '' }" @click="selectAllCate">
          {{ languageStore.gt('全部', 'ALL') }}
        </button>
        <button
          v-for="item in categoryStore.cateList"
          :key="item._id"
          :class="{ selected: categoryStore.currentCateId === String(item._id ?? '') }"
          @click="handleChangeCate(item._id)"
        >
          {{ languageStore.gt(item.name, item.en_name) }}
        </button>
      </div>
    </div>

    <!--  二级分类  -->
    <div v-if="categoryStore.currentCateId" class="filter-section">
      <h3>{{ languageStore.gt('二级分类', 'Second Level') }}</h3>
      <div class="row parent-row">
        <button :class="{ selected: categoryStore.currentSubCateId === '' }" @click="selectAllSub">
          {{ languageStore.gt('全部', 'ALL') }}
        </button>
        <button
          v-for="item in categoryStore.subCateList"
          :key="item._id"
          :class="{ selected: categoryStore.currentSubCateId === String(item._id ?? '') }"
          @click="handleChangeSubCate(item._id)"
        >
          {{ languageStore.gt(item.name, item.en_name) }}
        </button>
      </div>
    </div>

    <!--  三级分类  -->
    <div v-if="categoryStore.currentSubCateId" class="filter-section">
      <h3>{{ languageStore.gt('三级分类', 'Third Level') }}</h3>
      <div class="row parent-row">
        <button :class="{ selected: categoryStore.currentThirdCateId === '' }" @click="selectAllThird">
          {{ languageStore.gt('全部', 'ALL') }}
        </button>
        <button
          v-for="item in categoryStore.thirdCateList"
          :key="item._id"
          :class="{ selected: categoryStore.currentThirdCateId === String(item._id ?? '') }"
          @click="handleChangeThirdCate(item._id)"
        >
          {{ languageStore.gt(item.name, item.en_name) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';

/* container styled by parent page background */
.filter-container {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  color: #e6e6e6;
  background: transparent;
  border: 0;
  border-radius: 12px;
  margin-bottom: 12px; // 给下方标签/列表留空间
}

/* 每个分区：标题与类目同行排布 */
.filter-section {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: transparent; // 由父容器统一背景承载
  border: 0;
  border-radius: 10px;
  padding: 0; // 外部容器已处理内边距
}

/* 标题占据最小宽度，其余空间留给类目换行 */
.filter-section h3 {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: 0.2px;
  flex: 0 0 auto;
}

/* 科技感分隔：使用柔和的品牌色发光边而非实体横线 */
.filter-section + .filter-section::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 1px;
  background:
    radial-gradient(60% 80% at 10% 50%, rgba($cgs-brandColor, 0.25), transparent 70%),
    radial-gradient(60% 80% at 90% 50%, rgba(255, 255, 255, 0.1), transparent 70%);
  filter: blur(0.3px);
  opacity: 0.7;
}

/* 类目行：占满剩余空间，超出自动换行 */
.row {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px 10px;
  flex-wrap: wrap; // 直接换行
}

/* 分类按钮 */
button {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #161616;
  color: #dcdcdc;
  font-size: 12px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    box-shadow 0.25s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}
button:hover {
  background: #1b1b1b;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}
button.selected {
  $bg: color.mix($cgs-brandColor, #1a1a1a, 25%);
  background:
    linear-gradient($bg, $bg) padding-box,
    linear-gradient(90deg, rgba($cgs-brandColor, 0.4), rgba(255, 255, 255, 0.1)) border-box;
  color: #eaeaea;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba($cgs-brandColor, 0.28) inset;
}
</style>
