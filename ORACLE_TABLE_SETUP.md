# 🗄️ Oracle 表結構建立指南

## 📋 概況

你已經獲得了完整的 SQL 腳本。現在需要在你的 Oracle Cloud 數據庫中執行它，以建立兩個核心表：

- **INC_INCOME_MAIN** - 當前收入記帳數據
- **INC_INCOME_HIST** - 完整的修改歷史記錄

**預期時間**：5-10 分鐘

---

## ✅ 執行方式選擇

### 方式 A：使用 Oracle Cloud SQL Developer Web（推薦）

**最簡單的方式** ⭐⭐⭐

#### 步驟 1：登入 Oracle Cloud

1. 打開 https://cloud.oracle.com
2. 登入你的 Oracle Cloud 帳號
3. 進入「資料庫」→「資料庫系統」或「資料庫實例」

#### 步驟 2：打開 SQL Developer

1. 找到你的數據庫實例
2. 點擊「資料庫操作」或「工具」
3. 選擇「SQL Developer Web」或「SQL Workshop」
4. 使用數據庫帳號登入（通常是 admin）

#### 步驟 3：執行 SQL 腳本

1. 在 SQL 編輯器中，複製 `sql/income_tables.sql` 的所有內容
2. 粘貼到編輯器
3. 點擊「執行」或按 Ctrl+Enter

**預期輸出**：
```
CREATE TABLE "ADMIN"."INC_INCOME_MAIN" successful
CREATE TABLE "ADMIN"."INC_INCOME_HIST" successful
CREATE INDEX successful (x5)
```

#### 步驟 4：驗證

在同一個 SQL 編輯器中執行驗證查詢：

```sql
-- 檢查主表
DESC "ADMIN"."INC_INCOME_MAIN";

-- 應看到 20 行輸出，顯示所有欄位名稱和類型
```

---

### 方式 B：使用 SQL*Plus 命令行

**更技術性的方式** ⭐⭐

#### 步驟 1：準備

確保你已安裝 SQL*Plus（通常隨 Oracle 客戶端安裝）

#### 步驟 2：連接數據庫

```bash
sqlplus admin/your_password@your_connection_string
```

**連接字符串範例**：
```
sqlplus admin/password@(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=your-host.com)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=yourservice)))
```

#### 步驟 3：執行腳本

**選項 A - 直接執行文件**：
```sql
@sql/income_tables.sql
```

**選項 B - 複製粘貼**：
1. 打開 `sql/income_tables.sql`
2. 複製所有內容
3. 粘貼到 SQL*Plus
4. 按 Enter 執行

#### 步驟 4：驗證

```sql
DESC "ADMIN"."INC_INCOME_MAIN";
SELECT COUNT(*) as index_count FROM user_indexes 
WHERE table_name = 'INC_INCOME_MAIN';
```

---

### 方式 C：使用 SQL 開發工具（如 DBeaver、DataGrip）

**功能豐富的方式** ⭐⭐⭐

#### 步驟 1：連接數據庫

1. 打開你的 SQL 開發工具
2. 建立新連接到 Oracle Cloud
3. 測試連接

#### 步驟 2：執行腳本

1. 打開 `sql/income_tables.sql` 文件
2. 右鍵選擇「執行」或「運行腳本」
3. 查看執行結果

#### 步驟 3：驗證

運行驗證查詢確認表已創建

---

## 📝 完整的驗證步驟

執行完上述步驟後，運行以下 SQL 命令來驗證一切正確：

### 1️⃣ 驗證主表存在

```sql
DESC "ADMIN"."INC_INCOME_MAIN";
```

**預期輸出**：
```
名稱                    空值      類型
------- -------- ----------- 
SID                          VARCHAR2(100)
INCOME_ID                    VARCHAR2(100)
BILL_DATE                    DATE
INVOICE_NO                   VARCHAR2(100)
CUSTOMER_NAME                VARCHAR2(100)
PROJECT                      VARCHAR2(100)
PERSONNEL                    VARCHAR2(50)
LOCATION                     VARCHAR2(100)
QUOTE_AMOUNT                 NUMBER
ACTUAL_AMOUNT                NUMBER
UNCOLLECTED_AMOUNT           NUMBER
COLLECTION_METHOD            VARCHAR2(50)
COLLECTION_STATUS            CHAR(1)
COST_AMOUNT                  NUMBER
ESTIMATED_PROFIT             NUMBER
REMARK                       VARCHAR2(500)
CREATE_USER                  VARCHAR2(50)
CREATE_TIME                  DATE
MOTIFER                      VARCHAR2(50)
MOTIFY_TIME                  DATE
```

### 2️⃣ 驗證歷史表存在

```sql
DESC "ADMIN"."INC_INCOME_HIST";
```

**預期結果**：同上（20 個欄位）

### 3️⃣ 驗證索引已建立

```sql
SELECT INDEX_NAME, TABLE_NAME 
FROM USER_INDEXES 
WHERE TABLE_NAME IN ('INC_INCOME_MAIN', 'INC_INCOME_HIST')
ORDER BY TABLE_NAME, INDEX_NAME;
```

**預期輸出**：
```
INDEX_NAME                           TABLE_NAME
PK_INC_INCOME_MAIN                   INC_INCOME_MAIN
UQ_INC_INCOME_ID                     INC_INCOME_MAIN
IDX_INC_INCOME_MAIN_BILL_DATE        INC_INCOME_MAIN
IDX_INC_INCOME_MAIN_CUSTOMER         INC_INCOME_MAIN
IDX_INC_INCOME_MAIN_STATUS           INC_INCOME_MAIN
PK_INC_INCOME_HIST                   INC_INCOME_HIST
IDX_INC_INCOME_HIST_INCOME_ID        INC_INCOME_HIST
IDX_INC_INCOME_HIST_MOTIFY_TIME      INC_INCOME_HIST
```

### 4️⃣ 驗證約束已建立

```sql
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM USER_CONSTRAINTS 
WHERE TABLE_NAME = 'INC_INCOME_MAIN'
ORDER BY CONSTRAINT_NAME;
```

**預期輸出**：
```
CONSTRAINT_NAME                      CONSTRAINT_TYPE
CK_INC_COLLECTION_STATUS             C
PK_INC_INCOME_MAIN                   P
UQ_INC_INCOME_ID                     U
```

### 5️⃣ 驗證表為空

```sql
SELECT COUNT(*) as row_count FROM "ADMIN"."INC_INCOME_MAIN";
SELECT COUNT(*) as row_count FROM "ADMIN"."INC_INCOME_HIST";
```

**預期輸出**：
```
ROW_COUNT
0
```

---

## ✅ 驗收清單

執行完後，檢查以下項目：

- [ ] INC_INCOME_MAIN 表已建立（20 欄位）
- [ ] INC_INCOME_HIST 表已建立（20 欄位）
- [ ] 5 個索引已建立
- [ ] 3 個約束已建立
- [ ] 兩個表都為空（ROW_COUNT = 0）
- [ ] 無 ORA-00000 錯誤消息
- [ ] 無 ORA-00955 （對象已存在）錯誤
- [ ] 可以執行 SELECT 語句

---

## 🐛 常見問題排除

### 問題 1：ORA-00955: name is already used by an existing object

**原因**：表已經存在

**解決**：
```sql
DROP TABLE "ADMIN"."INC_INCOME_HIST";
DROP TABLE "ADMIN"."INC_INCOME_MAIN";
-- 然後重新執行 income_tables.sql
```

### 問題 2：ORA-01031: insufficient privileges

**原因**：用戶權限不足

**解決**：
1. 使用管理員帳號連接
2. 或要求 DBA 授予 CREATE TABLE 權限

```sql
-- DBA 執行
GRANT CREATE TABLE, CREATE INDEX TO admin;
```

### 問題 3：ORA-00001: unique constraint violated

**原因**：數據重複（只在有數據時出現）

**解決**：
```sql
DELETE FROM "ADMIN"."INC_INCOME_HIST";
DELETE FROM "ADMIN"."INC_INCOME_MAIN";
-- 重新執行
```

### 問題 4：ORA-02266: unique or primary key constraint violated

**原因**：外鍵約束衝突

**解決**：
```sql
-- 禁用約束
ALTER TABLE "ADMIN"."INC_INCOME_MAIN" DISABLE CONSTRAINT PK_INC_INCOME_MAIN;
-- 清空表
TRUNCATE TABLE "ADMIN"."INC_INCOME_MAIN";
-- 啟用約束
ALTER TABLE "ADMIN"."INC_INCOME_MAIN" ENABLE CONSTRAINT PK_INC_INCOME_MAIN;
```

### 問題 5：無法連接到數據庫

**原因**：連接字符串錯誤或數據庫不可用

**解決**：
1. 驗證連接字符串
2. 確認 Oracle Cloud 防火牆規則
3. 檢查數據庫實例狀態
4. 聯繫 Oracle Cloud 支持

---

## 📊 表結構快速查看

### INC_INCOME_MAIN 欄位列表

| # | 欄位名 | 類型 | 長度 | 必填 | 說明 |
|---|-------|------|------|------|------|
| 1 | SID | VARCHAR2 | 100 | ✓ | 主鍵 |
| 2 | INCOME_ID | VARCHAR2 | 100 | ✓ | 唯一編號 |
| 3 | BILL_DATE | DATE | - | ✓ | 日期 |
| 4 | INVOICE_NO | VARCHAR2 | 100 | ✗ | 憑據 |
| 5 | CUSTOMER_NAME | VARCHAR2 | 100 | ✓ | 客戶名稱 |
| 6 | PROJECT | VARCHAR2 | 100 | ✗ | 工項 |
| 7 | PERSONNEL | VARCHAR2 | 50 | ✗ | 施作人員 |
| 8 | LOCATION | VARCHAR2 | 100 | ✗ | 地點 |
| 9 | QUOTE_AMOUNT | NUMBER | - | ✓ | 報價金額 |
| 10 | ACTUAL_AMOUNT | NUMBER | - | ✓ | 實做金額 |
| 11 | UNCOLLECTED_AMOUNT | NUMBER | - | ✓ | 未收金額 |
| 12 | COLLECTION_METHOD | VARCHAR2 | 50 | ✗ | 收款方式 |
| 13 | COLLECTION_STATUS | CHAR | 1 | ✓ | 收款狀態 |
| 14 | COST_AMOUNT | NUMBER | - | ✗ | 成本金額 |
| 15 | ESTIMATED_PROFIT | NUMBER | - | ✗ | 預估毛利 |
| 16 | REMARK | VARCHAR2 | 500 | ✗ | 備註 |
| 17 | CREATE_USER | VARCHAR2 | 50 | ✗ | 建立使用者 |
| 18 | CREATE_TIME | DATE | - | ✗ | 建立時間 |
| 19 | MOTIFER | VARCHAR2 | 50 | ✗ | 修改者 |
| 20 | MOTIFY_TIME | DATE | - | ✗ | 修改時間 |

### INC_INCOME_HIST 欄位列表

**與 INC_INCOME_MAIN 相同，用於存儲歷史版本**

---

## 🚀 下一步

表創建完成後：

### ✅ 第一步：驗證成功
- [ ] 運行上述驗證查詢
- [ ] 確認所有檢查項通過

### ✅ 第二步：配置環境
編輯 `.env.local`：
```env
DB_USER=admin
DB_PASSWORD=your_password
DB_CONNECTION_STRING=your_connection_string
```

### ✅ 第三步：啟動開發環境
```bash
npm run dev
```

### ✅ 第四步：測試應用
1. 打開 http://localhost:5173
2. 登入系統
3. 導航到「收入記帳」
4. 新增一筆記帳進行測試

---

## 📞 需要幫助？

如果執行過程中遇到問題：

1. **檢查 SQL 語法** - 確保粘貼的內容完整
2. **檢查連接** - 驗證數據庫連接正常
3. **檢查權限** - 確認有 CREATE TABLE 權限
4. **查看日誌** - 查閱詳細的錯誤消息
5. **聯繫支持** - 提供錯誤消息給技術支持

---

**預計完成時間**：5-10 分鐘  
**難度級別**：⭐⭐ 簡單  
**下一步**：配置環境變量和啟動開發環境
