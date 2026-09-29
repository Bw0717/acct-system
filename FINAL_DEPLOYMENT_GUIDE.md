# 🚀 最終部署指南 - bw0717 GitHub 帳號

## ✅ 已完成的準備工作

- ✅ Git 已初始化
- ✅ 所有代碼已提交
- ✅ 你的 GitHub 帳號已配置（bw0717）
- ✅ Oracle 數據庫表已建立
- ✅ Vercel 項目已連接：https://vercel.com/chiens-projects-4b898278/acct-system

---

## 📋 接下來 3 步完成部署

### 第 1 步：在 GitHub 創建倉庫（2 分鐘）

1. **打開 GitHub**
   - 訪問 https://github.com/new
   - 登入帳號 **bw0717**

2. **創建新倉庫**
   - Repository name：**acct-system**
   - Description：Income Accounting System
   - Public 或 Private（自選）
   - **勾選 "Initialize this repository with:"** - 不要初始化（因為我們已經有本地代碼）
   - 點擊 **Create repository**

3. **複製倉庫 URL**
   - 會看到提示，複製 HTTPS URL：
   ```
   https://github.com/bw0717/acct-system.git
   ```

### 第 2 步：推送代碼到 GitHub（2 分鐘）

打開 **PowerShell**，執行：

```powershell
cd D:\acct-system

# 驗證遠程倉庫已配置
git remote -v

# 推送代碼
git branch -M main
git push -u origin main
```

**預期輸出**：
```
Enumerating objects: xxx, done.
Counting objects: 100% (xxx/xxx)
...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ 代碼已推送到 GitHub！

### 第 3 步：在 Vercel 設置環境變量和連接 GitHub（2 分鐘）

1. **訪問 Vercel Dashboard**
   https://vercel.com/chiens-projects-4b898278/acct-system

2. **設置環境變量**
   - 進入 **Settings** → **Environment Variables**
   - 添加以下變量（根據你的 Oracle 配置）：

   ```env
   DB_USER=admin
   DB_PASSWORD=你的Oracle密碼
   DB_CONNECTION_STRING=你的Oracle連接字符串
   ```

   對每個環境設置：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. **連接 GitHub 倉庫**
   - 進入 **Settings** → **Git** → **Connected Git Repository**
   - 如果還未連接：
     - 點擊 **Connect Repository**
     - 授權 Vercel 訪問你的 GitHub
     - 選擇 **bw0717/acct-system**
   
4. **確認部署設置**
   - Production Branch: `main`
   - Build Command: `npm run build`
   - Output Directory: `dist`

✅ Vercel 已連接到 GitHub！

### 第 4 步：觸發自動部署（5-10 分鐘）

推送任何更改以觸發部署：

```powershell
cd D:\acct-system

# 創建一個小的更改（可選）
# 或者直接推送已有代碼

git push origin main
```

Vercel 會自動：
1. 檢測到代碼更新
2. 開始構建
3. 部署到生產環境

---

## 📊 監控部署進度

1. **訪問 Vercel Deployments**
   https://vercel.com/chiens-projects-4b898278/acct-system/deployments

2. **查看部署狀態**
   ```
   🔵 Building...  → 🟢 Ready → 🟢 Live ✅
   ```

3. **查看構建日誌**（如果有問題）
   - 點擊部署
   - 點擊 "View Build Logs"

---

## ✅ 部署完成驗證

部署完成後（5-10 分鐘），執行以下驗收：

### 訪問應用

```
https://acct-system.vercel.app
```

或進入 Vercel Dashboard 查看分配的 URL。

### 功能測試

1. **登入**
   - 使用你的帳號登入
   - 確認沒有認證錯誤

2. **進入收入記帳**
   - 點擊「收入記帳」
   - 看到空表格

3. **新增記帳**
   ```
   點擊「+ 新增記帳」
   填入：
   - 日期：2024-01-16
   - 客戶名稱：測試客戶
   - 報價金額：10000
   - 實做金額：10000
   - 未收金額：0
   - 收款狀態：Y（已收款）
   
   點擊「保存」
   ✅ 記帳出現在列表中
   ```

4. **編輯記帳**
   ```
   點擊「編輯」
   修改客戶名稱
   點擊「保存」
   ✅ 數據更新
   ```

5. **查看歷史**
   ```
   點擊「歷史」
   ✅ 看到修改記錄
   ```

6. **刪除記帳**
   ```
   點擊「刪除」
   確認刪除
   ✅ 記帳消失
   ```

### 數據庫驗證

```sql
-- 在 Oracle Cloud 執行
SELECT COUNT(*) FROM "ADMIN"."INC_INCOME_MAIN";
-- 應返回你新增的記帳數

SELECT COUNT(*) FROM "ADMIN"."INC_INCOME_HIST";
-- 應返回修改的歷史記錄數
```

---

## 🎯 成功部署的標誌

```
✅ Vercel 顯示「Live」和綠色✓
✅ 能訪問 acct-system.vercel.app
✅ 應用正常加載
✅ 能登入系統
✅ 能進入「收入記帳」
✅ 新增記帳成功
✅ 編輯記帳成功
✅ 查看歷史成功
✅ 刪除記帳成功
✅ 數據保存到 Oracle
✅ 沒有 JavaScript 錯誤
```

---

## 🔧 如果部署失敗

### 常見問題

**問題 1：GitHub 倉庫未找到**
```
fatal: repository 'https://github.com/bw0717/acct-system.git' not found
```
**解決**：
1. 確認已在 https://github.com/new 創建倉庫
2. 倉庫名稱必須是 **acct-system**
3. 確認已授權 Vercel 訪問 GitHub

**問題 2：構建失敗**
```
npm ERR! ...
```
**解決**：
1. 本地執行 `npm install` 和 `npm run build`
2. 確認沒有錯誤
3. 推送修復後的代碼

**問題 3：連接 Oracle 失敗**
```
Error: ORA-xxxxx
```
**解決**：
1. 檢查環境變量是否正確設置
2. 驗證 Oracle 實例在線
3. 確認防火牆規則允許連接

**問題 4：頁面加載但無樣式**
**解決**：
1. F12 查看 Network
2. 清除 Vercel 緩存
3. 重新部署

---

## 📋 完整檢查清單

### 準備階段
- ✅ Oracle 表已建立
- ✅ 本地測試通過（npm run dev）
- ✅ Git 已初始化
- ✅ 代碼已提交

### GitHub 階段
- ⏳ GitHub 倉庫已創建（待做）
- ⏳ 代碼已推送（待做）

### Vercel 階段
- ⏳ 環境變量已設置（待做）
- ⏳ GitHub 已連接（待做）
- ⏳ 部署已完成（待做）

### 驗證階段
- ⏳ 應用已訪問（待做）
- ⏳ 功能已驗證（待做）
- ⏳ 數據已保存（待做）

---

## 🚀 立即開始

### 執行步驟

1. **在 GitHub 創建倉庫**
   - 訪問 https://github.com/new
   - 創建 **acct-system** 倉庫
   
2. **推送代碼**
   ```powershell
   cd D:\acct-system
   git push -u origin main
   ```

3. **設置 Vercel**
   - 進入 https://vercel.com/chiens-projects-4b898278/acct-system
   - Settings → Environment Variables → 添加 3 個變量
   - Settings → Git → 連接 bw0717/acct-system

4. **等待部署**
   - 5-10 分鐘後訪問 https://acct-system.vercel.app

5. **驗證功能**
   - 新增、編輯、刪除記帳

---

## ⏰ 時間預估

| 步驟 | 時間 |
|------|------|
| 創建 GitHub 倉庫 | 2 分鐘 |
| 推送代碼 | 2 分鐘 |
| 設置 Vercel | 2 分鐘 |
| 等待部署 | 5-10 分鐘 |
| 驗證功能 | 3 分鐘 |
| **總計** | **15-20 分鐘** |

---

## 📞 需要幫助？

- GitHub 文檔：https://docs.github.com
- Vercel 文檔：https://vercel.com/docs
- Oracle 連接：查看 ORACLE_TABLE_SETUP.md

---

**現在就開始部署吧！** 🚀

下一步：訪問 https://github.com/new 創建倉庫

預計 20 分鐘後，你的應用將上線！✨

---

**你的 GitHub**：bw0717  
**你的倉庫**：acct-system  
**你的 Vercel 項目**：https://vercel.com/chiens-projects-4b898278/acct-system  
**你的應用 URL**：https://acct-system.vercel.app
