<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <header class="modal-header">
        <h2>📜 修改歷史紀錄</h2>
        <button class="btn-close" @click="close">×</button>
      </header>

      <div class="history-container" v-if="isLoading">
        <div class="loading">加載中...</div>
      </div>

      <div class="history-container" v-else-if="historyRecords.length === 0">
        <div class="empty">暫無歷史紀錄</div>
      </div>

      <div class="history-container" v-else>
        <div v-for="(record, index) in historyRecords" :key="index" class="history-item">
          <div class="history-header">
            <h3>版本 {{ historyRecords.length - index }}</h3>
            <span class="history-time">{{ formatDateTime(record.MOTIFY_TIME) }}</span>
            <span class="history-user">修改人：{{ record.MOTIFER || '-' }}</span>
          </div>

          <div class="history-details">
            <div class="detail-row">
              <span class="detail-label">日期:</span>
              <span class="detail-value">{{ formatDate(record.BILL_DATE) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">憑據:</span>
              <span class="detail-value">{{ record.INVOICE_NO || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">客戶名稱:</span>
              <span class="detail-value">{{ record.CUSTOMER_NAME }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">工項:</span>
              <span class="detail-value">{{ record.PROJECT || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">施作人員:</span>
              <span class="detail-value">{{ record.PERSONNEL || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">地點:</span>
              <span class="detail-value">{{ record.LOCATION || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">報價金額:</span>
              <span class="detail-value">{{ formatCurrency(record.QUOTE_AMOUNT) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">實做金額:</span>
              <span class="detail-value">{{ formatCurrency(record.ACTUAL_AMOUNT) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">未收金額:</span>
              <span class="detail-value">{{ formatCurrency(record.UNCOLLECTED_AMOUNT) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">收款方式:</span>
              <span class="detail-value">{{ record.COLLECTION_METHOD || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">收款狀態:</span>
              <span
                :class="['detail-value', 'status', record.COLLECTION_STATUS === 'Y' ? 'collected' : 'uncollected']"
              >
                {{ record.COLLECTION_STATUS === 'Y' ? '已收款' : '未收款' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">成本金額:</span>
              <span class="detail-value">{{ formatCurrency(record.COST_AMOUNT) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">預估毛利:</span>
              <span class="detail-value">{{ formatCurrency(record.ESTIMATED_PROFIT) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">備註:</span>
              <span class="detail-value">{{ record.REMARK || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="btn btn-primary" @click="close">關閉</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface IncomeRecord {
  INCOME_ID: string
  BILL_DATE?: Date | string
  INVOICE_NO?: string
  CUSTOMER_NAME?: string
  PROJECT?: string
  PERSONNEL?: string
  LOCATION?: string
  QUOTE_AMOUNT?: number
  ACTUAL_AMOUNT?: number
  UNCOLLECTED_AMOUNT?: number
  COLLECTION_METHOD?: string
  COLLECTION_STATUS?: 'Y' | 'N'
  COST_AMOUNT?: number
  ESTIMATED_PROFIT?: number
  REMARK?: string
  MOTIFER?: string
  MOTIFY_TIME?: Date | string
}

const props = defineProps<{
  incomeId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const historyRecords = ref<IncomeRecord[]>([])
const isLoading = ref(true)

const formatDate = (date: any) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-TW')
}

const formatDateTime = (date: any) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-TW')
}

const formatCurrency = (value: any) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(value)
}

const loadHistory = async () => {
  try {
    isLoading.value = true
    const response = await fetch(`/api/income?incomeId=${props.incomeId}&history=true`)
    const result = await response.json()

    if (result.success) {
      historyRecords.value = result.data
    }
  } catch (error) {
    console.error('Failed to load history:', error)
    alert('載入歷史紀錄失敗')
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  emit('close')
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background-color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  padding: 0;
}

.btn-close:hover {
  color: #333;
}

.history-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.loading,
.empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.history-item {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.history-header {
  background-color: #f5f5f5;
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.history-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.history-time {
  font-size: 12px;
  color: #999;
}

.history-user {
  font-size: 12px;
  color: #666;
}

.history-details {
  padding: 15px;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  align-items: flex-start;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  color: #333;
  word-break: break-word;
}

.detail-value.status {
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  width: fit-content;
}

.detail-value.status.collected {
  background-color: #f6ffed;
  color: #52c41a;
}

.detail-value.status.uncollected {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  background-color: #fafafa;
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

@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
