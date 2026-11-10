import { nextTick, onActivated, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

/** 保留素材页面离开时的滚动位置，恢复列表布局后再还原。 */
export const useBrowseScroll = () => {
  const browseElement = ref<HTMLElement>()
  let scrollTop = 0
  onBeforeRouteLeave(() => {
    scrollTop = browseElement.value?.scrollTop ?? 0
  })
  onActivated(async () => {
    await nextTick()
    if (browseElement.value) browseElement.value.scrollTop = scrollTop
  })
  return browseElement
}
