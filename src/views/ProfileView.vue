<template>
  <div class="profile-page">
    <header class="topbar">
      <router-link to="/dashboard" class="back-link">&larr; 返回選單</router-link>
      <span class="topbar-title">修改資料</span>
    </header>

    <main class="content">
      <div class="form-card">
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

        <div class="field">
          <label>工號</label>
          <input :value="form.empId" type="text" readonly disabled />
        </div>

        <div class="field">
          <label>帳號</label>
          <input :value="form.account" type="text" readonly disabled />
        </div>

        <div class="field">
          <label>中文姓名</label>
          <input v-model="form.ctwName" type="text" />
        </div>

        <div class="field">
          <label>英文姓名</label>
          <input v-model="form.engName" type="text" />
        </div>

        <div class="field">
          <label>電話</label>
          <input v-model="form.telNo" type="text" />
        </div>

        <div class="field">
          <label>分機</label>
          <input v-model="form.telEx" type="text" />
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" />
        </div>

        <button class="submit-btn" :disabled="loading" @click="handleSubmit">
          <span v-if="!loading">儲存</span>
          <span v-else class="spinner" aria-label="送出中"></span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { authStore } from '../stores/auth'

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  empId: '',
  account: '',
  ctwName: '',
  engName: '',
  telNo: '',
  telEx: '',
  email: '',
})

async function loadProfile() {
  const account = authStore.state.user?.username
  if (!account) return

  try {
    const res = await fetch(`/api/profile/get?account=${encodeURIComponent(account)}`)
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '無法載入個人資料'
      return
    }

    form.empId = data.emp_id
    form.account = data.account
    form.ctwName = data.ctw_name ?? ''
    form.engName = data.eng_name ?? ''
    form.telNo = data.tel_no ?? ''
    form.telEx = data.tel_ex ?? ''
    form.email = data.email ?? ''
  } catch (err) {
    errorMessage.value = '無法連線到伺服器'
  }
}

onMounted(loadProfile)

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account: authStore.state.user?.username,
        ctwName: form.ctwName,
        engName: form.engName,
        telNo: form.telNo,
        telEx: form.telEx,
        email: form.email,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '更新失敗'
      return
    }

    successMessage.value = '資料已更新'
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'IBM Plex Sans', 'Noto Sans TC', sans-serif;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 32px;
  border-bottom: 1px solid #e2e5e9;
}

.back-link {
  font-size: 13px;
  color: #6b7280;
  text-decoration: none;
}

.back-link:hover {
  color: #1b2a4a;
}

.topbar-title {
  font-family: 'Source Serif 4', 'Noto Serif TC', serif;
  font-size: 17px;
  font-weight: 600;
  color: #1b2a4a;
}

.content {
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 32px;
}

.form-card {
  position: relative;
  border: 1px solid #e2e5e9;
  border-radius: 4px;
  padding: 32px 32px 28px 36px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: #a13f2b;
}

.error-text {
  margin: 0;
  font-size: 13px;
  color: #a13f2b;
}

.success-text {
  margin: 0;
  font-size: 13px;
  color: #2f6f4e;
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
}

.field input:focus {
  border-color: #1b2a4a;
}

.field input:disabled {
  background: #f7f7f5;
  color: #9ca3af;
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
</style>
