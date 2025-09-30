<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Category, SubCategory, ThirdCategory } from '@/types/CateItem'

/**
 * 组件入参（cateList 为树形：一级→二级→三级）
 */
const props = defineProps<{
  cateList?: Category[]
}>()

/**
 * 组件对外事件
 * - changeCate: 选择二级分类时触发，参数为二级 _id
 * - changeThird: 选择三级分类时触发，参数为三级 _id
 * - allCate: 点击任一“全部”时触发（清空所选）
 */
const emits = defineEmits<{
  (e: 'changeCate', id: string): void
  (e: 'changeThird', id: string): void
  (e: 'allCate'): void
}>()

/** 当前选中的一级分类 _id（空串代表“全部”） */
const activeParentId = ref<string>('')
/** 当前选中的二级分类 _id（空串代表“全部”或未选） */
const activeSubId = ref<string>('')
/** 当前选中的三级分类 _id（空串代表“全部”或未选） */
const activeThirdId = ref<string>('')

/** 一级分类列表（来自 props） */
const parents = computed<Category[]>(() => props.cateList ?? [])
/** 当前一级下的二级列表 */
const currentSubs = computed<SubCategory[]>(() => {
  const p = parents.value.find((c) => (c._id ?? '') === activeParentId.value)
  return p?.subCategories ?? []
})
/** 当前二级下的三级列表（从树结构中直接获取） */
const currentThirds = computed<ThirdCategory[]>(() => {
  const sub = currentSubs.value.find((s) => s._id === activeSubId.value)
  return sub?.subCategories ?? []
})

/** 选择一级分类（会重置二级与三级选择） */
function selectParent(id: string): void {
  if (activeParentId.value === id) return
  activeParentId.value = id
  activeSubId.value = ''
  activeThirdId.value = ''
}

/** 选择二级分类（会重置三级选择，并向外发出 changeCate） */
function selectSub(id: string): void {
  if (!id || activeSubId.value === id) return
  activeSubId.value = id
  activeThirdId.value = ''
  emits('changeCate', id)
}

/** 选择三级分类（向外发出 changeThird） */
function selectThird(id: string): void {
  if (!id || activeThirdId.value === id) return
  activeThirdId.value = id
  emits('changeThird', id)
}

/** 一级“全部”——清空所有级别的选择并通知外部 */
function selectAllParent(): void {
  if (activeParentId.value === '') return
  activeParentId.value = ''
  activeSubId.value = ''
  activeThirdId.value = ''
  emits('allCate')
}

/** 二级“全部”——清空二级与三级选择并通知外部 */
function selectAllSub(): void {
  if (activeSubId.value === '' && activeThirdId.value === '') return
  activeSubId.value = ''
  activeThirdId.value = ''
  emits('allCate')
}

/** 三级“全部”——仅清空三级选择并通知外部 */
function selectAllThird(): void {
  if (activeThirdId.value === '') return
  activeThirdId.value = ''
  emits('allCate')
}

/** 初次挂载：若存在一级列表则默认选中第一个，便于呈现二级 */
onMounted(() => {
  if (parents.value.length && !activeParentId.value) {
    activeParentId.value = String(parents.value[0]._id ?? '')
  }
})

/** 监听分类数据变化：重置并保持默认第一项选中 */
watch(
  () => props.cateList,
  (list) => {
    if (list && list.length) {
      activeParentId.value = String(list[0]._id ?? '')
      activeSubId.value = ''
      activeThirdId.value = ''
    } else {
      activeParentId.value = ''
      activeSubId.value = ''
      activeThirdId.value = ''
    }
  }
)
</script>

<template>
  <div class="filter-container">
    <!-- 一级分类：单排，单选 -->
    <div class="filter-section">
      <h3>分类</h3>
      <div class="row parent-row">
        <button :class="{ selected: activeParentId === '' }" @click="selectAllParent">全部</button>
        <button
          v-for="cat in parents"
          :key="cat._id || cat.name"
          :class="{ selected: activeParentId === String(cat._id ?? '') }"
          @click="selectParent(String(cat._id ?? ''))"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- 二级分类：单排，单选（显示选中父类的子类） -->
    <div v-if="currentSubs.length" class="filter-section">
      <h3>二级</h3>
      <div class="row child-row">
        <button :class="{ selected: activeSubId === '' && activeThirdId === '' }" @click="selectAllSub">全部</button>
        <button
          v-for="sub in currentSubs"
          :key="sub._id"
          :class="{ selected: activeSubId === sub._id }"
          @click="selectSub(sub._id)"
        >
          {{ sub.name }}
        </button>
      </div>
    </div>

    <!-- 三级分类：单排，单选（基于当前二级） -->
    <div v-if="currentThirds.length" class="filter-section">
      <h3>三级</h3>
      <div class="row third-row">
        <button :class="{ selected: activeThirdId === '' }" @click="selectAllThird">全部</button>
        <button
          v-for="t in currentThirds"
          :key="t._id"
          :class="{ selected: activeThirdId === t._id }"
          @click="selectThird(t._id)"
        >
          {{ t.name }}
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
  padding: 12px;
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
.filter-section + .filter-section {
  padding-top: 8px;
  margin-top: 4px;
}
.filter-section + .filter-section::before {
  content: '';
  position: absolute;
  top: 0;
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
