# 🎯 收入記帳模組 - 行動計劃

## 📋 你現在處於哪個階段？

✅ **已完成**：代碼、設計和文檔（100%）  
⏳ **待完成**：數據庫表建立和部署（0%）

---

## 🚀 從現在開始的 30 分鐘行動計劃

### ⏱️ 第 0-5 分鐘：準備工作

**任務**：獲取必要信息

- [ ] 登入 Oracle Cloud 帳戶
- [ ] 打開 SQL Developer Web
- [ ] 獲取數據庫連接字符串
- [ ] 準備好 admin 帳號和密碼

**預期時間**：5 分鐘

---

### ⏱️ 第 5-15 分鐘：建立數據庫表

**任務**：執行 SQL 腳本

1. **打開 SQL Developer Web**
   - 進入 Oracle Cloud 控制台
   - 找到你的數據庫實例
   - 點擊「SQL Developer Web」

2. **複製 SQL 腳本**
   ```
   打開文件：sql/income_tables.sql
   複製全部內容
   ```

3. **執行 SQL**
   ```
   粘貼到 SQL Developer
   點擊「執行」或 Ctrl+Enter
   等待完成
   ```

4. **驗證結果**
   ```sql
   DESC "ADMIN"."INC_INCOME_MAIN";
   ```
   應看到 20 個欄位

**預期時間**：10 分鐘

**若發生錯誤**：
- 查看 `ORACLE_TABLE_SETUP.md` 的故障排除部分

---

### ⏱️ 第 15-20 分鐘：配置環境

**任務**：設置環境變量

1. **編輯 `.env.local` 文件**
   ```env
   DB_USER=admin
   DB_PASSWORD=your_password
   DB_CONNECTION_STRING=your_oracle_connection_string
   VITE_APP_API_BASE_URL=http://localhost:3000
   ```

2. **確認設置**
   - DB_USER：Oracle 帳號（通常是 admin）
   - DB_PASSWORD：你的密碼
   - DB_CONNECTION_STRING：Oracle Cloud 連接字符串
   - 保存文件

**預期時間**：5 分鐘

---

### ⏱️ 第 20-25 分鐘：啟動開發環境

**任務**：測試本地環境

1. **打開終端/命令行**
   ```bash
   cd D:\acct-system
   npm install
   npm run dev
   ```

2. **等待啟動完成**
   ```
   ➜  Local:   http://localhost:5173/
   ➜  press h to show help
   ```

3. **打開瀏覽器**
   - 訪問 http://localhost:5173
   - 登入系統（使用已有帳號）

**預期時間**：5 分鐘

---

### ⏱️ 第 25-30 分鐘：功能測試

**任務**：驗證收入記帳功能

1. **導航到收入記帳**
   - 登入後進入主菜單
   - 點擊「收入記帳」

2. **測試新增功能**
   - 點擊「+ 新增記帳」
   - 填寫表單（必填項：日期、客戶、金額）
   - 點擊「保存」
   - ✅ 確認看到新記帳

3. **測試其他功能**
   - 編輯：點擊「編輯」修改記帳
   - 歷史：點擊「歷史」查看修改記錄
   - 刪除：點擊「刪除」移除記帳

4. **檢查數據庫**
   ```sql
   SELECT COUNT(*) FROM "ADMIN"."INC_INCOME_MAIN";
   -- 應返回你新增的記帳數
   ```

**預期時間**：5 分鐘

---

## ✅ 詳細步驟指南

### 步驟 1️⃣：建立數據庫表

**重要性**：⭐⭐⭐⭐⭐ 必須完成

#### 方式選擇：

**選項 A - Oracle Cloud SQL Developer（推薦）**

```
1. 打開 https://cloud.oracle.com
2. 登入帳號
3. 進入「資料庫」→「資料庫實例」
4. 選擇你的實例
5. 點擊「工具」→「SQL Developer Web」
6. 使用 admin 登入
7. 打開 sql/income_tables.sql
8. 複製所有 SQL
9. 粘貼到編輯器
10. 點擊「執行」
```

**選項 B - SQL*Plus 命令行**

```bash
sqlplus admin/password@connection_string
SQL> @sql/income_tables.sql
SQL> DESC "ADMIN"."INC_INCOME_MAIN";
```

**選項 C - DBeaver/DataGrip**

```
1. 連接到 Oracle 數據庫
2. 打開 sql/income_tables.sql
3. 右鍵 → 執行
4. 確認成功
```

#### 驗證命令：

```sql
-- 驗證主表
DESC "ADMIN"."INC_INCOME_MAIN";

-- 驗證歷史表
DESC "ADMIN"."INC_INCOME_HIST";

-- 驗證索引
SELECT COUNT(*) FROM USER_INDEXES 
WHERE TABLE_NAME IN ('INC_INCOME_MAIN', 'INC_INCOME_HIST');
-- 應返回 8（5 個主表索引 + 3 個歷史表索引）
```

---

### 步驟 2️⃣：配置環境變量

**重要性**：⭐⭐⭐⭐⭐ 必須完成

#### 文件位置：

```
D:\acct-system\.env.local
```

#### 必填內容：

```env
# Oracle 數據庫配置（必填）
DB_USER=admin
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=your_oracle_connection_string

# 應用配置（可選）
VITE_APP_API_BASE_URL=http://localhost:3000
```

#### 獲取連接字符串的方法：

**方式 1 - 從 Oracle Cloud 複製**
```
1. 進入 Oracle Cloud 控制台
2. 找到 Database Instance
3. 點擊「連接」或「Details」
4. 複製「Connection String」
5. 粘貼到 DB_CONNECTION_STRING
```

**方式 2 - 自行構造**
```
格式：hostname:port:service_name
例如：my-db.abc123.oraclecloud.com:1521:ORCL
```

#### 保存方式：

1. 打開 `.env.local` 文件
2. 編輯內容
3. Ctrl+S 保存
4. ✅ 確保沒有引號或特殊字符

---

### 步驟 3️⃣：啟動開發環境

**重要性**：⭐⭐⭐⭐ 必須完成

#### 開發環境啟動：

```bash
# 進入項目目錄
cd D:\acct-system

# 安裝依賴（如果還未安裝）
npm install

# 啟動開發伺服器
npm run dev
```

#### 預期輸出：

```
  VITE v8.3.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

#### 訪問應用：

1. 打開瀏覽器
2. 訪問 http://localhost:5173
3. 登入系統
4. 你應該看到主菜單

---

### 步驟 4️⃣：測試功能

**重要性**：⭐⭐⭐⭐ 必須完成

#### 新增記帳測試：

```
1. 登入系統
2. 點擊主菜單 → 「收入記帳」
3. 看到表格（應為空）
4. 點擊「+ 新增記帳」
5. 填寫表單：
   日期：2024-01-16
   客戶名稱：測試客戶
   報價金額：10000
   實做金額：10000
   未收金額：0
   收款狀態：已收款
6. 點擊「保存」
7. 應看到成功消息
8. 表格中應出現新記帳
```

#### 編輯記帳測試：

```
1. 在列表中找到新增的記帳
2. 點擊「編輯」按鈕
3. 修改客戶名稱為「編輯後客戶」
4. 點擊「保存」
5. 應看到成功消息
6. 列表中的數據應更新
```

#### 查看歷史測試：

```
1. 在列表中找到該記帳
2. 點擊「歷史」按鈕
3. 應看到歷史記錄模態框
4. 應顯示至少 2 個版本
5. 應看到「版本 2」和「版本 1」
```

#### 刪除記帳測試：

```
1. 在列表中找到該記帳
2. 點擊「刪除」按鈕
3. 確認刪除
4. 記帳應從列表消失
5. 但應存在於歷史表中
```

---

## 📝 檢查清單

### 準備階段
- [ ] 登入 Oracle Cloud
- [ ] 打開 SQL Developer Web
- [ ] 獲取數據庫連接信息

### 數據庫建立
- [ ] 複製 `sql/income_tables.sql` 全部內容
- [ ] 在 SQL Developer 執行
- [ ] 看到成功消息
- [ ] 驗證 DESC "ADMIN"."INC_INCOME_MAIN" 返回 20 欄位

### 環境配置
- [ ] 編輯 `.env.local`
- [ ] 填入 DB_USER
- [ ] 填入 DB_PASSWORD
- [ ] 填入 DB_CONNECTION_STRING
- [ ] 保存文件

### 應用啟動
- [ ] 執行 `npm run dev`
- [ ] 看到 http://localhost:5173
- [ ] 打開瀏覽器訪問成功

### 功能測試
- [ ] 成功登入
- [ ] 導航到收入記帳
- [ ] 新增記帳成功
- [ ] 編輯記帳成功
- [ ] 查看歷史成功
- [ ] 刪除記帳成功

### 數據庫驗證
- [ ] 運行 SELECT COUNT(*) 查看記帳數
- [ ] 確認新增的記帳存在
- [ ] 確認刪除的記帳在歷史表中

---

## 🔧 故障排除快速指南

### 問題：SQL 執行失敗

**症狀**：ORA- 開頭的錯誤

**解決步驟**：
1. 檢查是否複製完整了 SQL
2. 檢查表是否已存在
3. 查看 `ORACLE_TABLE_SETUP.md` 的故障排除部分

### 問題：應用無法連接數據庫

**症狀**：500 Internal Server Error 或連接超時

**解決步驟**：
1. 檢查 `.env.local` 的連接信息
2. 驗證數據庫實例在線
3. 檢查防火牆規則
4. 查看 Vercel 日誌

### 問題：新增記帳後在列表看不到

**症狀**：保存成功但列表為空

**解決步驟**：
1. 刷新頁面
2. 檢查瀏覽器開發者工具的 Network 標籤
3. 驗證 API 返回 200
4. 查看數據庫中是否有數據

### 問題：頁面加載失敗

**症狀**：http://localhost:5173 無法訪問

**解決步驟**：
1. 確認 npm run dev 在運行
2. 檢查是否有錯誤信息
3. 嘗試 npm install 重新安裝依賴
4. 查看端口 5173 是否被佔用

---

## ⏰ 時間管理

```
預計總時間：30 分鐘

0-5分鐘   ░░░░░░░░░░░░░░░░░░░░ 準備工作
5-15分鐘  ░░░░░░░░░░░░░░░░░░░░ 建立數據庫表
15-20分鐘 ░░░░░░░░░░░░░░░░░░░░ 配置環境
20-25分鐘 ░░░░░░░░░░░░░░░░░░░░ 啟動環境
25-30分鐘 ░░░░░░░░░░░░░░░░░░░░ 測試功能

總進度：  ████████████████████ 100%
```

---

## 📚 相關文檔

如需詳細信息，參考：

| 問題 | 文檔 |
|------|------|
| 如何建立表 | `ORACLE_TABLE_SETUP.md` |
| 快速開始 | `INCOME_QUICK_START.md` |
| 完整文檔 | `INCOME_MODULE_README.md` |
| 架構說明 | `INCOME_MODULE_SUMMARY.md` |
| 部署到生產 | `DEPLOYMENT_CHECKLIST.md` |
| 項目概況 | `START_HERE.md` |

---

## 🎯 成功標誌

完成後，你應該看到：

✅ 收入記帳列表頁面顯示  
✅ 「+ 新增記帳」按鈕可點擊  
✅ 可以成功新增記帳  
✅ 新增的記帳出現在列表中  
✅ 可以編輯、查看歷史、刪除  
✅ 數據庫中有真實的記帳數據  

---

## 🚀 下一步

完成上述所有步驟後：

1. **本地開發完成** ✅
   - 你可以繼續開發功能
   - 添加新欄位或功能

2. **準備部署** ⏳
   - 按照 `DEPLOYMENT_CHECKLIST.md` 準備
   - 構建生產版本：`npm run build`
   - 部署到 Vercel：`vercel deploy --prod`

3. **后续支持** 📞
   - 查閱相應文檔
   - 參考常見問題部分
   - 聯繫技術支持

---

**開始時間**：現在 🚀  
**預計完成**：30 分鐘後  
**下一步**：點擊上方「執行 SQL」
