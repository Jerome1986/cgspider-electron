import { ref } from 'vue'

export const itemSize = ref(470) // 默认尺寸
const minSize = 200 // 最小尺寸
const maxSize = 600 // 最大尺寸

// 处理鼠标滚轮事件--动态尺寸控制
export const handleWheel = (e: WheelEvent) => {
  // 检查是否按下 Ctrl 键
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault() // 阻止默认滚动行为

    // 根据滚轮方向调整尺寸
    const delta = e.deltaY > 0 ? -5 : 5
    const newSize = Math.max(minSize, Math.min(maxSize, itemSize.value + delta))

    // 只有当尺寸变化时才更新
    if (newSize !== itemSize.value) {
      itemSize.value = newSize
    }
  }
}
