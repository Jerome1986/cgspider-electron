<script setup lang="ts">
import { withDefaults, defineProps, computed } from 'vue'

type ThrottleOption = number | { leading: number; trailing: number }

const props = withDefaults(
  defineProps<{
    items?: number
    size?: number
    gap?: number
    throttleMs?: number
    throttle?: ThrottleOption
  }>(),
  {
    items: 8,
    size: 405,
    gap: 8,
    throttleMs: 300
  }
)

const resolvedThrottle = computed<ThrottleOption>(() => {
  return props.throttle ?? props.throttleMs ?? 300
})
</script>

<template>
  <div class="sourceMaterial-skel" :style="{ gap: props.gap + 'px' }">
    <div v-for="i in props.items" :key="i" class="materialItem">
      <el-skeleton animated :throttle="resolvedThrottle">
        <template #template>
          <div class="card">
            <el-skeleton-item
              variant="image"
              class="image"
              :style="{ width: props.size + 'px', height: props.size + 'px' }"
            />
            <div class="info">
              <el-skeleton-item class="name" variant="text" />
              <div class="icons">
                <el-skeleton-item class="icon" variant="circle" />
                <el-skeleton-item class="icon" variant="circle" />
                <el-skeleton-item class="icon" variant="circle" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sourceMaterial-skel {
  --skel-from: rgba(255, 255, 255, 0.06);
  --skel-to: rgba(255, 255, 255, 0.1);

  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;
  padding: 8px;

  .materialItem {
    display: inline-flex;
    position: relative;
    border: 1px solid #2f2f2f;
    border-radius: 4px;
    overflow: hidden;

    .card {
      position: relative;
    }
    .image {
      display: block;
      border-radius: 2px;
    }

    .info {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 8px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 85%);
      .name {
        width: 180px;
        height: 16px;
        border-radius: 4px;
      }
      .icons {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
      }
    }
  }

  :deep(.el-skeleton__item) {
    background: linear-gradient(90deg, var(--skel-from) 25%, var(--skel-to) 37%, var(--skel-from) 63%);
    background-size: 400% 100%;
    animation: skel 1.6s linear infinite;
    border-radius: 4px;
  }
}

@keyframes skel {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
