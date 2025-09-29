<script setup lang="ts">
import { coins, membership } from '@/views/vipProduct/configData'
</script>

<template>
  <div class="product-section">
    <div class="section-title">{{ coins.name }}</div>
    <div class="cards">
      <div v-for="i in 2" :key="'c' + i" class="skeleton-card" />
    </div>
  </div>
  <div class="product-section">
    <div class="section-title">{{ membership.name }}</div>
    <div class="cards">
      <div v-for="i in 2" :key="'m' + i" class="skeleton-card" />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 骨架卡片样式，大小与卡片接近，保持布局稳定 */
.product-section {
  height: 100%;
  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px;
    color: #fff;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: clamp(20px, 2vw, 32px);
  }
  .skeleton-card {
    height: 320px;
    border-radius: 14px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 25%,
      rgba(255, 255, 255, 0.1) 37%,
      rgba(255, 255, 255, 0.06) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}
</style>
