<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import {
  handleBrowWindowChange,
  isOnTop,
  toggleOnTop,
  handleLogout,
  mousedown,
  currentPath,
  handleSelectPath,
  handleSavePath
} from '@/utils/header'
import { usePathStore } from '@/stores'

// 定义store
const pathStore = usePathStore()

// 导入路由
const router = useRouter()
// 用户全局管理
const userStore = useUserStore()

// 切换语言
const languageSwitch = ref(false)

// 功能菜单
const showMenu = ref(false)
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// 处理菜单项点击
const handleMenuItem = (action: string) => {
  switch (action) {
    case 'profile':
      // 设置下载路径
      console.log('设置下载路径')
      pathStore.setPathDialog(true)
      break
    case 'vip':
      // 进入会员信息页面
      console.log('会员页面')
      router.push('/vip')
      break
    case 'logout':
      // 处理退出登录
      handleLogout()
      break
  }
  showMenu.value = false
}

// 页面挂载完毕
onMounted(() => {})
</script>

<template>
  <div class="cgsHeader" @mousedown="mousedown($event)">
    <!--  用户信息-已登录  -->
    <div v-if="userStore.userInfo.token" class="userInfo">
      <!--   头像   -->
      <div class="avatar">
        <img :src="userStore.userInfo.userAvatarUrl" alt="头像" />
      </div>
      <!--   昵称   -->
      <div class="username">{{ userStore.userInfo.username }}</div>
      <!--   剩余金币   -->
      <div class="gold">金币：{{ userStore.userInfo.coins }}</div>
      <!--   身份   -->
      <div class="role">{{ userStore.userInfo.role }}</div>
      <!--   切换语言   -->
      <el-switch
        v-model="languageSwitch"
        class="ml-2"
        size="small"
        style="--el-switch-on-color: #409eff"
        :active-text="languageSwitch ? '英文' : '中文'"
      />
    </div>

    <!--  功能  -->
    <div class="gn">
      <div class="leftMenu">
        <div class="menu">
          <div @click="toggleMenu">
            <i class="iconfont icon-gongnenglan" style="font-size: 14px"></i>
          </div>
          <!-- 下拉菜单 - 只在登录状态下显示 -->
          <div v-if="showMenu" class="dropdown-menu">
            <div class="menu-item" @click="handleMenuItem('profile')">设置路径</div>
            <div class="menu-item" @click="handleMenuItem('vip')">会员充值</div>
            <div class="menu-item" @click="handleMenuItem('logout')">退出登录</div>
          </div>
        </div>
        <!--   点击置顶   -->
        <div class="toggleOnTop" :class="{ onTop: isOnTop }" @click="toggleOnTop">
          <i class="iconfont icon-dingzhuzhiding" style="font-size: 14px"></i>
        </div>
      </div>
      <div class="rightBrowWindow">
        <!--  最小化  -->
        <div class="windowItem" @click="handleBrowWindowChange('min')">
          <i class="iconfont icon-zuixiaohua3" style="font-size: 14px"></i>
        </div>
        <!--  最大化  -->
        <div class="windowItem" @click="handleBrowWindowChange('max')">
          <i class="iconfont icon-chuangkouzuidahua" style="font-size: 14px"></i>
        </div>
        <!--  关闭  -->
        <div class="windowItem" @click="handleBrowWindowChange('close')">
          <i class="iconfont icon-guanbi" style="font-size: 14px"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- 设置下载路径弹框 -->
  <el-dialog
    v-model="pathStore.showPathDialog"
    title="设置下载路径"
    width="500px"
    :close-on-click-modal="false"
    @close="pathStore.setPathDialog(false)"
  >
    <div class="path-dialog">
      <div class="current-path">
        <span class="label">当前路径：</span>
        <span class="path">{{ currentPath }}</span>
      </div>
      <div class="select-path">
        <el-input v-model="currentPath" placeholder="请选择下载路径" readonly>
          <template #append>
            <el-button @click="handleSelectPath">选择路径</el-button>
          </template>
        </el-input>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="pathStore.setPathDialog(false)">取消</el-button>
        <el-button type="primary" @click="handleSavePath">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="scss" scoped>
.cgsHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  width: 100%;
  height: 50px;
  font-size: 12px;
  background-color: $cgs-side;

  /*用户信息*/
  .userInfo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 20px;

    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      overflow: hidden;
    }

    /*切换语言*/
    .el-switch {
      :deep(.el-switch__label) {
        color: #ffffff;
      }
      :deep(.el-switch__label.is-active) {
        color: $cgs-brandColor;
      }
    }
  }
  .notLogin {
    margin-right: 20px;
    cursor: pointer;

    &:hover {
      color: $cgs-brandColor;
    }
  }
  /*功能*/
  .gn {
    display: flex;
    align-items: center;
    gap: 10px;

    /*功能菜单*/
    .leftMenu {
      display: flex;
      align-items: center;
      gap: 16px;
      .menu {
        position: relative;
        cursor: pointer;
        z-index: 999;
        /* 下拉菜单 */
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: $cgs-backGroudColor;
          border-radius: 4px;
          padding: 4px 0;
          min-width: 120px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
          animation: slideDown 0.2s ease;

          &::before {
            content: '';
            position: absolute;
            top: -4px;
            right: 10px;
            width: 8px;
            height: 8px;
            background: $cgs-backGroudColor;
            transform: rotate(45deg);
          }

          .menu-item {
            padding: 8px 16px;
            color: #fff;
            transition: background-color 0.3s;
            font-size: 14px;
            white-space: nowrap;
            text-align: center;

            &:hover {
              background-color: rgba(255, 255, 255, 0.1);
            }
          }
        }
      }

      /*置顶*/
      .toggleOnTop {
        color: #ffffff;
        cursor: pointer;
      }

      .onTop {
        color: $cgs-brandColor;
      }
    }
    .rightBrowWindow {
      margin-left: 30px;
      display: flex;
      align-items: center;
      gap: 16px;

      .windowItem {
        padding: 2px;
        cursor: pointer;

        &:hover {
          background-color: $cgs-brandColor;
        }
      }
    }
  }
}

/*下载弹框*/
.path-dialog {
  padding: 20px;

  .current-path {
    margin-bottom: 20px;

    .label {
      color: $cgs-font-dec2;
      margin-right: 10px;
    }

    .path {
      color: $cgs-font-title;
      font-weight: bold;
    }
  }

  .select-path {
    :deep(.el-input-group__append) {
      padding: 0;

      .el-button {
        border: none;
        margin: 0;

        &:hover {
          color: $cgs-brandColor;
        }
      }
    }
  }
}
</style>
