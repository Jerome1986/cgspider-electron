<script setup lang="ts">
import CgsCategory from '@/components/CgsCategory.vue'
import CgsAittribuleTag from '@/components/CgsAittribuleTag.vue'
import CgsColorTag from '@/components/CgsColorTag.vue'
</script>

<template>
  <div class="materialPage">
    <!-- 分类   -->
    <CgsCategory></CgsCategory>
    <!--  属性标签  -->
    <CgsAittribuleTag></CgsAittribuleTag>
    <!--  颜色标签  -->
    <CgsColorTag></CgsColorTag>
  </div>
</template>

<style scoped lang="scss">
.materialPage {
  position: relative;
  padding: 16px;
  height: 100%;
  width: 100%;
  // 舞台径向渐变背景（与会员页一致）
  background:
    radial-gradient(900px 420px at 18% 12%, rgba(66, 123, 2, 0.035), transparent 55%),
    radial-gradient(700px 320px at 100% 0%, rgba(255, 255, 255, 0.028), transparent 60%),
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
    background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 2px 2px;
    opacity: 0.06;
    mix-blend-mode: overlay;
  }

  // 轻微暗角
  &::after {
    background: radial-gradient(120% 120% at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.35) 100%);
    opacity: 0.6;
  }
}
</style>
