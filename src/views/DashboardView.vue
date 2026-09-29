<template>
  <div class="dashboard">
    <header class="topbar">
      <div class="topbar-brand">
        <svg class="brand-mark-sm" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="2" stroke="#1B2A4A" stroke-width="3" />
          <line x1="24" y1="4" x2="24" y2="44" stroke="#1B2A4A" stroke-width="3" />
          <line x1="4" y1="16" x2="44" y2="16" stroke="#1B2A4A" stroke-width="3" />
        </svg>
        <span class="topbar-title">帳務管理系統</span>
      </div>

      <div class="topbar-user" ref="userMenuRef">
        <button class="user-trigger" @click="menuOpen = !menuOpen">
          <span class="username">{{ authStore.state.user?.displayName ?? authStore.state.user?.username }}</span>
          <svg class="chevron" :class="{ open: menuOpen }" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <Transition name="dropdown">
          <div v-if="menuOpen" class="dropdown">
            <router-link to="/profile" class="dropdown-item" @click="menuOpen = false">修改資料</router-link>
            <router-link to="/change-password" class="dropdown-item" @click="menuOpen = false">修改密碼</router-link>
            <button class="dropdown-item dropdown-item-danger" @click="handleLogout">登出</button>
          </div>
        </Transition>
      </div>
    </header>

    <main class="content">
      <h1 class="page-title">選單</h1>

      <div class="module-grid">
        <router-link v-if="authStore.hasPermission('income')" to="/income" class="module-card">
          <svg class="module-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="6" y="4" width="20" height="24" rx="1" stroke="#1B2A4A" stroke-width="1.6" />
            <path d="M16 12v8M12 16l4 4 4-4" stroke="#A13F2B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="module-name">收入記帳</span>
        </router-link>

        <router-link v-if="authStore.hasPermission('expense')" to="/expense" class="module-card">
          <svg class="module-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="6" y="4" width="20" height="24" rx="1" stroke="#1B2A4A" stroke-width="1.6" />
            <path d="M16 12v8M12 16l4-4 4 4" stroke="#2F6F4E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="module-name">支出記帳</span>
        </router-link>

        <router-link v-if="authStore.hasPermission('payroll')" to="/payroll" class="module-card">
          <svg class="module-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="6" y="4" width="20" height="24" rx="1" stroke="#1B2A4A" stroke-width="1.6" />
            <circle cx="16" cy="16" r="5" stroke="#1B2A4A" stroke-width="1.6" />
            <path d="M14.5 16h3M16 14.5v3" stroke="#1B2A4A" stroke-width="1.4" stroke-linecap="round" />
          </svg>
          <span class="module-name">人員工資</span>
        </router-link>

        <router-link v-if="authStore.hasPermission('projects')" to="/projects" class="module-card">
          <svg class="module-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="5" y="12" width="22" height="14" rx="1" stroke="#1B2A4A" stroke-width="1.6" />
            <path d="M12 12V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" stroke="#1B2A4A" stroke-width="1.6" />
          </svg>
          <span class="module-name">客戶工程</span>
        </router-link>

        <router-link v-if="authStore.hasPermission('reports')" to="/reports" class="module-card">
          <svg class="module-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 26V14M14 26V8M22 26V17M26 26H6" stroke="#1B2A4A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="module-name">月報表</span>
        </router-link>

        <router-link v-if="authStore.hasPermission('audit-log')" to="/audit-log" class="module-card">
          <svg class="module-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="16" cy="16" r="10" stroke="#1B2A4A" stroke-width="1.6" />
            <path d="M16 10v6l4 3" stroke="#1B2A4A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="module-name">操作追蹤報表</span>
        </router-link>

        <router-link v-if="authStore.hasPermission('groups')" to="/groups" class="module-card">
          <svg class="module-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="5" y="6" width="9" height="9" rx="1" stroke="#1B2A4A" stroke-width="1.6" />
            <rect x="18" y="6" width="9" height="9" rx="1" stroke="#1B2A4A" stroke-width="1.6" />
            <rect x="11.5" y="19" width="9" height="9" rx="1" stroke="#1B2A4A" stroke-width="1.6" />
          </svg>
          <span class="module-name">群組管理</span>
        </router-link>

        <router-link v-if="authStore.hasPermission('employees')" to="/employees" class="module-card">
          <svg class="module-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="3.5" stroke="#1B2A4A" stroke-width="1.6" />
            <circle cx="21" cy="14" r="2.8" stroke="#1B2A4A" stroke-width="1.6" />
            <path d="M6 25c0-3.6 2.7-6 6-6s6 2.4 6 6M18 25c0-2.8 1.9-4.7 4.5-4.7s4.5 1.9 4.5 4.7" stroke="#1B2A4A" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <span class="module-name">人員管理</span>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

const router = useRouter()
const menuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function handleLogout() {
  menuOpen.value = false
  authStore.clearUser()
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'IBM Plex Sans', 'Noto Sans TC', sans-serif;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  border-bottom: 1px solid #e2e5e9;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark-sm {
  width: 22px;
  height: 22px;
}

.topbar-title {
  font-family: 'Source Serif 4', 'Noto Serif TC', serif;
  font-size: 17px;
  font-weight: 600;
  color: #1b2a4a;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar-user {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 4px;
  background: none;
  border: none;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #1b2a4a;
}

.chevron {
  width: 10px;
  height: 7px;
  transition: transform 0.15s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: #ffffff;
  border: 1px solid #e2e5e9;
  border-radius: 4px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
  transform-origin: top right;
}

.dropdown-enter-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.85) translateY(-4px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1) translateY(0);
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  color: #1b2a4a;
  background: none;
  border: none;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f7f7f5;
}

.dropdown-item-danger {
  color: #a13f2b;
}

.content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 32px 64px;
}

.page-title {
  font-family: 'Source Serif 4', 'Noto Serif TC', serif;
  font-size: 22px;
  font-weight: 600;
  color: #1b2a4a;
  margin: 0 0 28px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 28px 16px;
  background: #ffffff;
  border: 1px solid #e2e5e9;
  border-radius: 4px;
  text-decoration: none;
  transition: border-color 0.15s ease;
}

.module-card:hover {
  border-color: #1b2a4a;
}

.module-icon {
  width: 32px;
  height: 32px;
}

.module-name {
  font-size: 14px;
  font-weight: 500;
  color: #1b2a4a;
}
</style>