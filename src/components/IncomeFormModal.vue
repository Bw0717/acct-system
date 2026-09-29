<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <header class="modal-header">
        <h2>{{ isEdit ? '編輯收入記帳' : '新增收入記帳' }}</h2>
        <button class="btn-close" @click="close">×</button>
      </header>

      <form @submit.prevent="submitForm" class="form">
        <!-- 第一排：日期、憑據、客戶名稱 -->
        <div class="form-row">
          <div class="form-group">
            <label for="billDate">日期 *</label>
            <input
              id="billDate"
              v-model="formData.BILL_DATE"
              type="date"
              required
              class="input-field"
            />
          </div>
          <div class="form-group">
            <label for="invoiceNo">憑據</label>
            <input
              id="invoiceNo"
              v-model="formData.INVOICE_NO"
              type="text"
              class="input-field"
              placeholder="發票/收據號碼"
            />
          </div>
          <div class="form-group">
            <label for="customerName">客戶名稱 *</label>
            <input
              id="customerName"
              v-model="formData.CUSTOMER_NAME"
              type="text"
              required
              class="input-field"
            />
          </div>
        </div>

        <!-- 第二排：工項、施作人員、地點 -->
        <div class="form-row">
          <div class="form-group">
            <label for="project">工項</label>
            <input
              id="project"
              v-model="formData.PROJECT"
              type="text"
              class="input-field"
            />
          </div>
          <div class="form-group">
            <label for="personnel">施作人員</label>
            <input
              id="personnel"
              v-model="formData.PERSONNEL"
              type="text"
              class="input-field"
            />
          </div>
          <div class="form-group">
            <label for="location">地點</label>
            <input
              id="location"
              v-model="formData.LOCATION"
              type="text"
              class="input-field"
            />
          </div>
        </div>

        <!-- 第三排：金額 -->
        <div class="form-row">
          <div class="form-group">
            <label for="quoteAmount">報價金額 *</label>
            <input
              id="quoteAmount"
              v-model.number="formData.QUOTE_AMOUNT"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-field"
            />
          </div>
          <div class="form-group">
            <label for="actualAmount">實做金額 *</label>
            <input
              id="actualAmount"
              v-model.number="formData.ACTUAL_AMOUNT"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-field"
            />
          </div>
          <div class="form-group">
            <label for="uncollectedAmount">未收金額 *</label>
            <input
              id="uncollectedAmount"
              v-model.number="formData.UNCOLLECTED_AMOUNT"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-field"
            />
          </div>
        </div>

        <!-- 第四排：成本、毛利 -->
        <div class="form-row">
          <div class="form-group">
            <label for="costAmount">成本金額</label>
            <input
              id="costAmount"
              v-model.number="formData.COST_AMOUNT"
              type="number"
              step="0.01"
              min="0"
              class="input-field"
            />
          </div>
          <div class="form-group">
            <label for="estimatedProfit">預估毛利</label>
            <input
              id="estimatedProfit"
              v-model.number="formData.ESTIMATED_PROFIT"
              type="number"
              step="0.01"
              class="input-field"
            />
          </div>
          <div class="form-group">
            <label for="collectionStatus">收款狀態 *</label>
            <select
              id="collectionStatus"
              v-model="formData.COLLECTION_STATUS"
              required
              class="input-field"
            >
              <option value="Y">已收款</option>
              <option value="N">未收款</option>
            </select>
          </div>
        </div>

        <!-- 第五排：收款方式、備註 -->
        <div class="form-row">
          <div class="form-group">
            <label for="collectionMethod">收款方式</label>
            <input
              id="collectionMethod"
              v-model="formData.COLLECTION_METHOD"
              type="text"
              class="input-field"
              placeholder="現金/支票/轉帳"
            />
          </div>
          <div class="form-group full-width">
            <label for="remark">備註</label>
            <textarea
              id="remark"
              v-model="formData.REMARK"
              class="input-field"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- 按鈕 -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="close">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface IncomeRecord {
  INCOME_ID?: string
  BILL_DATE: string
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
}

const props = defineProps<{
  income: IncomeRecord | null
}>()

const emit = defineEmits<{
  save: []
  close: []
}>()

const isSubmitting = ref(false)
const isEdit = computed(() => !!props.income?.INCOME_ID)

const formData = ref<IncomeRecord>({
  BILL_DATE: '',
  CUSTOMER_NAME: '',
  QUOTE_AMOUNT: 0,
  ACTUAL_AMOUNT: 0,
  UNCOLLECTED_AMOUNT: 0,
  COLLECTION_STATUS: 'N',
})

watch(
  () => props.income,
  (newIncome) => {
    if (newIncome) {
      formData.value = {
        ...newIncome,
        BILL_DATE: new Date(newIncome.BILL_DATE).toISOString().split('T')[0],
      }
    } else {
      formData.value = {
        BILL_DATE: new Date().toISOString().split('T')[0],
        CUSTOMER_NAME: '',
        QUOTE_AMOUNT: 0,
        ACTUAL_AMOUNT: 0,
        UNCOLLECTED_AMOUNT: 0,
        COLLECTION_STATUS: 'N',
      }
    }
  },
  { immediate: true }
)

const submitForm = async () => {
  try {
    isSubmitting.value = true

    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value ? `/api/income?incomeId=${props.income!.INCOME_ID}` : '/api/income'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    })

    const result = await response.json()

    if (result.success) {
      alert(isEdit.value ? '更新成功' : '新增成功')
      emit('save')
      close()
    } else {
      alert('操作失敗: ' + (result.error || '未知錯誤'))
    }
  } catch (error) {
    console.error('Submit error:', error)
    alert('提交失敗')
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  emit('close')
}
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

.form {
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.input-field {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

textarea.input-field {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0050b3;
}

.btn-primary:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
