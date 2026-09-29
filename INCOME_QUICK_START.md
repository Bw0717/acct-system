# 🚀 收入記帳模組 - 快速開始指南

## ⚡ 5 分鐘快速上手

### 📋 檢查清單

在開始前，請確認以下文件已創建：

```
✅ sql/income_tables.sql                          # 數據庫表結構
✅ api/income/db.ts                               # 數據庫操作層
✅ api/income/routes.ts                           # API 路由
✅ api/income/index.ts                            # API 入口
✅ src/views/IncomeView.vue                       # 列表視圖
✅ src/components/IncomeFormModal.vue             # 表單組件
✅ src/components/IncomeHistoryModal.vue          # 歷史組件
✅ src/router/index.ts                            # 路由已更新
```

---

## 📊 第一步：創建數據庫表

### 方法 A：使用 Oracle Cloud SQL Developer

1. 打開 Oracle Cloud SQL Developer Web
2. 複製 `sql/income_tables.sql` 的全部內容
3. 粘貼到 SQL 編輯器
4. 點擊「運行」(Ctrl+Enter)
5. 確認輸出無錯誤

### 方法 B：使用 SQL*Plus

```bash
sqlplus admin/password@your_connection

SQL> @sql/income_tables.sql
```

### 驗證表已創建

```sql
DESC "ADMIN"."INC_INCOME_MAIN";
DESC "ADMIN"."INC_INCOME_HIST";
```

輸出應顯示所有 20 個欄位。

---

## 🔧 第二步：驗證後端 API

### 檢查環境變量

編輯 `.env.local`：

```env
DB_USER=your_oracle_user
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=your_oracle_connection_string
```

### 測試 API 連接

```bash
# 啟動開發伺服器
npm run dev

# 在另一個終端測試（需先登入）
curl -X GET http://localhost:3000/api/income \
  -H "Authorization: Bearer YOUR_TOKEN"
```

預期回應：
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "limit": 20,
    "offset": 0
  }
}
```

---

## 🎨 第三步：測試前端

### 打開瀏覽器

1. 啟動開發伺服器：`npm run dev`
2. 打開 `http://localhost:5173`
3. 登入系統（使用測試帳號）
4. 導航到「收入記帳」

### 測試功能

#### ✅ 新增記帳
1. 點擊「+ 新增記帳」
2. 填寫表單
3. 點擊「保存」
4. 確認列表中出現新記錄

#### ✅ 編輯記帳
1. 在列表中點擊「編輯」
2. 修改任意欄位
3. 點擊「保存」
4. 確認數據已更新

#### ✅ 查看歷史
1. 點擊「歷史」
2. 確認顯示修改紀錄
3. 確認時間戳和修改人員

#### ✅ 刪除記帳
1. 點擊「刪除」
2. 確認刪除
3. 確認記錄從列表消失

---

## 📊 API 快速參考

### 新增
```bash
curl -X POST http://localhost:3000/api/income \
  -H "Content-Type: application/json" \
  -d '{
    "BILL_DATE": "2024-01-15",
    "CUSTOMER_NAME": "ABC 公司",
    "QUOTE_AMOUNT": 50000,
    "ACTUAL_AMOUNT": 50000,
    "UNCOLLECTED_AMOUNT": 0,
    "COLLECTION_STATUS": "Y"
  }'
```

### 查詢
```bash
curl -X GET 'http://localhost:3000/api/income?limit=20&offset=0'
```

### 編輯
```bash
curl -X PUT 'http://localhost:3000/api/income?incomeId=20240115001' \
  -H "Content-Type: application/json" \
  -d '{
    "BILL_DATE": "2024-01-15",
    "CUSTOMER_NAME": "XYZ 公司",
    "QUOTE_AMOUNT": 55000,
    ...
  }'
```

### 刪除
```bash
curl -X DELETE 'http://localhost:3000/api/income?incomeId=20240115001'
```

### 歷史
```bash
curl -X GET 'http://localhost:3000/api/income?incomeId=20240115001&history=true'
```

---

## 🎯 關鍵功能說明

### 📝 自動編號
- 格式：`YYYYMMDDNNNN`
- 示例：`20240115001`、`20240115002`
- 每日自動重置

### 💾 歷史追蹤
- 每次修改都記錄舊版本
- 每次刪除都保存記錄
- 可查看完整修改時間線

### 🔒 權限控制
- 需要 `income` 權限才能訪問
- 路由設置：`meta: { permission: 'income' }`

### 💯 驗證規則

**必填欄位**：
- `BILL_DATE` - 日期
- `CUSTOMER_NAME` - 客戶名稱
- `QUOTE_AMOUNT` - 報價金額
- `ACTUAL_AMOUNT` - 實做金額
- `UNCOLLECTED_AMOUNT` - 未收金額
- `COLLECTION_STATUS` - 收款狀態 (Y/N)

**選填欄位**：
- 所有其他欄位

---

## 🔍 排除故障

### 問題：表已存在
**解決**：刪除舊表後重新創建
```sql
DROP TABLE "ADMIN"."INC_INCOME_HIST";
DROP TABLE "ADMIN"."INC_INCOME_MAIN";
-- 然後運行 income_tables.sql
```

### 問題：API 返回 401 Unauthorized
**解決**：
1. 確認已登入
2. 檢查認證令牌有效期
3. 重新登入

### 問題：前端無法加載組件
**解決**：
1. 確認組件路徑正確
2. 重新安裝依賴：`npm install`
3. 重新啟動開發伺服器：`npm run dev`

### 問題：API 返回 500 錯誤
**解決**：
1. 檢查數據庫連接配置
2. 查看伺服器日誌
3. 驗證表結構是否正確

### 問題：日期格式不正確
**解決**：
1. 確保發送的日期格式為 `YYYY-MM-DD`
2. 檢查瀏覽器日期設置
3. 驗證資料庫時區設置

---

## 📦 生產環境部署

### 構建

```bash
npm run build
```

### 部署到 Vercel

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel deploy --prod

# 或使用 Git 自動部署
git push  # 自動觸發 CI/CD
```

### 設置環境變量

在 Vercel Dashboard：
1. 進入 Settings → Environment Variables
2. 添加：
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_CONNECTION_STRING`

### 驗證部署

```bash
curl https://your-app.vercel.app/api/income
```

---

## 📚 進階配置

### 修改分頁大小

編輯 `src/views/IncomeView.vue`：
```javascript
const limit = ref(50)  // 改為 50 筆
```

### 修改日期格式

編輯 `src/views/IncomeView.vue`：
```javascript
const formatDate = (date: any) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-US')  // 改為英文格式
}
```

### 添加新欄位

1. 修改數據庫表：
   ```sql
   ALTER TABLE "ADMIN"."INC_INCOME_MAIN" 
   ADD "NEW_FIELD" VARCHAR2(100);
   ```

2. 修改 API types：
   ```typescript
   interface IncomeRecord {
     NEW_FIELD?: string
   }
   ```

3. 修改前端表單組件

---

## 📞 支持信息

**完整文檔**：查看 `INCOME_MODULE_README.md`

**技術棧**：
- 前端：Vue 3 + TypeScript + Vite
- 後端：Node.js + Vercel + Oracle DB
- 數據庫：Oracle Cloud

**作者**：AI 開發助手  
**版本**：1.0.0  
**最後更新**：2024-01-16

---

## ✨ 下一步

完成上述步驟後，你可以：

1. ✅ 自定義表單欄位
2. ✅ 添加數據報表
3. ✅ 集成付款提醒
4. ✅ 導出 Excel 報告
5. ✅ 添加批量操作

開始吧！🚀
