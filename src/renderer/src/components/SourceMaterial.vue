<script setup lang="ts">
import { useMaterialStore, usePageTypeStore, usePathStore, useUserStore } from '@/stores'
import { onMounted, ref } from 'vue'
import { handleWheel, itemSize } from '@/utils/Wheel'
import SkeletonSourceMaterial from '@/components/SkeletonSourceMaterial.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MaterialItem } from '@/types/Material'
import { materialListLoveApi } from '@/api/material'
import { useClipboard } from '@vueuse/core'
import { downloadVerify, onDone, onProgress } from '@/utils/download'
import CustomImagePreview from '@/components/CustomImagePreview.vue'
import { watermarkGetApi } from '@/api/watermark'
import router from '@/router'
import { onDragStart } from '@/utils/onDragStart'

// 复制文本
const { copy, copied } = useClipboard()
const handleCopyName = async (name: string) => {
  await copy(name)
  copied ? ElMessage.success('复制成功') : ElMessage.error('复制失败')
}

// 定义store
const materialStore = useMaterialStore()
const userStore = useUserStore()
const pathStore = usePathStore()
const pageTypeStore = usePageTypeStore()

// 获取当前路由对象
const route = useRoute()

// 处理下载
const handleDownload = async (item: MaterialItem) => {
  console.log(item)

  const saveDir = pathStore.downloadPath // 确保这是一个目录
  console.log('下载路径', pathStore.downloadPath)
  if (!saveDir || saveDir === '未设置') {
    ElMessage.error('请先设置下载路径')
    return
  }
  // todo 下载前验证 --- 未通过函数内部会阻止
  await downloadVerify(item._id, userStore.userInfo._id)
  // 下载逻辑
  const subDirs = [pageTypeStore.currentPageType, item.name]
  const url = item.files_url
  const materialId = item._id
  // 3) 发起主进程下载（注意 Windows 反斜杠问题交由主进程处理，无需手动替换）
  const fileName = `${item.name}` // 可带扩展名，或让主进程用服务器文件名
  const res = await window.electron.ipcRenderer.invoke('download-file', { url, fileName, saveDir, subDirs, materialId })
  console.log(res)
  if (!res?.ok) {
    ElMessage.error('下载启动失败')
    return
  }
  ElMessage.success('开始下载')
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
      await router.push(`/full/${encodeURIComponent(materialId)}`)
      break
    case 'openFile': {
      const filePath = materialStore.downLoadFilePathGet(materialId)
      console.log('打开文件夹', filePath)
      if (filePath) {
        window.electron.ipcRenderer.invoke('show-file', filePath)
      } else {
        ElMessage.warning('本地找不到该文件')
      }
      break
    }
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

// 根据下载进度变色
const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

// 预览控制
const previewVisible = ref(false)

// 处理预览
const previewUrl = ref('')
const handleView = (url: string) => {
  previewVisible.value = true
  previewUrl.value = url
}

// 获取水印
const watermarkUrl = ref('')
const watermarkGet = async () => {
  const res = await watermarkGetApi(2)
  watermarkUrl.value = res.data[0].images
  console.log('水印', watermarkUrl.value)
  // 设置CSS变量
  document.documentElement.style.setProperty('--watermark-url', `url(${watermarkUrl.value})`)
}

onMounted(() => {
  watermarkGet()
  // 通过滚轮动态控制尺寸
  document.addEventListener('wheel', handleWheel, { passive: false })
  // 监听下载进度
  window.electron.ipcRenderer.on('download-progress', onProgress)
  window.electron.ipcRenderer.on('download-done', onDone)
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
    <div
      v-for="item in materialStore.materialList"
      :key="item._id"
      class="materialItem"
      draggable="true"
      @dragstart.prevent="onDragStart(item._id)"
    >
      <!-- 使用 el-image 替换背景图 -->
      <el-image
        :lazy="true"
        class="material-image"
        :src="item.cover_url"
        :zoom-rate="1.2"
        :max-scale="7"
        :min-scale="0.2"
        show-progress
        fit="cover"
        hide-on-click-modal
        :style="{ width: `${itemSize}px`, height: `${itemSize}px` }"
        @click="handleView(item.cover_url)"
      />
      <!--   下载    -->
      <div class="download" style="color: #129be3" @click.stop>
        <i
          class="iconfont icon-xiazaichenggong"
          style="font-size: 20px; opacity: 0; color: #27b20b"
          :style="{ opacity: materialStore.isDownloaded(item._id) ? 100 : 0 }"
        ></i>
        <i
          class="iconfont icon-xiazai_xiazai hover-visible"
          style="font-size: 17px; color: #129be3; cursor: pointer"
          @click="handleDownload(item)"
        ></i>
      </div>
      <!-- 下载进度  -->
      <div v-if="materialStore.isDownShow(item._id)" class="progress-container">
        <div class="progress-mask"></div>
        <div class="progress">
          <el-progress
            type="dashboard"
            :percentage="materialStore.getPct(item._id)"
            :color="colors"
            :stroke-width="6"
            class="white-percentage"
          />
        </div>
      </div>
      <!--   素材信息和功能区   -->
      <div class="InfoFunction" @click.stop>
        <!--   素材名字    -->
        <div v-if="materialStore.showText" class="name" @click="handleCopyName(item.name)">
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
    <!-- 使用自定义预览组件 -->
    <CustomImagePreview v-model:model-value="previewVisible" :src="previewUrl" />
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

    .progress-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 999;
      border: 1px solid red;

      .progress-mask {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(2px);
      }

      .progress {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px;

        ::v-deep(.el-progress__text) {
          color: white !important;
          font-weight: bold;
          font-size: 14px !important;
        }

        ::v-deep(.white-percentage) {
          .el-progress__text {
            color: white !important;
          }
        }
      }
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
      //background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 85%);

      .name {
        max-width: 200px;
        cursor: pointer;
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
