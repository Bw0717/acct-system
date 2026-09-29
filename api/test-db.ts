import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getConnection } from './_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let conn
  try {
    console.log('[TEST-DB] 開始測試數據庫連接...')
    
    conn = await getConnection()
    console.log('[TEST-DB] ✅ 連接成功')

    // 查詢 ADMIN 下的 INC_INCOME_MAIN
    const result = await conn.execute(
      `SELECT * FROM ADMIN.INC_INCOME_MAIN WHERE ROWNUM <= 5`,
      [],
      { outFormat: 3 }
    )

    console.log('[TEST-DB] ✅ 查詢成功')
    console.log('[TEST-DB] 返回行數:', result.rows?.length || 0)

    return res.status(200).json({
      success: true,
      message: 'Database connection and query successful',
      rowCount: result.rows?.length || 0,
      sampleRow: result.rows?.[0] || null
    })
  } catch (error) {
    console.error('[TEST-DB] ❌ 錯誤:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : null
    })
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (e) {
        console.error('[TEST-DB] 關閉連接失敗:', e)
      }
    }
  }
}
