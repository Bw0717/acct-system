import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// vercel dev 在某些環境下不會自動載入 .env.local,
// 這裡主動讀取一次,確保 process.env 裡一定有值。
// 正式部署到 Vercel 時,.env.local 不存在(也不會被上傳),
// 這段會直接跳過,不影響正式環境讀取 Vercel 網站設定的環境變數。
let loaded = false

export function loadEnv() {
  if (loaded) return
  loaded = true

  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  }
}