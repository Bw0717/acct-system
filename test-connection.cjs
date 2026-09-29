// 這是完全獨立的測試腳本,跟 Vercel、vercel dev 完全無關
// 直接用 node test-connection.js 執行,單純測試 oracledb 連線本身

require('dotenv').config({ path: '.env.local' })
const oracledb = require('oracledb')
const fs = require('fs')
const path = require('path')
const os = require('os')

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

async function main() {
  const walletDir = path.join(os.tmpdir(), 'wallet-standalone-test')
  if (!fs.existsSync(walletDir)) {
    fs.mkdirSync(walletDir, { recursive: true })
  }

  fs.writeFileSync(path.join(walletDir, 'sqlnet.ora'), Buffer.from(process.env.WALLET_SQLNET, 'base64'))
  fs.writeFileSync(path.join(walletDir, 'cwallet.sso'), Buffer.from(process.env.WALLET_CWALLET, 'base64'))
  if (process.env.WALLET_EWALLET) {
    fs.writeFileSync(path.join(walletDir, 'ewallet.p12'), Buffer.from(process.env.WALLET_EWALLET, 'base64'))
  }

  console.log('wallet 目錄:', walletDir)
  console.log('wallet 內容:', fs.readdirSync(walletDir))
  console.log('連線字串:', process.env.DB_CONNECT_STRING)
  console.log('oracledb 版本:', oracledb.version, oracledb.versionSuffix)
  console.log('連線模式:', oracledb.thin ? 'Thin mode' : 'Thick mode')

  try {
    const conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      configDir: walletDir,
    })

    console.log('連線成功!')

    const result = await conn.execute('SELECT SYSDATE FROM DUAL')
    console.log('查詢結果:', result.rows)

    await conn.close()
  } catch (err) {
    console.error('連線失敗,完整錯誤:')
    console.error(err)
  }
}

main()
