# ✅ 收入記帳模組 - 部署檢查清單

## 📋 部署前檢查

### 第一部分：文件完整性檢查

#### 數據庫層
- [ ] `sql/income_tables.sql` 存在
- [ ] 文件包含 INC_INCOME_MAIN 表定義
- [ ] 文件包含 INC_INCOME_HIST 表定義
- [ ] 文件包含 5 個索引定義
- [ ] 文件大小 > 5KB

#### 後端 API 層
- [ ] `api/income/index.ts` 存在
- [ ] `api/income/db.ts` 存在
- [ ] `api/income/routes.ts` 存在
- [ ] db.ts 包含 6 個導出函數
- [ ] routes.ts 包含 4 個 HTTP 方法處理器

#### 前端層
- [ ] `src/views/IncomeView.vue` 存在
- [ ] `src/components/IncomeFormModal.vue` 存在
- [ ] `src/components/IncomeHistoryModal.vue` 存在
- [ ] `src/router/index.ts` 已更新收入路由
- [ ] `src/router/index.ts` 導入了 IncomeView

#### 文檔層
- [ ] `INCOME_MODULE_README.md` 存在
- [ ] `INCOME_QUICK_START.md` 存在
- [ ] `INCOME_MODULE_SUMMARY.md` 存在
- [ ] `DEPLOYMENT_CHECKLIST.md` 存在

---

### 第二部分：數據庫檢查

#### 執行 SQL 腳本

```bash
# 連接到 Oracle Cloud
sqlplus admin/password@your_connection

# 運行腳本
@sql/income_tables.sql
```

#### 驗證表創建

```sql
-- 檢查主表
DESC "ADMIN"."INC_INCOME_MAIN";
-- 應看到 20 個欄位

-- 檢查歷史表
DESC "ADMIN"."INC_INCOME_HIST";
-- 應看到 20 個欄位

-- 檢查索引
SELECT INDEX_NAME FROM USER_INDEXES 
WHERE TABLE_NAME IN ('INC_INCOME_MAIN', 'INC_INCOME_HIST');
-- 應看到 5 個索引

-- 檢查約束
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM USER_CONSTRAINTS 
WHERE TABLE_NAME = 'INC_INCOME_MAIN';
-- 應看到 PK, UQ, CK 約束
```

**驗證清單**：
- [ ] INC_INCOME_MAIN 表存在，20 個欄位
- [ ] INC_INCOME_HIST 表存在，20 個欄位
- [ ] 5 個索引創建成功
- [ ] 所有約束正確
- [ ] 無 ORA-00000 錯誤

---

### 第三部分：環境配置檢查

#### .env.local 配置

檢查以下變量是否已設置：

```env
# 數據庫配置
DB_USER=your_oracle_user
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=your_oracle_connection_string

# 應用配置
VITE_APP_API_BASE_URL=http://localhost:3000
```

**驗證清單**：
- [ ] DB_USER 設置
- [ ] DB_PASSWORD 設置
- [ ] DB_CONNECTION_STRING 設置
- [ ] 連接字符串格式正確
- [ ] 無敏感信息暴露

---

### 第四部分：依賴檢查

#### npm 依賴

```bash
# 檢查依賴
npm list oracledb
npm list vue
npm list @vercel/node

# 安裝缺失的依賴
npm install
```

**驗證清單**：
- [ ] oracledb ^7.0.1 已安裝
- [ ] vue ^3.5.42 已安裝
- [ ] @vercel/node ^13.0.0 已安裝
- [ ] 無高風險漏洞

---

### 第五部分：代碼檢查

#### TypeScript 編譯

```bash
# 編譯檢查
vue-tsc -b

# 應看到無錯誤
```

**驗證清單**：
- [ ] 無 TypeScript 編譯錯誤
- [ ] 無 ESLint 警告
- [ ] 所有類型定義正確

#### 代碼質量

```bash
# 檢查主要文件
grep -l "export default\|export const" api/income/*.ts
grep -l "<template>\|<script" src/views/IncomeView.vue
```

**驗證清單**：
- [ ] db.ts 有 6 個 export const 函數
- [ ] routes.ts 有 1 個 default export
- [ ] Vue 組件有 <template> 和 <script setup>
- [ ] 所有函數有完整的 JSDoc 註釋

---

### 第六部分：功能測試

#### 本地開發環境測試

```bash
# 啟動開發伺服器
npm run dev

# 在瀏覽器中測試
# 1. 登入系統
# 2. 導航到「收入記帳」
# 3. 點擊「+ 新增記帳」
```

**測試清單**：

**UI 加載**：
- [ ] IncomeView 正確加載
- [ ] 表格顯示（即使為空）
- [ ] 搜尋欄正確顯示
- [ ] 「+ 新增記帳」按鈕可點擊

**新增功能**：
- [ ] 點擊「+ 新增記帳」打開表單
- [ ] 所有欄位可輸入
- [ ] 驗證規則正常（必填欄位標記）
- [ ] 點擊「保存」後無 JavaScript 錯誤
- [ ] 收到成功消息
- [ ] 列表中出現新記錄

**編輯功能**：
- [ ] 點擊「編輯」打開表單
- [ ] 欄位預填充舊值
- [ ] 修改欄位
- [ ] 點擊「保存」
- [ ] 列表中更新數據

**查看歷史**：
- [ ] 點擊「歷史」打開模態框
- [ ] 歷史記錄加載
- [ ] 顯示之前的版本
- [ ] 顯示修改時間和修改人

**刪除功能**：
- [ ] 點擊「刪除」
- [ ] 確認對話框出現
- [ ] 確認後記錄消失
- [ ] 歷史表中仍有記錄

**搜尋和篩選**：
- [ ] 輸入客戶名稱搜尋
- [ ] 選擇日期範圍
- [ ] 選擇收款狀態
- [ ] 點擊「搜尋」
- [ ] 列表根據條件篩選

**分頁**：
- [ ] 「下一頁」按鈕正常
- [ ] 「上一頁」按鈕正常
- [ ] 頁碼信息正確
- [ ] 分頁後顯示正確的記錄

#### API 測試

```bash
# 使用 curl 測試 API
# 需要有效的認證令牌

# 新增
curl -X POST http://localhost:3000/api/income \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "BILL_DATE": "2024-01-15",
    "CUSTOMER_NAME": "Test",
    "QUOTE_AMOUNT": 10000,
    "ACTUAL_AMOUNT": 10000,
    "UNCOLLECTED_AMOUNT": 0,
    "COLLECTION_STATUS": "Y"
  }'

# 查詢
curl -X GET "http://localhost:3000/api/income?limit=20" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# 編輯
curl -X PUT "http://localhost:3000/api/income?incomeId=20240115001" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"CUSTOMER_NAME":"Updated",...}'

# 刪除
curl -X DELETE "http://localhost:3000/api/income?incomeId=20240115001" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

**API 驗證清單**：
- [ ] POST 返回 201 + incomeId
- [ ] GET 返回 200 + 數據
- [ ] GET 分頁返回正確的偏移量
- [ ] GET history 返回歷史記錄
- [ ] PUT 返回 200
- [ ] PUT 後舊數據在歷史表中
- [ ] DELETE 返回 200
- [ ] DELETE 後主表無記錄，歷史表有

---

### 第七部分：生產構建

```bash
# 構建
npm run build

# 檢查構建產物
ls -la dist/
# 應有 index.html 和 assets/

# 檢查大小
du -sh dist/
# 應 < 500KB
```

**構建驗證清單**：
- [ ] npm run build 成功
- [ ] 無 build 錯誤
- [ ] dist/ 目錄生成
- [ ] index.html 存在
- [ ] assets/ 目錄存在且不為空
- [ ] 檔案大小合理

---

### 第八部分：Vercel 部署

#### 配置 Vercel

1. 連接 GitHub 倉庫
2. 設置環境變量：
   - [ ] DB_USER
   - [ ] DB_PASSWORD
   - [ ] DB_CONNECTION_STRING

3. 部署設置：
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`
   - [ ] Install Command: `npm install`

#### 部署

```bash
# 使用 Vercel CLI
vercel deploy --prod

# 或推送到 main 分支（自動部署）
git push origin main
```

**部署驗證清單**：
- [ ] Vercel 構建成功
- [ ] 構建日誌無錯誤
- [ ] 環境變量正確設置
- [ ] 預覽部署可訪問
- [ ] 生產部署可訪問

#### 生產環境測試

```bash
# 測試生產 URL
curl https://your-app.vercel.app/api/income

# 在瀏覽器測試
# 1. 登入生產環境
# 2. 測試所有功能
# 3. 檢查控制台是否有錯誤
```

**生產驗證清單**：
- [ ] 首頁加載成功
- [ ] 登入功能正常
- [ ] 可導航到收入記帳頁面
- [ ] 所有功能正常工作
- [ ] API 響應時間 < 1s
- [ ] 無 JavaScript 錯誤
- [ ] 響應式設計正常
- [ ] 數據正確展示

---

### 第九部分：數據完整性檢查

#### 驗證數據流

```sql
-- 檢查主表
SELECT COUNT(*) FROM "ADMIN"."INC_INCOME_MAIN";

-- 檢查歷史表
SELECT COUNT(*) FROM "ADMIN"."INC_INCOME_HIST";

-- 檢查數據一致性
SELECT SUM(QUOTE_AMOUNT) FROM "ADMIN"."INC_INCOME_MAIN";
SELECT SUM(QUOTE_AMOUNT) FROM "ADMIN"."INC_INCOME_HIST";

-- 檢查修改者信息
SELECT DISTINCT MOTIFER FROM "ADMIN"."INC_INCOME_MAIN" 
WHERE MOTIFER IS NOT NULL;
```

**數據驗證清單**：
- [ ] 主表有記錄
- [ ] 歷史表有對應的編輯記錄
- [ ] 金額計算正確
- [ ] 修改者信息正確
- [ ] 時間戳有序
- [ ] 無數據重複

---

### 第十部分：性能測試

#### 負載測試

```bash
# 使用 ApacheBench 測試
ab -n 100 -c 10 https://your-app.vercel.app/api/income

# 預期：響應時間 < 500ms
```

**性能驗證清單**：
- [ ] 平均響應時間 < 500ms
- [ ] 95% 請求 < 1000ms
- [ ] 無請求超時
- [ ] 數據庫連接穩定

#### 監控

- [ ] 設置 Vercel 監控告警
- [ ] 設置數據庫監控
- [ ] 檢查錯誤日誌
- [ ] 監控 API 響應時間

---

### 第十一部分：文檔完整性

**用戶文檔**：
- [ ] QUICK_START.md 清晰易懂
- [ ] 包含截圖示例（可選）
- [ ] 故障排除部分完整
- [ ] API 文檔準確

**技術文檔**：
- [ ] README.md 包含完整規格
- [ ] 代碼註釋充分
- [ ] 架構圖清晰
- [ ] 部署步驟詳細

**維護文檔**：
- [ ] 性能優化建議
- [ ] 故障處理流程
- [ ] 擴展指南
- [ ] 備份和恢復流程

---

### 第十二部分：安全檢查

#### 認證和授權

- [ ] 所有 API 都需要認證
- [ ] 權限檢查正常
- [ ] 無越權訪問

#### 數據保護

- [ ] 敏感數據不在日誌中
- [ ] 環境變量正確隱藏
- [ ] HTTPS 已啟用
- [ ] SQL 注入已防護

#### 合規性

- [ ] 符合會計規範
- [ ] 審計線索完整
- [ ] 修改歷史可溯源
- [ ] 刪除記錄有備份

---

## 🚀 最終部署步驟

### 部署前檢查清單

按順序檢查：

1. **文件檢查** ✅
2. **數據庫檢查** ✅
3. **環境配置** ✅
4. **依賴檢查** ✅
5. **代碼檢查** ✅
6. **功能測試** ✅
7. **構建測試** ✅
8. **Vercel 部署** ✅
9. **數據驗證** ✅
10. **性能測試** ✅
11. **文檔檢查** ✅
12. **安全檢查** ✅

### 部署命令

```bash
# 確保所有更改已提交
git add .
git commit -m "feat: implement income module"
git push origin main

# 如果使用 Vercel CLI
vercel deploy --prod

# 監控部署
vercel list

# 查看日誌
vercel logs
```

### 部署後驗證

1. [ ] 訪問生產 URL
2. [ ] 登入系統
3. [ ] 導航到收入記帳
4. [ ] 測試新增、編輯、刪除
5. [ ] 檢查歷史記錄
6. [ ] 檢查數據庫
7. [ ] 監控錯誤日誌

### 回滾計劃

如果部署有問題：

```bash
# 立即回滾到上一個版本
vercel rollback

# 或手動還原
git revert HEAD
git push origin main
```

---

## 📞 故障排除

### 常見問題

**問題**：表已存在錯誤
```sql
ORA-00955: name is already used by an existing object
```
**解決**：
```sql
DROP TABLE "ADMIN"."INC_INCOME_HIST";
DROP TABLE "ADMIN"."INC_INCOME_MAIN";
-- 重新運行腳本
```

**問題**：連接超時
```
ETIMEDOUT: connection timed out
```
**解決**：
1. 檢查數據庫連接字符串
2. 檢查防火牆規則
3. 檢查 Oracle Cloud 網絡配置

**問題**：API 返回 500
```json
{"error": "Internal server error"}
```
**解決**：
1. 查看 Vercel 日誌
2. 檢查數據庫連接
3. 檢查環境變量

---

## ✨ 部署成功標誌

部署成功的標誌：

✅ 所有測試通過  
✅ 生產環境無錯誤  
✅ 數據正確保存和展示  
✅ 性能達到預期  
✅ 用戶可正常使用  

---

**部署日期**：___________  
**部署人員**：___________  
**驗證人員**：___________  
**狀態**：[ ] 待部署 [ ] 部署中 [ ] 已部署 [ ] 驗證完成
