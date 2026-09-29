<template>
  <div class="attr-page">
    <header class="topbar">
      <router-link to="/groups" class="back-link">&larr; 返回群組管理</router-link>
      <span class="topbar-title">群組定義:{{ groupId }}</span>
    </header>

    <main class="content">
      <div class="form-card">
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

        <p class="hint-text">勾選的模組,代表這個群組底下的帳號登入後可以操作。</p>

        <div class="option-list">
          <label v-for="opt in optionDefs" :key="opt.key" class="option-row">
            <input type="checkbox" true-value="Y" false-value="N" v-model="options[opt.key]" />
            <span>{{ opt.label }}</span>
          </label>
        </div>

        <button class="submit-btn" :disabled="loading" @click="handleSave">
          <span v-if="!loading">儲存</span>
          <span v-else class="spinner" aria-label="送出中"></span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const groupId = route.params.groupId as string

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const optionDefs = [
  { key: 'option1', label: '收入記帳' },
  { key: 'option2', label: '支出記帳' },
  { key: 'option3', label: '人員工資' },
  { key: 'option4', label: '客戶工程' },
  { key: 'option5', label: '月報表' },
  { key: 'option6', label: '操作追蹤報表' },
  { key: 'option7', label: '群組管理' },
  { key: 'option8', label: '人員管理' },
  { key: 'option9', label: '選項9' },
  { key: 'option10', label: '選項10' },
] as const

const options = reactive<Record<string, string>>({
  option1: 'N', option2: 'N', option3: 'N', option4: 'N', option5: 'N',
  option6: 'N', option7: 'N', option8: 'N', option9: 'N', option10: 'N',
})

async function loadAttr() {
  try {
    const res = await fetch(`/api/group-attr/get?groupId=${encodeURIComponent(groupId)}`)
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '無法載入群組定義'
      return
    }

    for (const opt of optionDefs) {
      options[opt.key] = data[opt.key] ?? 'N'
    }
  } catch (err) {
    errorMessage.value = '無法連線到伺服器'
  }
}

onMounted(loadAttr)

async function handleSave() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const res = await fetch('/api/group-attr/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        options,
        operator: authStore.state.user?.username,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '儲存失敗'
      return
    }

    successMessage.value = '權限定義已儲存'
    router.push('/groups')
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.attr-page {
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

.hint-text {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 14px;
  color: #1b2a4a;
  cursor: pointer;
  border-bottom: 1px solid #f0f0ee;
}

.option-row input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #1b2a4a;
  cursor: pointer;
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
