<!--suppress ALL -->
<script setup lang="ts">
import { computed } from 'vue'
import { MenuItem, menuList } from '@/config/menu'
import { useRouter } from 'vue-router'
import CgsHeader from '@/components/CgsHeader.vue'
import { useLanguageStore } from '@/stores'

// 语言开关
const languageStore = useLanguageStore()
const isEN = computed(() => languageStore.languageSwitch)

// 路由
const router = useRouter()
// 用计算属性根据当前路径来跳转
const tabActiveIndex = computed(() => {
  return router.currentRoute.value.path
})

const getName = (it: MenuItem): string => (isEN.value ? (it.en_name ?? it.name) : it.name)
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
        @click="$router.push({ path: item.path })"
      >
        <!--   图标    -->
        <i
          class="iconfont"
          :class="tabActiveIndex === item.path ? item.icon : item.activeIcon"
          style="font-size: 18px"
        />
        <!--   文字    -->
        <div class="text">{{ getName(item) }}</div>
      </div>
    </el-aside>
    <el-container>
      <!--  头部  -->
      <el-header style="margin: 0; padding: 0; height: fit-content">
        <cgs-header></cgs-header>
      </el-header>
      <!--   主体内容   -->
      <el-main style="margin: 0; padding: 0; border-top: 1px solid #2f2e2e; border-left: 1px solid #2f2e2e">
        <router-view></router-view>
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
