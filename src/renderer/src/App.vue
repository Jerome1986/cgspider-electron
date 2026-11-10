<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore, useMaterialStore } from '@/stores'
import { userIdInfoGetApi } from '@/api/user'

const user = useUserStore(),
  material = useMaterialStore()
const ready = ref(false)
// 重新验证旧缓存令牌，账号切换同步清理个人列表；本地路径按账号隔离保存。
watch(
  () => user.userInfo.token,
  async (token) => {
    ready.value = false
    material.clearSession()
    material.setCollect(false)
    material.setDownload(false)
    material.checkListFilter = []
    try {
      if (token) {
        const current = await userIdInfoGetApi()
        if (user.userInfo.token !== token) return
        user.setUserInfo(current.data)
        // 辅助状态不阻塞素材页面显示。
        void Promise.allSettled([
          material.materialLoveListGet(user.userInfo._id),
          material.downLoadListGet(user.userInfo._id)
        ])
      }
    } catch {
      /* 401由请求层清理；网络失败保留账号，页面允许重试。 */
    } finally {
      if (user.userInfo.token === token) ready.value = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <router-view v-if="ready" />
  <div v-else>正在连接服务…</div>
</template>
