<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ProductItem } from '@/types/ProductItem'
import { productsGetApi } from '@/api/product'
import ProductCard from './components/ProductCard.vue'
import { coins, membership } from '@/views/vipProduct/configData'
import SkeletonScreen from '@/views/vipProduct/components/SkeletonScreen.vue'
import { payOrderApi } from '@/api/order'
import { useUserStore } from '@/stores'

// 定义store
const userStore = useUserStore()

// 加载
const loading = ref(false)

// 金币产品
const coinProducts = ref<ProductItem[]>([])
const vipProducts = ref<ProductItem[]>([])
const productGet = async () => {
  loading.value = true
  const res = await productsGetApi()
  console.log(res)
  coinProducts.value = res.data.filter((product: ProductItem) => product.productType === '金币充值')
  vipProducts.value = res.data.filter((product: ProductItem) => product.productType === '购买会员')

  loading.value = false
}

// 处理购买金币
const handleCoinsBuy = async (item: ProductItem) => {
  console.log(item)
  const res = await payOrderApi(userStore.userInfo._id, item._id)
  window.electron.ipcRenderer.invoke('creatOrder', res.data.pay_url)
  console.log(' 支付', res)
}

onMounted(async () => {
  await productGet()
  const handler = (_, status: string) => {
    // SUCCESS / FAIL ...
    console.log('payment-status:', status)
  }
  // 接收支付状态消息
  window.electron.ipcRenderer.on('payment-status', handler)
})
</script>

<template>
  <div v-loading="loading" class="vip-page" element-loading-background="#121212">
    <div class="vip-container">
      <!-- 骨架屏：加载时显示与卡片布局一致的占位 -->
      <SkeletonScreen v-if="loading"></SkeletonScreen>

      <!-- 产品卡片：数据与语言同步后的标题 -->
      <template v-else>
        <ProductCard :title="coins" :product-item="coinProducts" @buy="handleCoinsBuy" />
        <ProductCard :title="membership" :product-item="vipProducts" />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vip-page {
  height: 100%;
  position: relative;
  // 舞台径向渐变背景
  background:
    radial-gradient(1400px 700px at 20% 10%, rgba(66, 123, 2, 0.08), transparent 45%),
    radial-gradient(1200px 600px at 80% 20%, rgba(255, 255, 255, 0.06), transparent 50%),
    linear-gradient(180deg, #0f0f10 0%, #141415 100%);

  // 暗角与噪点覆层（仅视觉增强，不影响交互）
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  // 细噪点（用渐变模拟）
  &::before {
    background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
    background-size: 2px 2px;
    opacity: 0.06;
    mix-blend-mode: overlay;
  }

  // 轻微暗角
  &::after {
    background: radial-gradient(120% 120% at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.45) 100%);
    opacity: 0.6;
  }
}

.vip-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; // 居中子元素
  gap: 24px;
  padding: 24px;

  // 限制每个产品区的最大宽度，并随视口缩放
  :deep(.product-section) {
    width: clamp(320px, 90vw, 1400px);
  }
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
