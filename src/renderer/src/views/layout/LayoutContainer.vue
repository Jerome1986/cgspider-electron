<script setup lang="ts">
import { ref } from 'vue'
import { MenuItem, menuList } from '@/config/menu'
import { useRouter } from 'vue-router'
import CgsHeader from '@/components/CgsHeader.vue'

const router = useRouter()
const tabActiveIndex = ref(0)
const handleMenuClick = (item: MenuItem, index: number) => {
  tabActiveIndex.value = index
  router.push(item.path)
}
</script>

<template>
  <el-container class="layout-container">
    <!--  侧边  -->
    <el-aside width="56px">
      <!--  logo    -->
      <div class="logo">
        <img src="../../assets/images/icon.png" alt="logo" />
      </div>
      <!--   类型tab   -->
      <div
        v-for="(item, index) in menuList"
        :key="item.id"
        class="tabs"
        :class="{ activeTab: tabActiveIndex === index }"
        @click="handleMenuClick(item, index)"
      >
        <!--   图标    -->
        <img class="icon" :src="tabActiveIndex === index ? item.activeIcon : item.icon" alt="model_select" />
        <!--   文字    -->
        <div class="text">{{ item.name }}</div>
      </div>
    </el-aside>
    <el-container>
      <!--  头部  -->
      <el-header style="margin: 0; padding: 0; height: fit-content">
        <cgs-header></cgs-header>
      </el-header>
      <!--   主体内容   -->
      <el-main style="margin: 0; padding: 0">
        <router-view></router-view>
      </el-main>
      <!--  底部    -->
      <el-footer></el-footer>
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

      .icon {
        width: 20px;
        height: 20px;
      }
      .text {
        font-size: 12px;
      }
    }

    .activeTab {
      color: #ffffff;
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
