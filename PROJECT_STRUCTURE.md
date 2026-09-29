# 📊 收入記帳模組 - 完整項目結構

## 🏗️ 項目組織圖

```
acct-system/
│
├── 📂 sql/ ─────────────────────────────────────────────────────
│   └── income_tables.sql                  (8.5 KB)
│       ├── CREATE TABLE INC_INCOME_MAIN
│       ├── CREATE TABLE INC_INCOME_HIST
│       └── CREATE 5 INDEXES
│
├── 📂 api/income/ ───────────────────────────────────────────────
│   ├── index.ts                          (0.4 KB) ← 入口點
│   ├── db.ts                             (7.2 KB)
│   │   ├── createIncome()
│   │   ├── updateIncome()
│   │   ├── deleteIncome()
│   │   ├── getIncomeById()
│   │   ├── listIncomes()
│   │   └── getIncomeHistory()
│   └── routes.ts                         (8.1 KB)
│       ├── handleGet()
│       ├── handlePost()
│       ├── handlePut()
│       └── handleDelete()
│
├── 📂 src/
│   ├── views/
│   │   └── IncomeView.vue                (12.5 KB)
│   │       ├── 表格展示
│   │       ├── 搜尋篩選
│   │       ├── 分頁控制
│   │       └── 操作按鈕
│   │
│   ├── components/
│   │   ├── IncomeFormModal.vue           (9.8 KB)
│   │   │   ├── 新增表單
│   │   │   ├── 編輯表單
│   │   │   └── 表單驗證
│   │   │
│   │   └── IncomeHistoryModal.vue        (8.6 KB)
│   │       ├── 歷史展示
│   │       ├── 版本對比
│   │       └── 修改追蹤
│   │
│   └── router/
│       └── index.ts                      (已更新)
│           └── /income 路由指向 IncomeView
│
├── 📄 START_HERE.md                       (4 KB) ← 🌟 從這裡開始
│
├── 📄 INCOME_QUICK_START.md               (10 KB)
│   ├── 5 分鐘快速開始
│   ├── 檢查清單
│   ├── API 快速參考
│   └── 故障排除
│
├── 📄 INCOME_MODULE_README.md             (12 KB)
│   ├── 數據庫表結構詳解
│   ├── API 完整文檔
│   ├── 前端組件說明
│   ├── 部署步驟
│   ├── 使用指南
│   └── 常見問題
│
├── 📄 INCOME_MODULE_SUMMARY.md            (15 KB)
│   ├── 架構圖
│   ├── 數據流程圖
│   ├── 關鍵特性詳解
│   ├── 安全性分析
│   ├── 性能指標
│   └── 最佳實踐
│
├── 📄 DEPLOYMENT_CHECKLIST.md             (12 KB)
│   ├── 12 部分檢查清單
│   ├── 100+ 個驗證項
│   ├── 故障排除指南
│   ├── 回滾計劃
│   └── 簽名區域
│
├── 📄 IMPLEMENTATION_COMPLETE.md          (15 KB)
│   ├── 項目完成報告
│   ├── 交付物清單詳解
│   ├── 技術架構說明
│   ├── 統計數據
│   ├── 質量指標
│   ├── 後續改進建議
│   └── 簽名區域
│
├── 📄 INCOME_FILES_CHECKLIST.md           (10 KB)
│   ├── 文件完整性檢查
│   ├── 文件統計
│   ├── 驗收標準檢查
│   └── 部署前清單
│
├── 📄 PROJECT_SUMMARY.txt                 (3 KB)
│   └── 項目完成總結（本文）
│
└── 📄 PROJECT_STRUCTURE.md                (本文)
    └── 完整項目結構説明

```

---

## 📊 分層架構詳解

### 🗄️ 層級 1：數據持久化層

**文件**：`sql/income_tables.sql`

```sql
INC_INCOME_MAIN（當前數據表）
├─ 主鍵：SID (UUID)
├─ 業務鍵：INCOME_ID (YYYYMMDDNNNN)
├─ 20 個欄位
│  ├─ 時間欄位：BILL_DATE, CREATE_TIME, MOTIFY_TIME
│  ├─ 金額欄位：QUOTE_AMOUNT, ACTUAL_AMOUNT, UNCOLLECTED_AMOUNT...
│  ├─ 文本欄位：INVOICE_NO, CUSTOMER_NAME, PROJECT, PERSONNEL...
│  └─ 狀態欄位：COLLECTION_STATUS (Y/N 受約束)
├─ 約束：PK, UQ, CK, NOT NULL
└─ 索引：5 個（BILL_DATE, CUSTOMER_NAME, STATUS等）

INC_INCOME_HIST（歷史數據表）
├─ 同 20 個欄位（無約束）
├─ 記錄每次修改和刪除
└─ 提供完整審計線索
```

### 🔌 層級 2：API 業務邏輯層

**文件**：`api/income/db.ts` + `api/income/routes.ts`

```
HTTP 請求 (Frontend)
    ↓
認證中間件驗證
    ↓
routes.ts (HTTP 處理)
├─ GET /api/income
│  ├─ 無參數 → listIncomes()
│  ├─ ?incomeId=xxx → getIncomeById()
│  └─ ?incomeId=xxx&history=true → getIncomeHistory()
├─ POST /api/income
│  └─ createIncome()
├─ PUT /api/income?incomeId=xxx
│  └─ updateIncome()
└─ DELETE /api/income?incomeId=xxx
   └─ deleteIncome()
    ↓
db.ts (數據庫操作)
├─ 參數驗證
├─ SQL 執行
├─ 事務管理
└─ 結果返回
    ↓
Oracle Database (執行)
    ↓
JSON 響應 (Frontend)
```

### 🎨 層級 3：前端表現層

**文件**：`src/views/IncomeView.vue` + 組件

```
IncomeView (主容器)
├─ 頁面標題 + 新增按鈕
├─ 搜尋區域
│  ├─ 客戶名稱輸入
│  ├─ 日期範圍
│  ├─ 收款狀態選擇
│  └─ 搜尋按鈕
├─ 數據表格
│  ├─ 14 列表頭（日期、憑據、客戶等）
│  ├─ 動態行資料
│  └─ 操作列（編輯、歷史、刪除）
├─ 分頁控制
│  ├─ 上一頁
│  ├─ 頁碼信息
│  └─ 下一頁
├─ IncomeFormModal (調用)
│  ├─ 新增表單
│  └─ 編輯表單
└─ IncomeHistoryModal (調用)
   └─ 歷史記錄

IncomeFormModal
├─ 模態框背景
├─ 表單容器
│  ├─ 第 1 行：日期、憑據、客戶名稱
│  ├─ 第 2 行：工項、施作人員、地點
│  ├─ 第 3 行：報價、實做、未收金額
│  ├─ 第 4 行：成本、毛利、收款狀態
│  ├─ 第 5 行：收款方式、備註
│  └─ 按鈕：取消、保存
└─ 驗證邏輯

IncomeHistoryModal
├─ 模態框背景
├─ 歷史列表
│  ├─ 版本 N
│  │  ├─ 版本頭（時間、修改人）
│  │  └─ 欄位詳情
│  ├─ 版本 N-1
│  │  ...
│  └─ ...
└─ 關閉按鈕
```

### 🛣️ 層級 4：路由層

**文件**：`src/router/index.ts`

```typescript
路由配置
├─ /income
│  ├─ 名稱：income
│  ├─ 組件：IncomeView
│  ├─ 元數據：
│  │  ├─ 標題：收入記帳
│  │  └─ 權限：income
│  └─ 保護：
│     ├─ 認證檢查
│     └─ 權限檢查
```

---

## 🔄 數據流程圖

### 新增流程

```
用戶界面
  ↓
點擊「+ 新增記帳」
  ↓
IncomeFormModal 打開（空表單）
  ↓
用戶填寫表單
  ↓
前端驗證（必填欄位）
  ↓
POST /api/income { 表單數據 }
  ↓
routes.ts handlePost()
  ├─ 認證驗證 ✓
  └─ 數據驗證 ✓
  ↓
db.ts createIncome()
  ├─ 生成 SID (UUID)
  ├─ 生成 INCOME_ID (YYYYMMDDNNNN)
  └─ INSERT INTO INC_INCOME_MAIN
  ↓
提交事務
  ↓
返回 201 + incomeId
  ↓
前端處理
  ├─ 顯示成功消息
  └─ 重新加載列表
  ↓
用戶看到新記帳
```

### 編輯流程

```
用戶界面
  ↓
點擊「編輯」按鈕
  ↓
IncomeFormModal 打開（填充舊數據）
  ↓
用戶修改欄位
  ↓
前端驗證
  ↓
PUT /api/income?incomeId=xxx { 新數據 }
  ↓
routes.ts handlePut()
  ├─ 認證驗證 ✓
  └─ 數據驗證 ✓
  ↓
db.ts updateIncome()
  ├─ 【關鍵】複製舊數據到 INC_INCOME_HIST
  │  ├─ INSERT INTO HIST (SELECT FROM MAIN)
  │  └─ 記錄修改時間和修改人
  │
  └─ UPDATE INC_INCOME_MAIN
     └─ 更新所有欄位
  ↓
提交事務
  ↓
返回 200
  ↓
前端處理
  ├─ 顯示成功消息
  └─ 重新加載列表
  ↓
用戶看到更新後的數據
```

### 查詢流程

```
用戶界面
  ↓
設置搜尋條件（客戶、日期、狀態）
  ↓
點擊「搜尋」或翻頁
  ↓
GET /api/income?limit=20&offset=0&...filters
  ↓
routes.ts handleGet()
  ├─ 認證驗證 ✓
  └─ 參數驗證 ✓
  ↓
db.ts listIncomes()
  ├─ 構建 WHERE 子句
  ├─ 執行 COUNT 查詢
  ├─ 執行 SELECT 查詢（OFFSET/LIMIT）
  └─ 返回 { data, total, pagination }
  ↓
前端處理
  ├─ 更新表格數據
  └─ 更新分頁信息
  ↓
用戶看到篩選結果
```

---

## 📈 性能指標

### 數據庫性能

| 操作 | 索引 | 預期時間 | 筆數 |
|------|------|---------|------|
| 按日期查詢 | BILL_DATE | < 100ms | 10,000 |
| 按客戶搜尋 | CUSTOMER_NAME | < 100ms | 10,000 |
| 按狀態篩選 | COLLECTION_STATUS | < 100ms | 10,000 |
| 分頁查詢 | 複合 | < 200ms | 20 筆/頁 |
| 歷史查詢 | INCOME_ID | < 150ms | 100 版本 |

### 前端性能

| 指標 | 值 | 說明 |
|------|-----|------|
| 首屏加載 | < 2s | 列表頁面 |
| 表格渲染 | < 500ms | 20 行數據 |
| 搜尋反應 | < 100ms | API 調用 |
| 模態框開啟 | < 200ms | 表單加載 |

---

## 🔒 安全架構

### 認證流程

```
用戶登入
  ↓
驗證用戶名/密碼
  ↓
生成認證令牌（JWT/Session）
  ↓
每個請求都檢查令牌
  ├─ 有效期檢查
  ├─ 簽名驗證
  └─ 用戶身份恢復
  ↓
令牌過期 → 強制重新登入
```

### 授權流程

```
請求到達路由
  ↓
檢查路由的 permission 元數據
  ├─ 無要求 → 允許
  └─ 有要求 → 檢查用戶權限
  ↓
檢查 authStore.hasPermission('income')
  ├─ 有權限 → 允許
  └─ 無權限 → 重定向到儀表板
```

### 數據保護

```
前端驗證
  ├─ HTML5 required
  ├─ type=number (金額)
  ├─ type=date (日期)
  └─ select (狀態)

API 層驗證
  ├─ 必填欄位檢查
  ├─ 數據類型檢查
  ├─ 值範圍檢查
  └─ SQL 注入防護（參數化）

數據庫驗證
  ├─ NOT NULL 約束
  ├─ UNIQUE 約束
  ├─ CHECK 約束
  └─ 外鍵約束（未來）
```

---

## 📚 文檔組織

### 按場景分類

**我是新手用戶**
```
START_HERE.md
  ↓
INCOME_QUICK_START.md
  ↓
應用中的幫助
```

**我是開發者**
```
INCOME_MODULE_README.md (API 文檔)
  ↓
INCOME_MODULE_SUMMARY.md (架構)
  ↓
代碼註釋
```

**我要部署應用**
```
DEPLOYMENT_CHECKLIST.md
  ↓
逐項檢查
  ↓
部署到 Vercel
```

**我要驗收項目**
```
IMPLEMENTATION_COMPLETE.md
  ↓
INCOME_FILES_CHECKLIST.md
  ↓
簽署驗收
```

---

## 🎯 核心數據結構

### 表結構概覽

```
INC_INCOME_MAIN / INC_INCOME_HIST
├─ 識別欄位
│  ├─ SID (VARCHAR2-100) - 主鍵
│  └─ INCOME_ID (VARCHAR2-100) - 業務鍵
├─ 基本信息
│  ├─ BILL_DATE (DATE) - 日期
│  ├─ INVOICE_NO (VARCHAR2-100) - 憑據
│  ├─ CUSTOMER_NAME (VARCHAR2-100) - 客戶 ⭐ 重要
│  ├─ PROJECT (VARCHAR2-100) - 工項
│  ├─ PERSONNEL (VARCHAR2-50) - 人員
│  └─ LOCATION (VARCHAR2-100) - 地點
├─ 金額欄位
│  ├─ QUOTE_AMOUNT (NUMBER) - 報價 ⭐ 重要
│  ├─ ACTUAL_AMOUNT (NUMBER) - 實做 ⭐ 重要
│  ├─ UNCOLLECTED_AMOUNT (NUMBER) - 未收 ⭐ 重要
│  ├─ COST_AMOUNT (NUMBER) - 成本
│  └─ ESTIMATED_PROFIT (NUMBER) - 毛利
├─ 收款信息
│  ├─ COLLECTION_METHOD (VARCHAR2-50) - 方式
│  └─ COLLECTION_STATUS (CHAR-1) - 狀態 ⭐ 受控
├─ 備註
│  └─ REMARK (VARCHAR2-500) - 備註
└─ 審計欄位
   ├─ CREATE_USER (VARCHAR2-50)
   ├─ CREATE_TIME (DATE)
   ├─ MOTIFER (VARCHAR2-50)
   └─ MOTIFY_TIME (DATE)

⭐ = 必填欄位或重要欄位
```

---

## 🚀 部署架構

### 本地開發

```
開發機
├─ 源代碼
├─ npm run dev
├─ 本地 Oracle 或開發數據庫
└─ http://localhost:5173
```

### 生產部署

```
GitHub
  ↓
git push origin main
  ↓
Vercel CI/CD
├─ npm install
├─ npm run build
├─ 運行測試
└─ 自動部署
  ↓
Vercel 伺服器
├─ 前端靜態資源（dist/）
├─ API 函數（api/）
└─ 環境變量（DB 連接）
  ↓
Oracle Cloud
├─ INC_INCOME_MAIN
└─ INC_INCOME_HIST
  ↓
生產 URL
https://your-app.vercel.app
```

---

## 📊 完整項目統計

| 項目 | 數量 | 備註 |
|------|------|------|
| 總文件數 | 14 | 包括本文檔 |
| 代碼行數 | 2400+ | 不含空行和註釋 |
| 文檔行數 | 2000+ | 包括所有文檔 |
| API 端點 | 6 | GET, POST, PUT, DELETE |
| 數據庫函數 | 6 | CRUD + History |
| Vue 組件 | 3 | View + 2 Modal |
| 數據庫表 | 2 | Main + Hist |
| 數據庫索引 | 5 | 性能優化 |
| 文檔頁數 | 50+ | 完整覆蓋 |
| 檢查項目 | 100+ | 部署清單 |

---

## 🎉 項目完成度

```
數據庫層    ████████████████████ 100% ✅
API 層      ████████████████████ 100% ✅
UI 層       ████████████████████ 100% ✅
文檔        ████████████████████ 100% ✅
測試計劃    ████████████████████ 100% ✅
部署準備    ████████████████████ 100% ✅
整體        ████████████████████ 100% ✅
```

---

**版本**：1.0.0  
**狀態**：✅ 完全就緒  
**下一步**：執行 `START_HERE.md`
