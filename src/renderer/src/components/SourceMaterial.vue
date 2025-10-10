<script setup lang="ts">
import { useMaterialStore, useUserStore } from '@/stores'
import { onMounted, ref } from 'vue'
import { handleWheel, itemSize } from '@/utils/Wheel'
import SkeletonSourceMaterial from '@/components/SkeletonSourceMaterial.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MaterialItem } from '@/types/Material'
import { materialListLoveApi } from '@/api/material'

// 定义store
const materialStore = useMaterialStore()
const userStore = useUserStore()

// 获取当前路由对象
const route = useRoute()

// 测试数据
const isDown = ref(false)
// 处理下载
const handleDownload = (item: MaterialItem) => {
  console.log(item)
}

// 处理素材功能
const handleFunction = async (value: string, materialId: string) => {
  console.log(value, '---', materialId)
  switch (value) {
    case 'searchPic':
      console.log('以图搜图')
      ElMessage.warning('暂未开放')
      break
    case 'full':
      console.log('平铺')
      break
    case 'openFile':
      console.log('打开文件夹')
      break
    case 'love': {
      console.log('收藏')
      const loveRes = await materialListLoveApi(userStore.userInfo._id, materialId)
      // 处理收藏结果
      if (loveRes.code === 200) {
        //   获取收藏列表
        await materialStore.materialLoveListGet(userStore.userInfo._id)
        ElMessage.success(loveRes.message)
      }
      break
    }
  }
}

onMounted(() => {
  document.addEventListener('wheel', handleWheel, { passive: false })
})
</script>
<template>
  <SkeletonSourceMaterial
    v-if="materialStore.loading"
    :items="8"
    :size="itemSize"
    :throttle="{ leading: 300, trailing: 200 }"
  />
  <div v-else class="sourceMaterial">
    <div v-for="item in materialStore.materialList" :key="item._id" class="materialItem" draggable="true">
      <!-- 使用 el-image 替换背景图 -->
      <el-image
        class="material-image"
        :src="item.cover_url"
        :zoom-rate="1.2"
        :max-scale="7"
        :min-scale="0.2"
        show-progress
        fit="cover"
        hide-on-click-modal
        :style="{ width: `${itemSize}px`, height: `${itemSize}px` }"
      />
      <!--   下载    -->
      <div class="download" style="color: #129be3" @click.stop>
        <i
          class="iconfont icon-xiazaichenggong"
          style="font-size: 20px; opacity: 0"
          :style="{ opacity: isDown ? 100 : 0 }"
        ></i>
        <i
          class="iconfont icon-xiazai_xiazai hover-visible"
          style="font-size: 17px; color: #ffffff; cursor: pointer"
          @click="handleDownload(item)"
        ></i>
      </div>
      <!--   素材信息和功能区   -->
      <div class="InfoFunction" @click.stop>
        <!--   素材名字    -->
        <div v-if="materialStore.showText" class="name">
          {{ item.name }}
        </div>
        <!--  名字占位  -->
        <div v-else class="name"></div>
        <!--   功能图标    -->
        <div class="functionIcon">
          <!--  以图搜图   -->
          <i class="iconfont icon-fangdajing1 hover-visible" @click="handleFunction('searchPic', item._id)"></i>
          <!--  平铺贴图   -->
          <i
            v-if="route.path === '/maps'"
            class="iconfont icon-quanping hover-visible"
            @click="handleFunction('full', item.cover_url)"
          ></i>
          <!--  打开本地文件   -->
          <i class="iconfont icon-wj-wjj hover-visible" @click="handleFunction('openFile', item._id)"></i>
          <!--  未收藏  -->
          <i
            v-if="materialStore.isLove(item._id)"
            class="iconfont icon-aixin hover-visible"
            @click="handleFunction('love', item._id)"
          ></i>
          <!--  收藏  -->
          <i v-else class="iconfont icon-aixin1" style="color: #fb4409" @click="handleFunction('love', item._id)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*素材*/
.sourceMaterial {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;
  padding: 8px;

  /*每一项*/
  .materialItem {
    display: inline-flex;
    flex-direction: column;
    position: relative;
    padding: 0; /* 让封面图撑满卡片 */
    border: 1px solid #2f2f2f;
    border-radius: 4px;
    overflow: hidden;
    transition:
      border 0.2s ease,
      width 0.3s ease,
      height 0.3s ease,
      transform 0.2s ease;

    // 图片样式（由行内宽高控制尺寸，设为填充容器）
    .material-image {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
    }

    /* 使用深度选择器处理Element Plus预览组件 */
    ::v-deep(.el-image-viewer__wrapper),
    ::v-deep(.el-image-viewer__img) {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: var(--watermark-url);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 30%;
        pointer-events: none;
        z-index: 1000;
        opacity: 0.3;
      }
    }

    ::v-deep(.el-image__error),
    ::v-deep(.el-image__placeholder) {
      background-color: #202020;
    }

    // 默认隐藏需要悬停才显示的元素
    .hover-visible {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    /*下载区域*/
    .download {
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px;
      width: 100%;
    }

    /*素材信息和功能*/
    .InfoFunction {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 14px;
      color: #fff;
      padding: 8px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 85%);

      .name {
        max-width: 200px;
        @include ellipsis(1);
      }

      /*功能图标*/
      .functionIcon {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .iconfont {
          font-size: 20px;
          cursor: pointer;
        }
      }
    }

    /*鼠标悬停*/
    &:hover {
      border: 1px solid #858585;
      transform: translateZ(0) scale(1.01);

      // 悬停时显示隐藏的元素
      .hover-visible {
        opacity: 1;
      }
    }

    /* 可拖拽项的样式 */
    &.can-drag {
      cursor: grab;
    }
  }
}
</style>
