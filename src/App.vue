<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from './stores/auth'

const router = useRouter()

const IDLE_LIMIT_MS = 10 * 60 * 1000 // 10 分鐘
const CHECK_INTERVAL_MS = 15 * 1000 // 每 15 秒檢查一次

let lastActivity = Date.now()
let checkTimer: ReturnType<typeof setInterval> | undefined

function markActivity() {
  lastActivity = Date.now()
}

function checkIdle() {
  if (!authStore.state.user) return

  if (Date.now() - lastActivity >= IDLE_LIMIT_MS) {
    authStore.clearUser()
    router.push('/login')
  }
}

const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

onMounted(() => {
  activityEvents.forEach((evt) => window.addEventListener(evt, markActivity))
  checkTimer = setInterval(checkIdle, CHECK_INTERVAL_MS)
})

onUnmounted(() => {
  activityEvents.forEach((evt) => window.removeEventListener(evt, markActivity))
  if (checkTimer) clearInterval(checkTimer)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'IBM Plex Sans', 'Noto Sans TC', sans-serif;
}
</style>