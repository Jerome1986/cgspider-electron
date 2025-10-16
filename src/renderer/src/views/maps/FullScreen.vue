<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'

const route = useRoute()
const cover_url = route.params.cover_url as string

const padding = 16 // fullscreen padding
const bottomGap = 10 // 底部留空

const windowWidth = ref(window.innerWidth - padding)
const windowHeight = ref(window.innerHeight - padding - bottomGap)

const imgSize = ref(485) // 动态计算

const cols = ref(1)
const rows = ref(1)
const totalImages = ref(1)

const calculateLayout = () => {
  windowWidth.value = window.innerWidth - padding
  windowHeight.value = window.innerHeight - padding - bottomGap

  cols.value = Math.floor(windowWidth.value / imgSize.value) || 1
  imgSize.value = windowWidth.value / cols.value
  rows.value = Math.ceil(windowHeight.value / imgSize.value)
  totalImages.value = cols.value * rows.value
}

onMounted(() => {
  calculateLayout()
  window.addEventListener('resize', calculateLayout)
})
</script>

<template>
  <div class="fullscreen">
    <div class="back" @click="router.go(-1)">返回</div>
    <div class="materialPic" :style="{ width: windowWidth + 'px', height: windowHeight + 'px' }">
      <el-image
        v-for="i in totalImages"
        :key="i"
        class="material-image"
        :src="cover_url"
        fit="cover"
        :style="{ width: imgSize + 'px', height: imgSize + 'px' }"
      ></el-image>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fullscreen {
  position: relative;
  padding: 8px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(900px 420px at 18% 12%, rgba(66, 123, 2, 0.035), transparent 55%),
    radial-gradient(700px 320px at 100% 0%, rgba(255, 255, 255, 0.028), transparent 60%),
    linear-gradient(180deg, #0f0f10 0%, #141415 100%);

  .back {
    margin-bottom: 10px;
    cursor: pointer;
    z-index: 1;
    position: relative;
  }

  .materialPic {
    display: flex;
    flex-wrap: wrap;

    .material-image {
      display: block;
    }
  }
}
</style>
