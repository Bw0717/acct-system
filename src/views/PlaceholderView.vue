<template>
  <div class="placeholder">
    <p class="placeholder-text">{{ title }} — 此模組尚未建置</p>
    <router-link to="/dashboard" class="back-link">返回</router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => (route.meta.title as string) ?? '此頁面')
</script>

<style scoped>
.placeholder {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-family: 'IBM Plex Sans', 'Noto Sans TC', sans-serif;
}

.placeholder-text {
  font-size: 15px;
  color: #6b7280;
}

.back-link {
  font-size: 13px;
  color: #1b2a4a;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
