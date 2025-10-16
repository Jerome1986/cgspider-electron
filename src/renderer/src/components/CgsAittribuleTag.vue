<script setup lang="ts">
import { onMounted } from 'vue'
import { useLanguageStore, usePageTypeStore, useUserStore } from '@/stores'
import { useTagStore } from '@/stores/modules/tags'
import { materialListFilter } from '@/composables/materialListFilter'

// 定义store
const pageTypeStore = usePageTypeStore()
const tagStore = useTagStore()
const userStore = useUserStore()
const languageStore = useLanguageStore()

// 处理标签切换点击
const handleChangeAittributeTag = async (tagId: string) => {
  console.log(tagId)
  tagStore.setAittributeTag(tagId)
  // 渲染数据
  await materialListFilter()
}

onMounted(async () => {
  await tagStore.aittribuleTagGet(pageTypeStore.currentPageType)
})
</script>

<template>
  <div class="filter-container">
    <!-- 属性标签 -->
    <div class="filter-section">
      <h3>{{ languageStore.gt('属性标签', 'Attribute Tag') }}</h3>
      <div class="row parent-row">
        <button
          v-for="item in tagStore.aittributeTag"
          :key="item._id"
          :class="{ selected: item.isSelected }"
          @click="handleChangeAittributeTag(item._id)"
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
