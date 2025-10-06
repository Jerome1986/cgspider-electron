<script setup lang="ts">
import { ProductItem } from '@/types/ProductItem'
import { useLanguageStore } from '@/stores'
import { Title } from '@/views/vipProduct/configData'

const props = withDefaults(
  defineProps<{
    title?: Title
    productItem?: ProductItem[]
    showFeatured?: boolean
  }>(),
  {
    showFeatured: true
  }
)

// 提交时间
const emit = defineEmits(['buy'])

// 点击购买
function handleBuy(item: ProductItem): void {
  emit('buy', item)
}

// 语言开关
const languageStore = useLanguageStore()
</script>

<template>
  <div class="product-section">
    <div v-if="title" class="section-title">{{ languageStore.getTitle(title) }}</div>
    <div class="cards">
      <div v-for="item in props.productItem" :key="item._id" class="card" :class="{ featured: item.isActive }">
        <!-- 将标签移出 content，避免被 overflow 裁剪 -->
        <div v-if="showFeatured && item.isActive" class="featured-tag">{{ languageStore.gt('超值', 'HOT') }}</div>
        <div class="card-content">
          <!-- 装饰背景 -->
          <div class="card-decor" aria-hidden="true" />

          <!-- 头部：图标 + 标题 -->
          <div class="card-header">
            <i class="iconfont icon-jinbi"></i>
            <span class="card-title">{{ languageStore.getItemName(item) }}</span>
          </div>

          <!-- 标签：类型/推荐 -->
          <div class="meta">
            <span v-if="languageStore.getItemType(item)" class="chip">{{ languageStore.getItemType(item) }}</span>
            <span v-if="item.isActive" class="chip positive">{{ languageStore.gt('推荐', 'Recommended') }}</span>
          </div>

          <!-- 价格排版 -->
          <div class="card-price">
            <span class="currency">¥</span>
            <span class="amount">{{ item.price }}</span>
            <span class="unit">{{ languageStore.gt('起', 'from') }}</span>
          </div>

          <!-- 特性列表 -->
          <div class="card-features">
            <div v-if="item.productType === '金币充值'" class="feature-item">
              <span class="highlight">{{ languageStore.gt('获得金币：', 'Coins:') }}</span>
              <span class="text strong">{{ item.goldCoinsAmount }}{{ languageStore.gt('枚', ' coins') }}</span>
            </div>
            <div v-if="item.productType === '购买会员'" class="feature-item">
              <span class="highlight">{{ languageStore.gt('下载次数：', 'Times:') }}</span>
              <span class="text strong">{{ item.dailyDownloadLimit }} {{ languageStore.gt('次', 'times') }}</span>
            </div>
            <div class="feature-item">
              <span class="highlight">{{ languageStore.gt('使用说明：', 'Usage:') }}</span>
              <span class="text">{{ languageStore.getItemDesc(item) }}</span>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="btn-wrapper">
          <el-button type="primary" class="buy-btn" @click="handleBuy(item)">{{
            languageStore.gt('立即充值', 'Recharge now')
          }}</el-button>
          <div class="cta-hint">{{ languageStore.gt('官方直充 · 到账更快', 'Official top-up · Faster arrival') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';
.product-section {
  width: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 auto 16px;
  color: #fff;
  letter-spacing: 0.2px;
  position: relative;
  padding-bottom: 6px;
  width: fit-content;
  text-align: center;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 64px;
    height: 2px;
    background: linear-gradient(90deg, $cgs-brandColor 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 0.85;
  }
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: clamp(20px, 2vw, 32px);
  justify-content: center;
}

@media (min-width: 1800px) {
  .cards {
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  }
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  padding: 18px 18px 16px;
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: saturate(120%) blur(8px);
  -webkit-backdrop-filter: saturate(120%) blur(8px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  }

  &.featured {
    border-color: rgba($color: $cgs-brandColor, $alpha: 0.85);
    box-shadow: 0 0 0 1px rgba($color: $cgs-brandColor, $alpha: 0.65);
  }

  .card-content {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; // 继续裁剪装饰背景
    z-index: 1;
  }

  // 装饰背景（光斑 + 斜向线条）
  .card-decor {
    position: absolute;
    inset: -1px;
    pointer-events: none;
    background:
      radial-gradient(600px 240px at 85% -10%, rgba($cgs-brandColor, 0.18), transparent 60%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.045) 25%, transparent 25%) -10px 0/ 20px 20px;
    opacity: 0.45;
    z-index: 0;
  }

  .featured-tag {
    position: absolute;
    top: 10px; // 放在卡片内边距范围，避免被裁剪
    right: 14px;
    background: linear-gradient(135deg, $cgs-brandColor 0%, rgba(255, 255, 255, 0.1) 100%);
    color: #fff;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
    z-index: 2; // 高于装饰与内容
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;

    i {
      color: $cgs-brandColor;
      font-size: 20px;
      filter: drop-shadow(0 2px 6px rgba($cgs-brandColor, 0.25));
    }
    .card-title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .meta {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;

    .chip {
      padding: 2px 8px;
      font-size: 12px;
      line-height: 18px;
      color: #d9d9d9;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      &.positive {
        color: #fff;
        border-color: rgba($cgs-brandColor, 0.45);
        background: rgba($cgs-brandColor, 0.25);
      }
    }
  }

  .card-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    margin: 6px 0 12px;

    .currency {
      color: $cgs-brandColor;
      font-size: 18px;
      font-weight: 700;
    }
    .amount {
      color: $cgs-brandColor;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 0.3px;
    }
    .unit {
      color: #a8a8a8;
      font-size: 12px;
      margin-left: 2px;
    }
  }

  .card-features {
    margin-top: auto;
    margin-bottom: 12px;

    .feature-item {
      display: grid;
      grid-template-columns: 92px 1fr;
      align-items: start;
      gap: 6px;
      color: #bbb;
      margin: 8px 0;
      font-size: 14px;

      .highlight {
        color: $cgs-brandColor;
        font-weight: 600;
      }
      .text.strong {
        color: #fff;
        font-weight: 600;
      }
    }
  }

  .btn-wrapper {
    padding-top: 10px;
    margin-top: auto;
    text-align: center;
  }

  .buy-btn {
    width: 100%;
    background: linear-gradient(135deg, $cgs-brandColor 0%, color.adjust($cgs-brandColor, $lightness: 8%) 100%);
    border: none;
    height: 42px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba($cgs-brandColor, 0.35);

    &:hover {
      opacity: 0.96;
      transform: translateY(-1px);
    }
  }

  .cta-hint {
    margin-top: 6px;
    font-size: 12px;
    color: #a6a6a6;
  }
}
</style>
