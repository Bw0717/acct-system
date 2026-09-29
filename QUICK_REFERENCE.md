# 🚀 快速參考卡 - Vercel 部署

## 3 分鐘快速部署指令

### 打開 PowerShell，執行以下命令：

```powershell
cd D:\acct-system

# 初始化 Git 並提交
git init
git add .
git commit -m "feat: income module"

# 連接到 GitHub（替換為你的 URL）
git remote add origin https://github.com/你的用戶名/acct-system.git

# 推送到 GitHub（自動觸發 Vercel 部署）
git branch -M main
git push -u origin main
```

## 5 分鐘後

1. 訪問 Vercel Dashboard：
   https://vercel.com/chiens-projects-4b898278/acct-system

2. 設置環境變量（Settings → Environment Variables）：
   ```
   DB_USER=admin
   DB_PASSWORD=你的密碼
   DB_CONNECTION_STRING=你的連接字符串
   ```

3. 連接 GitHub 倉庫（Settings → Git）

4. 等待部署完成

## 部署完成後

訪問：https://acct-system.vercel.app

---

## 環境變量範例

```env
# Oracle 數據庫配置
DB_USER=admin
DB_PASSWORD=YourPassword123
DB_CONNECTION_STRING=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=xxx.oraclecloud.com)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=orcl)))
```

---

## 部署故障排除

| 問題 | 解決 |
|------|------|
| npm ERR! | 本地執行 npm install，檢查 package.json |
| 無法連接 Oracle | 檢查環境變量和 Oracle 防火牆 |
| 頁面加載失敗 | 清除 Vercel 緩存，重新部署 |
| 無樣式顯示 | F12 檢查 Network，查找 404 資源 |

---

## 常用 Vercel 命令

```bash
# 安裝 Vercel CLI（可選）
npm install -g vercel

# 登入 Vercel
vercel login

# 查看部署狀態
vercel list

# 查看日誌
vercel logs

# 重新部署
vercel deploy --prod
```

---

## 檢查清單

- [ ] Oracle 表已建立
- [ ] 本地測試通過
- [ ] Git 已初始化
- [ ] GitHub 倉庫已創建
- [ ] 代碼已推送到 GitHub
- [ ] Vercel 環境變量已設置
- [ ] Vercel 已連接 GitHub
- [ ] 部署已完成
- [ ] 應用已訪問
- [ ] 功能已驗證

---

**預計時間**：15-20 分鐘  
**難度**：⭐⭐ 簡單  

立即開始！🚀
