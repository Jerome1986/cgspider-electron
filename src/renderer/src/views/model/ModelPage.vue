<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = (): void => {
  router.push('/login')
}
</script>

<template>
  <div>模型</div>
</template>

<style scoped lang="scss"></style>
