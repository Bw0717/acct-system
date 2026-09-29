<template>
  <div class="group-detail-page">
    <header class="topbar">
      <router-link to="/groups" class="back-link">&larr; 返回群組管理</router-link>
      <span class="topbar-title">群組明細:{{ groupId }}</span>
    </header>

    <main class="content">
      <section class="add-section">
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

        <div class="add-row">
          <div class="field">
            <label>帳號</label>
            <select v-model="newAccount">
              <option value="" disabled>請選擇要加入的帳號</option>
              <option v-for="emp in activeAccounts" :key="emp.account" :value="emp.account">
                {{ emp.account }}{{ emp.ctw_name ? `(${emp.ctw_name})` : '' }}
              </option>
            </select>
          </div>
          <button class="btn btn-primary" :disabled="loading" @click="handleAdd">加入群組</button>
        </div>
      </section>

      <section class="grid-section">
        <table class="data-grid">
          <thead>
            <tr>
              <th>帳號</th>
              <th>異動人員</th>
              <th>異動時間</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.sid">
              <td>{{ member.account }}</td>
              <td>{{ member.motifer }}</td>
              <td>{{ member.motify_time }}</td>
              <td>
                <button class="btn-remove" @click="handleRemove(member.sid)">移除</button>
              </td>
            </tr>
            <tr v-if="!members.length">
              <td colspan="4" class="empty-row">此群組尚無成員</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authStore } from '../stores/auth'

interface Member {
  sid: string
  account: string
  motifer: string | null
  motify_time: string | null
}

interface ActiveAccount {
  account: string
  ctw_name: string | null
}

const route = useRoute()
const groupId = route.params.groupId as string

const members = ref<Member[]>([])
const activeAccounts = ref<ActiveAccount[]>([])
const newAccount = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function loadMembers() {
  try {
    const res = await fetch(`/api/group-dtl/list?groupId=${encodeURIComponent(groupId)}`)
    const data = await res.json()
    members.value = data.items ?? []
  } catch (err) {
    errorMessage.value = '無法載入群組成員'
  }
}

async function loadActiveAccounts() {
  try {
    const res = await fetch('/api/employees/active-accounts')
    const data = await res.json()
    activeAccounts.value = data.items ?? []
  } catch (err) {
    errorMessage.value = '無法載入可選帳號清單'
  }
}

onMounted(() => {
  loadMembers()
  loadActiveAccounts()
})

async function handleAdd() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!newAccount.value) {
    errorMessage.value = '請選擇帳號'
    return
  }

  loading.value = true
  try {
    const res = await fetch('/api/group-dtl/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        account: newAccount.value,
        operator: authStore.state.user?.username,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '加入失敗'
      return
    }

    successMessage.value = '加入成功'
    newAccount.value = ''
    await loadMembers()
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  } finally {
    loading.value = false
  }
}

async function handleRemove(sid: string) {
  if (!confirm('確定要把這個帳號移出群組嗎?')) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await fetch('/api/group-dtl/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid }),
    })
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '移除失敗'
      return
    }

    successMessage.value = '移除成功'
    await loadMembers()
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  }
}
</script>

<style scoped>
.group-detail-page {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.add-section {
  border: 1px solid #e2e5e9;
  border-radius: 4px;
  padding: 20px 20px 20px 24px;
  position: relative;
}

.add-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: #a13f2b;
}

.add-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: #1b2a4a;
}

.field input,
.field select {
  height: 38px;
  padding: 0 10px;
  font-size: 14px;
  font-family: inherit;
  color: #1b2a4a;
  background: #ffffff;
  border: 1px solid #e2e5e9;
  border-radius: 3px;
  outline: none;
}

.field input:focus,
.field select:focus {
  border-color: #1b2a4a;
}

.error-text {
  margin: 0 0 12px;
  font-size: 13px;
  color: #a13f2b;
}

.success-text {
  margin: 0 0 12px;
  font-size: 13px;
  color: #2f6f4e;
}

.btn {
  height: 38px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #1b2a4a;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #24365c;
}

.grid-section {
  border: 1px solid #e2e5e9;
  border-radius: 4px;
  overflow: auto;
}

.data-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-grid th {
  background: #f7f7f5;
  text-align: left;
  padding: 10px 12px;
  font-weight: 500;
  color: #1b2a4a;
  border-bottom: 1px solid #e2e5e9;
}

.data-grid td {
  padding: 9px 12px;
  border-bottom: 1px solid #f0f0ee;
  color: #1b2a4a;
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 24px;
}

.btn-remove {
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
  font-family: inherit;
  color: #a13f2b;
  background: #ffffff;
  border: 1px solid #a13f2b;
  border-radius: 3px;
  cursor: pointer;
}

.btn-remove:hover {
  background: #fdf2ef;
}
</style>
