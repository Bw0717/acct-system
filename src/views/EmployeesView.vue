<template>
  <div class="employees-page">
    <header class="topbar">
      <router-link to="/dashboard" class="back-link">&larr; 返回選單</router-link>
      <span class="topbar-title">人員管理</span>
    </header>

    <main class="content">
      <!-- 上半部:DataGridView -->
      <section class="grid-section">
        <table class="data-grid">
          <thead>
            <tr>
              <th>工號</th>
              <th>帳號</th>
              <th>中文姓名</th>
              <th>英文姓名</th>
              <th>電話</th>
              <th>分機</th>
              <th>Email</th>
              <th>啟用</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in employees"
              :key="emp.sid"
              :class="{ selected: emp.sid === selectedSid }"
              @click="selectRow(emp)"
            >
              <td>{{ emp.emp_id }}</td>
              <td>{{ emp.account }}</td>
              <td>{{ emp.ctw_name }}</td>
              <td>{{ emp.eng_name }}</td>
              <td>{{ emp.tel_no }}</td>
              <td>{{ emp.tel_ex }}</td>
              <td>{{ emp.email }}</td>
              <td>
                <span class="badge" :class="emp.isenable === 'Y' ? 'badge-on' : 'badge-off'">
                  {{ emp.isenable === 'Y' ? '啟用' : '停用' }}
                </span>
              </td>
            </tr>
            <tr v-if="!employees.length">
              <td colspan="8" class="empty-row">尚無資料</td>
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
            <label>工號</label>
            <input v-model="form.empId" type="text" />
            <span v-if="fieldErrors.empId" class="field-error">{{ fieldErrors.empId }}</span>
          </div>

          <div class="field">
            <label>帳號</label>
            <input v-model="form.account" type="text" />
            <span v-if="fieldErrors.account" class="field-error">{{ fieldErrors.account }}</span>
          </div>

          <div class="field" v-if="!selectedSid">
            <label>密碼(新增時必填)</label>
            <input v-model="form.password" type="password" />
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

          <div class="field">
            <label>啟用狀態</label>
            <select v-model="form.isenable">
              <option value="Y">啟用</option>
              <option value="N">停用</option>
            </select>
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
import { authStore } from '../stores/auth'

interface Employee {
  sid: string
  emp_id: string
  account: string
  ctw_name: string | null
  eng_name: string | null
  tel_no: string | null
  tel_ex: string | null
  email: string | null
  isenable: string
}

const employees = ref<Employee[]>([])
const selectedSid = ref<string | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const fieldErrors = reactive({
  empId: '',
  account: '',
})

const form = reactive({
  empId: '',
  account: '',
  password: '',
  ctwName: '',
  engName: '',
  telNo: '',
  telEx: '',
  email: '',
  isenable: 'Y',
})

async function loadEmployees() {
  try {
    const res = await fetch('/api/employees/list')
    const data = await res.json()
    employees.value = data.items ?? []
  } catch (err) {
    errorMessage.value = '無法載入員工列表'
  }
}

onMounted(loadEmployees)

function selectRow(emp: Employee) {
  selectedSid.value = emp.sid
  form.empId = emp.emp_id
  form.account = emp.account
  form.password = ''
  form.ctwName = emp.ctw_name ?? ''
  form.engName = emp.eng_name ?? ''
  form.telNo = emp.tel_no ?? ''
  form.telEx = emp.tel_ex ?? ''
  form.email = emp.email ?? ''
  form.isenable = emp.isenable
  errorMessage.value = ''
  successMessage.value = ''
  fieldErrors.empId = ''
  fieldErrors.account = ''
}

function clearForm() {
  selectedSid.value = null
  form.empId = ''
  form.account = ''
  form.password = ''
  form.ctwName = ''
  form.engName = ''
  form.telNo = ''
  form.telEx = ''
  form.email = ''
  form.isenable = 'Y'
  errorMessage.value = ''
  successMessage.value = ''
  fieldErrors.empId = ''
  fieldErrors.account = ''
}

// 事前檢查唯一值欄位(工號、帳號),確認沒有重複才送出真正的新增/更新,
// 避免直接丟給 SQL 撞到 ORA-00001 之後還要回頭解讀原始錯誤訊息
async function checkUnique(): Promise<boolean> {
  fieldErrors.empId = ''
  fieldErrors.account = ''

  const res = await fetch('/api/employees/check-unique', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      empId: form.empId,
      account: form.account,
      excludeSid: selectedSid.value,
    }),
  })
  const data = await res.json()

  let ok = true
  if (data.empIdTaken) {
    fieldErrors.empId = '這個工號已經有人使用'
    ok = false
  }
  if (data.accountTaken) {
    fieldErrors.account = '這個帳號已經有人使用'
    ok = false
  }
  return ok
}

function validateRequired(): boolean {
  errorMessage.value = ''
  if (!form.empId.trim() || !form.account.trim()) {
    errorMessage.value = '工號與帳號為必填'
    return false
  }
  if (!selectedSid.value && !form.password.trim()) {
    errorMessage.value = '新增時密碼為必填'
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

    const res = await fetch('/api/employees/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empId: form.empId,
        account: form.account,
        password: form.password,
        ctwName: form.ctwName,
        engName: form.engName,
        telNo: form.telNo,
        telEx: form.telEx,
        email: form.email,
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
    await loadEmployees()
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

    const res = await fetch('/api/employees/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sid: selectedSid.value,
        empId: form.empId,
        account: form.account,
        ctwName: form.ctwName,
        engName: form.engName,
        telNo: form.telNo,
        telEx: form.telEx,
        email: form.email,
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
    await loadEmployees()
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!selectedSid.value) return
  if (!confirm(`確定要刪除「${form.account}」這筆員工資料嗎?`)) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await fetch('/api/employees/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sid: selectedSid.value,
        operator: authStore.state.user?.username,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.message || '刪除失敗'
      return
    }

    successMessage.value = '刪除成功'
    clearForm()
    await loadEmployees()
  } catch (err) {
    errorMessage.value = '伺服器發生錯誤,請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.employees-page {
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

/* Responsive: better layout on small/mobile screens */
@media (max-width: 768px) {
  .topbar {
    padding: 10px 16px;
    gap: 8px;
  }

  .content {
    max-width: 100%;
    padding: 16px;
    gap: 20px;
  }

  .grid-section {
    max-height: 240px;
  }

  .data-grid {
    font-size: 12px;
  }

  .data-grid th,
  .data-grid td {
    padding: 8px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .button-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .button-row .btn {
    width: 100%;
  }
}
</style>
