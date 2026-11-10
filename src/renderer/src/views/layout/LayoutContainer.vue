<!--suppress ALL -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { menuList } from '@/config/menu'
import { useRouter } from 'vue-router'
import CgsHeader from '@/components/CgsHeader.vue'
import { useCategoryStore, useLanguageStore, usePageTypeStore, useTagStore, useMaterialStore } from '@/stores'

// 定义store
const pageTypeStore = usePageTypeStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const materialStore = useMaterialStore()
const browsingPaths = ['/material', '/model', '/maps', '/lighting']
// 四个素材页面分别保存筛选和列表，退出布局时释放。
const cloneState = <T,>(value: T): T => JSON.parse(JSON.stringify(value))
const capture = () => ({
  category: cloneState(categoryStore.$state),
  tags: cloneState(tagStore.$state),
  material: cloneState({
    pageNum: materialStore.pageNum,
    pageSize: materialStore.pageSize,
    keyword: materialStore.keyword,
    collect: materialStore.collect,
    download: materialStore.download,
    checkListFilter: materialStore.checkListFilter,
    materialList: materialStore.materialList,
    materialTotal: materialStore.materialTotal
  })
})
const sessions = new Map<string, ReturnType<typeof capture>>()
// 语言开关
const languageStore = useLanguageStore()

// 路由
const router = useRouter()
// 用计算属性根据当前路径来跳转
const tabActiveIndex = computed(() => router.currentRoute.value.path)
watch(
  () => router.currentRoute.value.path,
  (routePath, previousPath) => {
    if (previousPath && browsingPaths.includes(previousPath)) sessions.set(previousPath, capture())
    materialStore.cancelListRequest()
    // 将当前路径保存，方便根据页面类型请求数据
    pageTypeStore.setCurrentPagePath(routePath)
    pageTypeStore.setCurrentPageType(routePath)
    const saved = sessions.get(routePath)
    if (saved) {
      categoryStore.$patch(saved.category)
      tagStore.$patch(saved.tags)
      materialStore.$patch(saved.material)
    } else {
      categoryStore.setCurrentCateId('')
      categoryStore.setCurrentSubCateId('')
      categoryStore.setCurrentThirdCateId('')
      categoryStore.subCateList = []
      categoryStore.thirdCateList = []
      tagStore.selectedAittribuleTag = []
      tagStore.selectedColorTag = []
      tagStore.aittributeTag.forEach((item) => (item.isSelected = false))
      tagStore.colorList.forEach((item) => (item.isSelected = false))
      materialStore.setPageNum(1)
      materialStore.keyword = ''
      materialStore.setCollect(false)
      materialStore.setDownload(false)
      materialStore.checkListFilter = []
      materialStore.materialList = []
      materialStore.materialTotal = 0
    }
  },
  { immediate: true }
)
</script>

<template>
  <el-container class="layout-container">
    <!--  侧边  -->
    <el-aside width="60px">
      <!--  logo    -->
      <div class="logo">
        <img src="../../assets/images/icon.png" alt="logo" />
      </div>
      <!--   类型tab   -->
      <div
        v-for="item in menuList"
        :key="item.id"
        class="tabs"
        :class="{ activeTab: tabActiveIndex === item.path }"
        @click="router.push({ path: item.path })"
      >
        <!--   图标    -->
        <i
          class="iconfont"
          :class="tabActiveIndex === item.path ? item.icon : item.activeIcon"
          style="font-size: 18px"
        />
        <!--   文字    -->
        <div class="text">{{ languageStore.t(item) }}</div>
      </div>
    </el-aside>
    <el-container>
      <!--  头部  -->
      <el-header style="margin: 0; padding: 0; height: fit-content">
        <cgs-header></cgs-header>
      </el-header>
      <!--   主体内容   -->
      <!--     -->
      <el-main style="margin: 0; padding: 0; border-top: 1px solid #2f2e2e; border-left: 1px solid #2f2e2e">
        <router-view v-slot="{ Component }">
          <KeepAlive :include="['MaterialPage', 'ModelPage', 'MapsPage', 'LightingPage']" :max="4">
            <component :is="Component" />
          </KeepAlive>
        </router-view>
      </el-main>
      <!--  底部    -->
      <!--      <el-footer></el-footer>-->
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;

  /*左侧边框*/
  .el-aside {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    background-color: $cgs-side;

    .logo {
      margin-bottom: 20px;
      width: 30px;
      height: 30px;
    }

    /*tab栏*/
    .tabs {
      padding: 20px 0;
      text-align: center;
      color: $cgs-font-dec;
      cursor: pointer;

      .text {
        margin-top: 4px;
        font-size: 12px;
      }
    }

    .activeTab {
      color: $cgs-brandColor;
    }
  }

  /*底部*/
  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
}
</style>
