<template>
  <div class="login-page">
    <div class="brand">
      <svg class="brand-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4" y="4" width="40" height="40" rx="2" stroke="#1B2A4A" stroke-width="2" />
        <line x1="24" y1="4" x2="24" y2="44" stroke="#1B2A4A" stroke-width="2" />
        <line x1="4" y1="16" x2="44" y2="16" stroke="#1B2A4A" stroke-width="2" />
      </svg>
      <h1 class="brand-name">帳務管理系統</h1>
      <p class="brand-tagline">設定新密碼</p>
    </div>

    <form v-if="!done" class="login-card" @submit.prevent="handleSubmit">
      <div class="field">
        <label for="newPassword">新密碼</label>
        <input
          id="newPassword"
          v-model="newPassword"
          type="password"
          autocomplete="new-password"
          placeholder="至少 8 碼"
          :disabled="loading"
        />
      </div>

      <div class="field">
        <label for="confirmPassword">確認新密碼</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          placeholder="再輸入一次"
          :disabled="loading"
        />
      </div>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <button type="submit" class="submit-btn" :disabled="loading">
        <span v-if="!loading">更新密碼</span>
        <span v-else class="spinner" aria-label="送出中"></span>
      </button>
    </form>

    <div v-else class="login-card">
      <p class="hint-text">密碼已更新,請用新密碼重新登入。</p>
      <router-link to="/login" class="forgot-link">前往登入</router-link>
    </div>

    <p class="footer-stamp">帳務管理系統 &middot; 內部使用 &middot; v0.1.0</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = route.query.token as string | undefined

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const done = ref(false)

async function handleSubmit() {
  errorMessage.value = ''

  if (!token) {
    errorMessage.value = '連結無效或已過期,請重新申請'
    return
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = '密碼至少需要 8 碼'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '兩次輸入的密碼不一致'
    return
  }

  loading.value = true

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: newPassword.value }),
    })

    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '連結無效或已過期,請重新申請'
      return
    }

    done.value = true
  } catch (err) {
    errorMessage.value = '無法連線到伺服器,請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 24px;
  background-color: #ffffff;
  font-family: 'IBM Plex Sans', 'Noto Sans TC', sans-serif;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  margin-bottom: 4px;
}

.brand-name {
  font-family: 'Source Serif 4', 'Noto Serif TC', serif;
  font-size: 26px;
  font-weight: 600;
  color: #1b2a4a;
  margin: 0;
  letter-spacing: 0.01em;
}

.brand-tagline {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border: 1px solid #e2e5e9;
  border-radius: 4px;
  padding: 32px 32px 28px 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: #a13f2b;
}

.hint-text {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: #1b2a4a;
}

.field input {
  height: 40px;
  padding: 0 12px;
  font-size: 15px;
  font-family: inherit;
  color: #1b2a4a;
  background: #ffffff;
  border: 1px solid #e2e5e9;
  border-radius: 3px;
  outline: none;
  transition: border-color 0.15s ease;
}

.field input:focus {
  border-color: #1b2a4a;
}

.field input:disabled {
  background: #f7f7f5;
  color: #9ca3af;
}

.error-text {
  margin: 0;
  font-size: 13px;
  color: #a13f2b;
}

.submit-btn {
  height: 42px;
  border: none;
  border-radius: 3px;
  background: #1b2a4a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #24365c;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.forgot-link {
  align-self: center;
  font-size: 13px;
  color: #6b7280;
  text-decoration: none;
}

.forgot-link:hover {
  color: #1b2a4a;
  text-decoration: underline;
}

.footer-stamp {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #9ca3af;
  letter-spacing: 0.02em;
  margin: 0;
}
</style>
