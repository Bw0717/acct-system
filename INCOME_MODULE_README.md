# 📊 收入記帳模組完整實現指南

## 📋 目錄
1. [數據庫表結構](#數據庫表結構)
2. [API 文檔](#api-文檔)
3. [前端組件](#前端組件)
4. [部署步驟](#部署步驟)
5. [使用指南](#使用指南)

---

## 📊 數據庫表結構

### 表定義位置
```
sql/income_tables.sql
```

### 核心表

#### 1. INC_INCOME_MAIN（當前收入記帳主表）

存儲所有當前的收入記帳記錄。

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| SID | VARCHAR2(100) | ✓ | 系統唯一識別碼（主鍵） |
| INCOME_ID | VARCHAR2(100) | ✓ | 收入記帳編號（唯一值，格式：YYYYMMDDNNNN） |
| BILL_DATE | DATE | ✓ | 日期 |
| INVOICE_NO | VARCHAR2(100) | ✗ | 憑據（發票/收據號碼） |
| CUSTOMER_NAME | VARCHAR2(100) | ✓ | 客戶名稱 |
| PROJECT | VARCHAR2(100) | ✗ | 工項 |
| PERSONNEL | VARCHAR2(50) | ✗ | 施作人員 |
| LOCATION | VARCHAR2(100) | ✗ | 地點 |
| QUOTE_AMOUNT | NUMBER | ✓ | 報價金額 |
| ACTUAL_AMOUNT | NUMBER | ✓ | 實做金額 |
| UNCOLLECTED_AMOUNT | NUMBER | ✓ | 未收金額 |
| COLLECTION_METHOD | VARCHAR2(50) | ✗ | 收款方式（現金/支票/轉帳等） |
| COLLECTION_STATUS | CHAR(1) | ✓ | 收款狀態（Y/N） |
| COST_AMOUNT | NUMBER | ✗ | 成本金額 |
| ESTIMATED_PROFIT | NUMBER | ✗ | 預估毛利 |
| REMARK | VARCHAR2(500) | ✗ | 備註 |
| CREATE_USER | VARCHAR2(50) | ✗ | 建立使用者 |
| CREATE_TIME | DATE | ✗ | 建立時間 |
| MOTIFER | VARCHAR2(50) | ✗ | 最後修改者 |
| MOTIFY_TIME | DATE | ✗ | 最後修改時間 |

#### 2. INC_INCOME_HIST（收入記帳歷史表）

自動記錄所有修改和刪除的歷史版本。

- 欄位結構同 INC_INCOME_MAIN（除了約束）
- 每次修改時自動複製舊資料到此表

---

## 🌐 API 文檔

### API 端點
```
/api/income
```

### 1. 新增收入記帳 (POST)

**請求**
```bash
POST /api/income
Content-Type: application/json

{
  "BILL_DATE": "2024-01-15",
  "INVOICE_NO": "INV-2024-001",
  "CUSTOMER_NAME": "ABC 公司",
  "PROJECT": "網站開發",
  "PERSONNEL": "張三",
  "LOCATION": "台北市",
  "QUOTE_AMOUNT": 50000,
  "ACTUAL_AMOUNT": 50000,
  "UNCOLLECTED_AMOUNT": 0,
  "COLLECTION_METHOD": "支票",
  "COLLECTION_STATUS": "Y",
  "COST_AMOUNT": 20000,
  "ESTIMATED_PROFIT": 30000,
  "REMARK": "專案A"
}
```

**成功回應 (201)**
```json
{
  "success": true,
  "message": "Income record created successfully",
  "incomeId": "20240115001"
}
```

### 2. 更新收入記帳 (PUT)

**請求**
```bash
PUT /api/income?incomeId=20240115001
Content-Type: application/json

{
  "BILL_DATE": "2024-01-15",
  "CUSTOMER_NAME": "ABC 公司",
  "QUOTE_AMOUNT": 55000,
  ...
}
```

**成功回應 (200)**
```json
{
  "success": true,
  "message": "Income record updated successfully",
  "incomeId": "20240115001"
}
```

> ⚠️ **重要**: 更新時會自動將舊資料複製到 INC_INCOME_HIST 表

### 3. 查詢單筆記錄 (GET)

**請求**
```bash
GET /api/income?incomeId=20240115001
```

**成功回應 (200)**
```json
{
  "success": true,
  "data": {
    "SID": "uuid-123",
    "INCOME_ID": "20240115001",
    "BILL_DATE": "2024-01-15T00:00:00.000Z",
    "CUSTOMER_NAME": "ABC 公司",
    ...
  }
}
```

### 4. 查詢列表（分頁）(GET)

**請求**
```bash
GET /api/income?limit=20&offset=0&customerName=ABC&billDateStart=2024-01-01&billDateEnd=2024-01-31&collectionStatus=Y
```

**查詢參數**
| 參數 | 說明 | 範例 |
|------|------|------|
| limit | 每頁筆數（預設20） | 20 |
| offset | 偏移量（預設0） | 0 |
| customerName | 客戶名稱（模糊搜尋） | ABC |
| billDateStart | 開始日期 | 2024-01-01 |
| billDateEnd | 結束日期 | 2024-01-31 |
| collectionStatus | 收款狀態 | Y 或 N |

**成功回應 (200)**
```json
{
  "success": true,
  "data": [
    {
      "INCOME_ID": "20240115001",
      "CUSTOMER_NAME": "ABC 公司",
      ...
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### 5. 查詢歷史紀錄 (GET)

**請求**
```bash
GET /api/income?incomeId=20240115001&history=true
```

**成功回應 (200)**
```json
{
  "success": true,
  "data": [
    {
      "SID": "history-uuid-1",
      "INCOME_ID": "20240115001",
      "BILL_DATE": "2024-01-15T00:00:00.000Z",
      "CUSTOMER_NAME": "ABC 公司",
      "MOTIFY_TIME": "2024-01-16T10:30:00.000Z",
      "MOTIFER": "user123"
    }
  ]
}
```

### 6. 刪除記錄 (DELETE)

**請求**
```bash
DELETE /api/income?incomeId=20240115001
```

**成功回應 (200)**
```json
{
  "success": true,
  "message": "Income record deleted successfully"
}
```

> ⚠️ **重要**: 刪除時會自動將被刪除的記錄複製到 INC_INCOME_HIST 表

---

## 🎨 前端組件

### 路由位置
```
src/router/index.ts
```

新增路由：
```typescript
{
  path: '/income',
  name: 'income',
  component: IncomeView,
  meta: { title: '收入記帳', permission: 'income' },
}
```

### 視圖組件

#### 1. IncomeView.vue
**位置**: `src/views/IncomeView.vue`

**功能**:
- 📊 展示收入記帳列表（表格）
- 🔍 多條件搜尋（客戶名稱、日期範圍、收款狀態）
- 📄 分頁顯示
- ➕ 新增記帳
- ✏️ 編輯記帳
- 📜 查看修改歷史
- 🗑️ 刪除記帳

**主要特性**:
- 貨幣格式化（台幣）
- 日期格式化（繁體中文）
- 收款狀態視覺化（已收/未收）
- 響應式設計

#### 2. IncomeFormModal.vue
**位置**: `src/components/IncomeFormModal.vue`

**功能**:
- ➕ 新增記帳表單
- ✏️ 編輯記帳表單
- 📝 表單驗證
- 💾 自動計算未收金額

**表單欄位**:
- 日期 (必填)
- 憑據
- 客戶名稱 (必填)
- 工項
- 施作人員
- 地點
- 報價金額 (必填)
- 實做金額 (必填)
- 未收金額 (必填)
- 成本金額
- 預估毛利
- 收款狀態 (必填)
- 收款方式
- 備註

#### 3. IncomeHistoryModal.vue
**位置**: `src/components/IncomeHistoryModal.vue`

**功能**:
- 📜 展示修改歷史
- ⏰ 顯示修改時間
- 👤 顯示修改人員
- 📊 版本比對

**顯示資訊**:
- 修改時間
- 修改人員
- 所有欄位的歷史值
- 版本號（倒序）

---

## 🚀 部署步驟

### 第一步：執行 SQL 語句

1. 登入 Oracle Cloud SQL Developer
2. 打開 `sql/income_tables.sql`
3. 執行所有 SQL 語句

確認輸出：
```
Table INC_INCOME_MAIN created successfully.
Table INC_INCOME_HIST created successfully.
Indexes created successfully.
```

### 第二步：檢查後端文件

確保以下文件已存在：
- ✅ `api/income/db.ts` - 數據庫操作層
- ✅ `api/income/routes.ts` - API 路由

### 第三步：檢查前端文件

確保以下文件已存在：
- ✅ `src/views/IncomeView.vue` - 列表視圖
- ✅ `src/components/IncomeFormModal.vue` - 表單組件
- ✅ `src/components/IncomeHistoryModal.vue` - 歷史組件
- ✅ `src/router/index.ts` - 已更新路由

### 第四步：構建和部署

```bash
# 安裝依賴
npm install

# 開發環境測試
npm run dev

# 生產環境構建
npm run build

# 部署到 Vercel
vercel deploy
```

---

## 📖 使用指南

### 新增記帳

1. 點擊頁面右上角「+ 新增記帳」按鈕
2. 填寫必填欄位：
   - 日期
   - 客戶名稱
   - 報價金額
   - 實做金額
   - 未收金額
   - 收款狀態
3. 填寫其他欄位（選填）
4. 點擊「保存」

### 搜尋和篩選

1. 在頂部搜尋區域輸入條件
2. 支援搜尋：
   - 客戶名稱（模糊搜尋）
   - 日期範圍（開始日期到結束日期）
   - 收款狀態（已收款 / 未收款）
3. 點擊「搜尋」按鈕

### 編輯記帳

1. 在列表中找到要編輯的記帳
2. 點擊「編輯」按鈕
3. 修改相應欄位
4. 點擊「保存」
5. ✅ 舊資料自動保存到歷史表

### 查看歷史

1. 在列表中找到要查看的記帳
2. 點擊「歷史」按鈕
3. 查看所有修改版本
4. 版本按修改時間倒序顯示

### 刪除記帳

1. 在列表中找到要刪除的記帳
2. 點擊「刪除」按鈕
3. 確認刪除
4. ✅ 被刪除的記錄自動保存到歷史表

---

## 💻 開發注意事項

### 環境變量配置

確保 `.env.local` 包含：
```env
VITE_APP_API_BASE_URL=http://localhost:3000
DB_USER=your_oracle_user
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=your_oracle_connection_string
```

### 數據類型

#### 金額類型
- 使用 `NUMBER` 類型，精度為小數點後兩位
- 前端自動格式化為台幣貨幣格式

#### 日期類型
- 使用 `DATE` 類型
- 前端自動格式化為繁體中文日期格式

#### 狀態欄位
- 收款狀態使用 `CHAR(1)` 類型，值為 Y 或 N
- 資料庫有 CHECK 約束驗證

### 分頁邏輯

- 預設每頁 20 筆
- 可透過查詢參數自定義：`limit` 和 `offset`
- 總筆數從 API 回應的 `pagination.total` 取得

### 歷史記錄策略

每次修改或刪除都會：
1. 複製當前記錄到 `INC_INCOME_HIST` 表
2. 生成新的 `SID` (UUID)
3. 記錄修改時間和修改人員
4. 保留所有欄位的值

---

## 🐛 常見問題

### Q: 為什麼修改後看不到新數據？
A: 請檢查：
1. 是否成功調用了更新 API
2. API 回應是否顯示 `success: true`
3. 嘗試刷新頁面

### Q: 如何恢復已刪除的記帳？
A: 
1. 查看歷史記錄 - 找到刪除前的版本
2. 手動複製被刪除的記錄
3. 將資料重新新增到系統

### Q: 為什麼搜尋沒有結果？
A: 
1. 檢查搜尋條件是否正確
2. 確認日期範圍是否包含要搜尋的數據
3. 嘗試清除所有篩選條件重新搜尋

### Q: 金額顯示不正確？
A: 
1. 確保資料庫中的金額欄位是 NUMBER 類型
2. 檢查前端格式化函數
3. 驗證數據庫的值是否為數字

---

## 📞 技術支持

遇到問題請檢查：
1. 📋 確認表結構正確（運行 DESCRIBE INC_INCOME_MAIN）
2. 🔌 確認數據庫連接正常
3. 🔐 確認 API 認證通過
4. 🌐 檢查前端網絡請求（瀏覽器開發者工具）
5. 📝 查看後端日誌輸出

---

**模組創建日期**: 2024-01-16  
**版本**: 1.0.0  
**最後更新**: 2024-01-16
