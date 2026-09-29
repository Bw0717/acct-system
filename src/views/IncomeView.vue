<template>
  <div class="income-container">
    <header class="page-header">
      <h1>📊 收入記帳</h1>
      <button class="btn btn-primary" @click="openNewModal">+ 新增記帳</button>
    </header>

    <!-- 搜尋條件 -->
    <div class="filters-section">
      <input
        v-model="filters.customerName"
        type="text"
        placeholder="客戶名稱"
        class="input-field"
      />
      <input
        v-model.lazy="filters.billDateStart"
        type="date"
        class="input-field"
      />
      <input
        v-model.lazy="filters.billDateEnd"
        type="date"
        class="input-field"
      />
      <select v-model="filters.collectionStatus" class="input-field">
        <option value="">全部狀態</option>
        <option value="Y">已收款</option>
        <option value="N">未收款</option>
      </select>
      <button class="btn btn-secondary" @click="loadIncomes">搜尋</button>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper">
      <table class="income-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>憑據</th>
            <th>客戶名稱</th>
            <th>工項</th>
            <th>施作人員</th>
            <th>地點</th>
            <th>報價金額</th>
            <th>實做金額</th>
            <th>未收金額</th>
            <th>收款方式</th>
            <th>收款狀態</th>
            <th>成本金額</th>
            <th>預估毛利</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="incomes.length === 0">
            <td colspan="14" class="text-center">暫無記帳資料</td>
          </tr>
          <tr v-for="income in incomes" :key="income.INCOME_ID">
            <td>{{ formatDate(income.BILL_DATE) }}</td>
            <td>{{ income.INVOICE_NO || '-' }}</td>
            <td>{{ income.CUSTOMER_NAME }}</td>
            <td>{{ income.PROJECT || '-' }}</td>
            <td>{{ income.PERSONNEL || '-' }}</td>
            <td>{{ income.LOCATION || '-' }}</td>
            <td class="text-right">{{ formatCurrency(income.QUOTE_AMOUNT) }}</td>
            <td class="text-right">{{ formatCurrency(income.ACTUAL_AMOUNT) }}</td>
            <td class="text-right">{{ formatCurrency(income.UNCOLLECTED_AMOUNT) }}</td>
            <td>{{ income.COLLECTION_METHOD || '-' }}</td>
            <td>
              <span :class="['status-badge', income.COLLECTION_STATUS === 'Y' ? 'collected' : 'uncollected']">
                {{ income.COLLECTION_STATUS === 'Y' ? '已收款' : '未收款' }}
              </span>
            </td>
            <td class="text-right">{{ formatCurrency(income.COST_AMOUNT) }}</td>
            <td class="text-right">{{ formatCurrency(income.ESTIMATED_PROFIT) }}</td>
            <td class="action-cell">
              <button class="btn-action edit" @click="editIncome(income)">編輯</button>
              <button class="btn-action view-history" @click="viewHistory(income.INCOME_ID)">歷史</button>
              <button class="btn-action delete" @click="deleteIncome(income.INCOME_ID)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 -->
    <div class="pagination" v-if="totalRecords > limit">
      <button
        class="btn btn-secondary"
        :disabled="offset === 0"
        @click="previousPage"
      >
        上一頁
      </button>
      <span class="page-info">
        第 {{ Math.floor(offset / limit) + 1 }} / {{ Math.ceil(totalRecords / limit) }} 頁
        (共 {{ totalRecords }} 筆)
      </span>
      <button
        class="btn btn-secondary"
        :disabled="offset + limit >= totalRecords"
        @click="nextPage"
      >
        下一頁
      </button>
    </div>

    <!-- 新增/編輯模態框 -->
    <IncomeFormModal
      v-if="showFormModal"
      :income="selectedIncome"
      @save="saveIncome"
      @close="showFormModal = false"
    />

    <!-- 歷史記錄模態框 -->
    <IncomeHistoryModal
      v-if="showHistoryModal"
      :income-id="selectedIncomeId"
      @close="showHistoryModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IncomeFormModal from '../components/IncomeFormModal.vue'
import IncomeHistoryModal from '../components/IncomeHistoryModal.vue'

interface IncomeRecord {
  INCOME_ID: string
  BILL_DATE: string | Date
  INVOICE_NO?: string
  CUSTOMER_NAME: string
  PROJECT?: string
  PERSONNEL?: string
  LOCATION?: string
  QUOTE_AMOUNT: number
  ACTUAL_AMOUNT: number
  UNCOLLECTED_AMOUNT: number
  COLLECTION_METHOD?: string
  COLLECTION_STATUS: 'Y' | 'N'
  COST_AMOUNT?: number
  ESTIMATED_PROFIT?: number
  REMARK?: string
  MOTIFY_TIME?: Date | string
}

const incomes = ref<IncomeRecord[]>([])
const showFormModal = ref(false)
const showHistoryModal = ref(false)
const selectedIncome = ref<any>(null)
const selectedIncomeId = ref('')
const totalRecords = ref(0)
const limit = ref(20)
const offset = ref(0)

const filters = ref({
  customerName: '',
  billDateStart: '',
  billDateEnd: '',
  collectionStatus: '',
})

const formatDate = (date: any) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-TW')
}

const formatCurrency = (value: any) => {
  if (!value) return '-'
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(value)
}

const loadIncomes = async () => {
  try {
    const params = new URLSearchParams()
    params.append('limit', limit.value.toString())
    params.append('offset', offset.value.toString())

    if (filters.value.customerName) {
      params.append('customerName', filters.value.customerName)
    }
    if (filters.value.billDateStart) {
      params.append('billDateStart', filters.value.billDateStart)
    }
    if (filters.value.billDateEnd) {
      params.append('billDateEnd', filters.value.billDateEnd)
    }
    if (filters.value.collectionStatus) {
      params.append('collectionStatus', filters.value.collectionStatus)
    }

    const response = await fetch(`/api/income?${params}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', response.status, errorText)
      alert(`載入失敗: ${response.status}`)
      return
    }
    
    const result = await response.json()

    if (result.success) {
      incomes.value = result.data || []
      totalRecords.value = result.pagination?.total || 0
    } else {
      console.error('API returned error:', result.error)
      alert(`載入失敗: ${result.error || '未知錯誤'}`)
    }
  } catch (error) {
    console.error('Failed to load incomes:', error)
    alert(`載入數據失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
  }
}

const openNewModal = () => {
  selectedIncome.value = null
  showFormModal.value = true
}

const editIncome = (income: IncomeRecord) => {
  // 轉換日期為字符串格式供表單使用
  const formattedIncome: any = {
    ...income,
    BILL_DATE: typeof income.BILL_DATE === 'string' 
      ? income.BILL_DATE.split('T')[0]
      : new Date(income.BILL_DATE).toISOString().split('T')[0]
  }
  selectedIncome.value = formattedIncome
  showFormModal.value = true
}

const viewHistory = (incomeId: string) => {
  selectedIncomeId.value = incomeId
  showHistoryModal.value = true
}

const deleteIncome = async (incomeId: string) => {
  if (!confirm('確定要刪除此記帳嗎？')) return

  try {
    const response = await fetch(`/api/income?incomeId=${incomeId}`, {
      method: 'DELETE',
    })
    const result = await response.json()

    if (result.success) {
      alert('刪除成功')
      loadIncomes()
    }
  } catch (error) {
    console.error('Failed to delete income:', error)
    alert('刪除失敗')
  }
}

const saveIncome = async () => {
  loadIncomes()
  showFormModal.value = false
}

const previousPage = () => {
  offset.value = Math.max(0, offset.value - limit.value)
  loadIncomes()
}

const nextPage = () => {
  offset.value += limit.value
  loadIncomes()
}

onMounted(() => {
  loadIncomes()
})
</script>

<style scoped>
.income-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.filters-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  flex-wrap: wrap;
}

.input-field {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
  min-width: 150px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #0050b3;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-secondary:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
}

.income-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.income-table thead {
  background-color: #fafafa;
  border-bottom: 2px solid #e0e0e0;
}

.income-table th,
.income-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
}

.income-table th {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.income-table tbody tr:hover {
  background-color: #f9f9f9;
}

.text-center {
  text-align: center;
  color: #999;
}

.text-right {
  text-align: right;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.collected {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-badge.uncollected {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.action-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-action {
  padding: 4px 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-action.edit {
  background-color: #1890ff;
  color: white;
}

.btn-action.edit:hover {
  background-color: #0050b3;
}

.btn-action.view-history {
  background-color: #13c2c2;
  color: white;
}

.btn-action.view-history:hover {
  background-color: #087e8b;
}

.btn-action.delete {
  background-color: #ff4d4f;
  color: white;
}

.btn-action.delete:hover {
  background-color: #ff7875;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 15px;
}

.page-info {
  font-size: 14px;
  color: #666;
}
</style>
