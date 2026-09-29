# 🚀 直接部署到 Vercel

你的項目已經連接到 Vercel！現在可以直接部署。

## 📋 部署前檢查清單

### ✅ 必須完成的步驟

#### 1️⃣ 確保環境變量已設置在 Vercel Dashboard

訪問：https://vercel.com/chiens-projects-4b898278/acct-system

1. 進入 **Settings** → **Environment Variables**
2. 添加以下變量：

```env
DB_USER=admin
DB_PASSWORD=你的密碼
DB_CONNECTION_STRING=你的Oracle連接字符串
```

3. 每個環境都要設置：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

#### 2️⃣ 確保數據庫表已建立

```bash
# 在 Oracle Cloud 執行
@sql/income_tables.sql
```

驗證：
```sql
DESC "ADMIN"."INC_INCOME_MAIN";
```

#### 3️⃣ 提交所有代碼到 Git

```bash
cd D:\acct-system

# 查看狀態
git status

# 添加所有文件
git add .

# 提交
git commit -m "feat: implement income module - ready for production"

# 推送到 main/master
git push origin main
```

---

## 🚀 自動部署流程

提交代碼後，Vercel 會：

1. 自動檢測代碼變化
2. 運行 `npm install`
3. 運行 `npm run build`
4. 部署到 Preview（分支）或 Production（main）
5. 自動運行 POST Deploy Hook（可選）

---

## 📊 部署狀態檢查

部署後，檢查：

1. **訪問應用**
   - https://acct-system.vercel.app 或你的自定義域

2. **查看部署日誌**
   - Vercel Dashboard → Deployments → 選擇最新部署 → Logs

3. **檢查功能**
   - 登入系統
   - 導航到「收入記帳」
   - 測試新增、編輯、刪除

---

## 🔧 常見部署問題

### 問題 1：環境變量未找到

**症狀**：500 错误 或连接失败

**解决**：
```
1. 检查 Vercel Dashboard 中的环境变量
2. 确保 DB_CONNECTION_STRING 正确
3. 重新部署：
   - Vercel Dashboard → Deployments → Redeploy
```

### 問題 2：數據庫連接超時

**症狀**：API 返回連接超時錯誤

**解決**：
1. 確認 Oracle Cloud 防火牆規則
2. 確認數據庫實例在線
3. 驗證連接字符串正確

### 問題 3：前端資源 404

**症狀**：頁面加載但 CSS/JS 缺失

**解決**：
1. 清除瀏覽器緩存
2. Vercel 重新部署
3. 檢查構建日誌

### 問題 4：API 返回 401 Unauthorized

**症狀**：無法進行任何操作

**解決**：
1. 確認已登入
2. 檢查認證令牌有效期
3. 重新登入系統

---

## 📈 部署后的驗收步驟

### 功能驗收

- [ ] 能否訪問應用
- [ ] 能否登入系統
- [ ] 能否進入收入記帳頁面
- [ ] 能否新增記帳
- [ ] 能否編輯記帳
- [ ] 能否查看歷史
- [ ] 能否刪除記帳
- [ ] 數據是否正確保存

### 性能驗收

- [ ] 首屏加載時間 < 3s
- [ ] API 響應時間 < 500ms
- [ ] 無 JavaScript 錯誤
- [ ] 無 Network 錯誤

### 安全驗收

- [ ] 無認證的用戶無法訪問
- [ ] 無權限的用戶無法操作
- [ ] 敏感信息未暴露

---

## 🔄 持續部署配置

Vercel 已配置為自動部署：

```
main 分支 → Production 部署 ✅
其他分支 → Preview 部署 ✅
```

### 自動部署流程

```
你提交代碼
    ↓
git push origin main
    ↓
GitHub 檢測到更新
    ↓
Vercel 自動部署
    ↓
構建和測試
    ↓
部署到生產
    ↓
自動發送完成通知
```

---

## 📝 部署命令速查

### 快速部署

```bash
cd D:\acct-system

# 確保有最新代碼
git pull origin main

# 添加更改
git add .

# 提交
git commit -m "feat: description"

# 推送（自動觸發部署）
git push origin main
```

### 查看部署狀態

訪問：https://vercel.com/chiens-projects-4b898278/acct-system/deployments

### 重新部署

1. 進入 Vercel Dashboard
2. 選擇 Deployments
3. 點擊最新部署旁邊的 "..."
4. 選擇 "Redeploy"

### 查看部署日誌

```bash
# 需要安裝 Vercel CLI
npm i -g vercel

# 查看日誌
vercel logs

# 或在 Web 上查看
# Vercel Dashboard → Deployments → 選擇部署 → View Build Logs
```

---

## ✅ 部署檢查清單

部署前：
- [ ] 所有文件已提交到 Git
- [ ] 環境變量已設置在 Vercel
- [ ] 數據庫表已建立
- [ ] 本地測試通過

部署中：
- [ ] 觀察 Vercel 部署日誌
- [ ] 確認無編譯錯誤
- [ ] 確認無部署錯誤

部署後：
- [ ] 訪問應用成功
- [ ] 所有功能正常
- [ ] 性能指標達到預期
- [ ] 安全檢查通過

---

## 📞 支持和監控

### 查看實時日誌

```bash
vercel logs --follow
```

### 設置告警（可選）

在 Vercel Dashboard 中設置通知，當：
- 構建失敗
- 部署失敗
- 性能下降

### 監控應用

```bash
# 查看應用狀態
vercel status

# 查看環境變量
vercel env list

# 查看部署歷史
vercel list
```

---

## 🎯 部署完成後

1. **分享 URL**
   - 生產 URL：https://acct-system.vercel.app
   - 或自定義域（如已配置）

2. **持續改進**
   - 監控用戶反饋
   - 優化性能
   - 添加新功能

3. **安全維護**
   - 定期更新依賴
   - 監控安全告警
   - 執行安全審計

---

**版本**：1.0.0  
**最後更新**：2024-01-16  
**狀態**：✅ **準備部署**

---

## 快速開始部署

```bash
# 1. 進入項目目錄
cd D:\acct-system

# 2. 確保所有文件已保存
git add .
git commit -m "feat: implement income module"

# 3. 推送到 main（自動觸發部署）
git push origin main

# 4. 訪問 Vercel Dashboard 查看部署進度
# https://vercel.com/chiens-projects-4b898278/acct-system

# 5. 完成！訪問你的應用
# https://acct-system.vercel.app
```

部署預計 5-10 分鐘完成！
