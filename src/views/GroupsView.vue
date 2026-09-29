<template>
  <div class="groups-page">
    <header class="topbar">
      <router-link to="/dashboard" class="back-link">&larr; 返回選單</router-link>
      <span class="topbar-title">群組管理</span>
    </header>

    <main class="content">
      <!-- 上半部:DataGridView -->
      <section class="grid-section">
        <table class="data-grid">
          <thead>
            <tr>
              <th>群組ID</th>
              <th>群組名稱</th>
              <th>群組類別</th>
              <th>啟用狀態</th>
              <th>成員</th>
              <th>群組定義</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="group in groups"
              :key="group.sid"
              :class="{ selected: group.sid === selectedSid }"
              @click="selectRow(group)"
            >
              <td>{{ group.group_id }}</td>
              <td>{{ group.group_name }}</td>
              <td>{{ group.type }}</td>
              <td>
                <span class="badge" :class="group.isenable === 'Y' ? 'badge-on' : 'badge-off'">
                  {{ group.isenable === 'Y' ? '啟用' : '停用' }}
                </span>
              </td>
              <td>
                <button class="btn-detail" @click.stop="goDetail(group.group_id)">成員管理</button>
              </td>
              <td>
                <button class="btn-detail" @click.stop="goAttr(group.group_id)">定義設定</button>
              </td>
            </tr>
            <tr v-if="!groups.length">
              <td colspan="6" class="empty-row">尚無資料</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 下半部:欄位編輯區 -->
      <section class="form-section">
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

        <div class="form-grid">
          <div class="field">
            <label>群組ID</label>
            <input v-model="form.groupId" type="text" />
            <span v-if="fieldErrors.groupId" class="field-error">{{ fieldErrors.groupId }}</span>
          </div>

          <div class="field">
            <label>群組名稱</label>
            <input v-model="form.groupName" type="text" />
          </div>

          <div class="field">
            <label>群組類別</label>
            <select v-model="form.type">
              <option value="部門">部門</option>
              <option value="專案">專案</option>
              <option value="權限">權限</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div class="field">
            <label>啟用狀態</label>
            <div class="radio-row">
              <label class="radio-option">
                <input type="radio" value="Y" v-model="form.isenable" /> 啟用
              </label>
              <label class="radio-option">
                <input type="radio" value="N" v-model="form.isenable" /> 停用
              </label>
            </div>
          </div>
        </div>

        <div class="button-row">
          <button class="btn btn-primary" :disabled="loading" @click="handleCreate">新增</button>
          <button class="btn btn-primary" :disabled="loading || !selectedSid" @click="handleUpdate">更新</button>
          <button class="btn btn-danger" :disabled="loading || !selectedSid" @click="handleDelete">刪除</button>
          <button class="btn btn-ghost" :disabled="loading" @click="clearForm">清空</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

interface Group {
  sid: string
  group_id: string
  group_name: string | null
  type: string | null
  isenable: string
}

const router = useRouter()
const groups = ref<Group[]>([])
const selectedSid = ref<string | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const fieldErrors = reactive({ groupId: '' })

const form = reactive({
  groupId: '',
  groupName: '',
  type: '部門',
  isenable: 'Y',
})

async function loadGroups() {
  try {
    const res = await fetch('/api/groups/list')
    const data = await res.json()
    groups.value = data.items ?? []
  } catch (err) {
    errorMessage.value = '無法載入群組列表'
  }
}

onMounted(loadGroups)

function selectRow(group: Group) {
  selectedSid.value = group.sid
  form.groupId = group.group_id
  form.groupName = group.group_name ?? ''
  form.type = group.type ?? '部門'
  form.isenable = group.isenable
  errorMessage.value = ''
  successMessage.value = ''
  fieldErrors.groupId = ''
}

function clearForm() {
  selectedSid.value = null
  form.groupId = ''
  form.groupName = ''
  form.type = '部門'
  form.isenable = 'Y'
  errorMessage.value = ''
  successMessage.value = ''
  fieldErrors.groupId = ''
}

function goDetail(groupId: string) {
  router.push(`/groups/${groupId}/detail`)
}

function goAttr(groupId: string) {
  router.push(`/groups/${groupId}/attr`)
}

async function checkUnique(): Promise<boolean> {
  fieldErrors.groupId = ''

  const res = await fetch('/api/groups/check-unique', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId: form.groupId, excludeSid: selectedSid.value }),
  })
  const data = await res.json()

  if (data.groupIdTaken) {
    fieldErrors.groupId = '這個群組ID已經有人使用'
    return false
  }
  return true
}

function validateRequired(): boolean {
  errorMessage.value = ''
  if (!form.groupId.trim()) {
    errorMessage.value = '群組ID為必填'
    return false
  }
  return true
}

async function handleCreate() {
  if (!validateRequired()) return
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const isUnique = await checkUnique()
    if (!isUnique) {
      loading.value = false
      return
    }

    const res = await fetch('/api/groups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: form.groupId,
        groupName: form.groupName,
        type: form.type,
        isenable: form.isenable,
        operator: authStore.state.user?.username,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '新增失敗'
      return
    }

    successMessage.value = '新增成功'
    clearForm()
    await loadGroups()
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  if (!selectedSid.value) return
  if (!validateRequired()) return
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const isUnique = await checkUnique()
    if (!isUnique) {
      loading.value = false
      return
    }

    const res = await fetch('/api/groups/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sid: selectedSid.value,
        groupId: form.groupId,
        groupName: form.groupName,
        type: form.type,
        isenable: form.isenable,
        operator: authStore.state.user?.username,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '更新失敗'
      return
    }

    successMessage.value = '更新成功'
    await loadGroups()
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!selectedSid.value) return
  if (!confirm(`確定要刪除「${form.groupId}」這個群組嗎?`)) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await fetch('/api/groups/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid: selectedSid.value }),
    })
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '刪除失敗'
      return
    }

    successMessage.value = '刪除成功'
    clearForm()
    await loadGroups()
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.groups-page {
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.grid-section {
  border: 1px solid #e2e5e9;
  border-radius: 4px;
  overflow: auto;
  max-height: 360px;
}

.data-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-grid th {
  position: sticky;
  top: 0;
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

.data-grid tbody tr {
  cursor: pointer;
}

.data-grid tbody tr:hover {
  background: #f7f7f5;
}

.data-grid tbody tr.selected {
  background: #eef1f6;
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 24px;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.badge-on {
  background: #eaf3ee;
  color: #2f6f4e;
}

.badge-off {
  background: #f5eae7;
  color: #a13f2b;
}

.btn-detail {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-family: inherit;
  color: #1b2a4a;
  background: #ffffff;
  border: 1px solid #e2e5e9;
  border-radius: 3px;
  cursor: pointer;
}

.btn-detail:hover {
  border-color: #1b2a4a;
}

.form-section {
  border: 1px solid #e2e5e9;
  border-radius: 4px;
  padding: 24px;
  position: relative;
}

.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: #a13f2b;
}

.error-text {
  margin: 0 0 16px;
  font-size: 13px;
  color: #a13f2b;
}

.success-text {
  margin: 0 0 16px;
  font-size: 13px;
  color: #2f6f4e;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
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

.field-error {
  font-size: 12px;
  color: #a13f2b;
}

.radio-row {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 38px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #1b2a4a;
  cursor: pointer;
}

.button-row {
  display: flex;
  gap: 12px;
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

.btn-danger {
  background: #ffffff;
  color: #a13f2b;
  border-color: #a13f2b;
}

.btn-danger:hover:not(:disabled) {
  background: #fdf2ef;
}

.btn-ghost {
  background: #ffffff;
  color: #6b7280;
  border-color: #e2e5e9;
}

.btn-ghost:hover:not(:disabled) {
  border-color: #1b2a4a;
  color: #1b2a4a;
}
</style>
