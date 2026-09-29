import oracledb from 'oracledb'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { loadEnv } from './loadEnv'

loadEnv()

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

let pool: oracledb.Pool | null = null
let walletDir: string | null = null

function ensureWallet(): string {
  if (walletDir) return walletDir

  const dir = path.join(os.tmpdir(), 'wallet')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const walletFiles: Record<string, string | undefined> = {
    'sqlnet.ora': process.env.WALLET_SQLNET,
    'cwallet.sso': process.env.WALLET_CWALLET,
    'ewallet.p12': process.env.WALLET_EWALLET,
  }

  for (const [fileName, base64Content] of Object.entries(walletFiles)) {
    if (fileName !== 'ewallet.p12' && !base64Content) {
      throw new Error(`缺少環境變數:找不到 ${fileName} 對應的 wallet 內容`)
    }
    if (base64Content) {
      fs.writeFileSync(path.join(dir, fileName), Buffer.from(base64Content, 'base64'))
    }
  }

  console.log('[wallet] 寫入目錄:', dir)
  console.log('[wallet] 目錄內容:', fs.readdirSync(dir))

  walletDir = dir
  return walletDir
}

export async function getConnection() {
  const dir = ensureWallet()

  if (!pool) {
    console.log('[db] 準備建立連線池, connectString =', process.env.DB_CONNECT_STRING)
    console.log('[db] configDir =', dir)

    try {
      pool = await oracledb.createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING,
        configDir: dir,
        poolMin: 0,
        poolMax: 4,
        poolTimeout: 60,
        queueTimeout: 15000,
      })
      console.log('[db] 連線池建立成功')
    } catch (err) {
      console.error('[db] 連線池建立失敗,完整錯誤:', err)
      throw err
    }
  }

  return pool.getConnection()
}