<script setup lang="ts">
import { onMounted } from 'vue'
import { useCategoryStore, useLanguageStore, useMaterialStore, usePageTypeStore, useUserStore } from '@/stores'
import { useTagStore } from '@/stores/modules/tags'

// 定义store
const pageTypeStore = usePageTypeStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const materialStore = useMaterialStore()
const userStore = useUserStore()
const languageStore = useLanguageStore()

// 处理颜色标签切换点击
const handleChangeColorTag = async (colorTagId: string) => {
  console.log(colorTagId, tagStore.selectedColorIds)
  tagStore.setColorTag(colorTagId)
  // 渲染素材
  await materialStore.materialListFilterGet(
    pageTypeStore.currentPageType,
    categoryStore.currentCateId,
    categoryStore.currentSubCateId,
    categoryStore.currentThirdCateId,
    tagStore.selectedAittribuleIds,
    tagStore.selectedColorIds,
    false,
    false,
    userStore.userInfo._id
  )
}

onMounted(async () => {
  await tagStore.getColorTagList(pageTypeStore.currentPageType)
})
</script>

<template>
  <div class="filter-container">
    <!-- 属性标签 -->
    <div class="filter-section">
      <h3>{{ languageStore.gt('颜色标签', 'Color Tag') }}</h3>
      <div class="row parent-row">
        <button
          v-for="item in tagStore.colorList"
          :key="item._id"
          :class="{ selected: item.isSelected }"
          :style="{ backgroundColor: item.color }"
          @click="handleChangeColorTag(item._id)"
        ></button>
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
  background: transparent;
  margin-bottom: 12px; // 给下方标签/列表留空间
}

/* 每个分区：标题与类目同行排布 */
.filter-section {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: transparent; // 由父容器统一背景承载
  border: 0;
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
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  cursor: pointer;
  border-radius: 4px;
  border: none;
}
button:hover {
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}
button.selected {
  border: 2px solid #ffffff;
}
</style>
