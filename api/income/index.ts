import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getConnection } from '../_lib/db'

// 生成 ID (YYYYMMDDNNNN 格式)
function generateIncomeId(): string {
  const now = new Date()
  const date = now.toISOString().split('T')[0].replace(/-/g, '')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${date}${rand}`
}

// GET /api/income - 列表查詢
async function handleList(req: VercelRequest, res: VercelResponse) {
  let conn
  try {
    const { limit = '20', offset = '0' } = req.query
    const limitNum = parseInt(limit as string)
    const offsetNum = parseInt(offset as string)

    console.log(`[LIST] Fetching incomes: limit=${limitNum}, offset=${offsetNum}`)

    conn = await getConnection()
    
    // 查詢總數
    const countResult = await conn.execute(
      'SELECT COUNT(*) as total FROM ACCTDB.INC_INCOME_MAIN',
      [],
      { outFormat: 3 }
    )
    const total = (countResult.rows as any[])?.[0]?.TOTAL || 0

    // 查詢數據
    const result = await conn.execute(
      `SELECT * FROM ACCTDB.INC_INCOME_MAIN 
       ORDER BY BILL_DATE DESC 
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset: offsetNum, limit: limitNum },
      { outFormat: 3 }
    )

    const data = result.rows || []
    console.log(`[LIST] Returning ${data.length} items (total: ${total})`)

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum
      }
    })
  } catch (error) {
    console.error('[LIST] Error:', error)
    return res.status(500).json({
      success: false,
      error: `Failed to fetch incomes: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (e) {
        console.error('[LIST] Close connection error:', e)
      }
    }
  }
}

// POST /api/income - 新增
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  let conn
  try {
    const body = req.body as any
    console.log('[CREATE] Received:', { customer: body.CUSTOMER_NAME, date: body.BILL_DATE })

    // 驗證必填欄位
    if (!body.CUSTOMER_NAME || !body.BILL_DATE || body.QUOTE_AMOUNT === undefined) {
      console.log('[CREATE] Validation failed: missing required fields')
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: CUSTOMER_NAME, BILL_DATE, QUOTE_AMOUNT'
      })
    }

    const incomeId = generateIncomeId()
    const now = new Date().toISOString()

    conn = await getConnection()

    const result = await conn.execute(
      `INSERT INTO ACCTDB.INC_INCOME_MAIN (
        INCOME_ID, BILL_DATE, INVOICE_NO, CUSTOMER_NAME, PROJECT, PERSONNEL,
        LOCATION, QUOTE_AMOUNT, ACTUAL_AMOUNT, UNCOLLECTED_AMOUNT,
        COLLECTION_METHOD, COLLECTION_STATUS, COST_AMOUNT, ESTIMATED_PROFIT,
        REMARK, CREATED_TIME, MODIFIED_TIME, CREATED_USER
      ) VALUES (
        :income_id, :bill_date, :invoice_no, :customer_name, :project, :personnel,
        :location, :quote_amount, :actual_amount, :uncollected_amount,
        :collection_method, :collection_status, :cost_amount, :estimated_profit,
        :remark, :created_time, :modified_time, :created_user
      )`,
      {
        income_id: incomeId,
        bill_date: body.BILL_DATE,
        invoice_no: body.INVOICE_NO || null,
        customer_name: body.CUSTOMER_NAME,
        project: body.PROJECT || null,
        personnel: body.PERSONNEL || null,
        location: body.LOCATION || null,
        quote_amount: Number(body.QUOTE_AMOUNT),
        actual_amount: Number(body.ACTUAL_AMOUNT) || 0,
        uncollected_amount: Number(body.UNCOLLECTED_AMOUNT) || 0,
        collection_method: body.COLLECTION_METHOD || null,
        collection_status: body.COLLECTION_STATUS || 'N',
        cost_amount: body.COST_AMOUNT || null,
        estimated_profit: body.ESTIMATED_PROFIT || null,
        remark: body.REMARK || null,
        created_time: now,
        modified_time: now,
        created_user: 'API'
      },
      { autoCommit: true }
    )

    console.log(`[CREATE] Success: created ${incomeId}`)

    return res.status(201).json({
      success: true,
      message: 'Income record created successfully',
      incomeId
    })
  } catch (error) {
    console.error('[CREATE] Error:', error)
    return res.status(500).json({
      success: false,
      error: `Failed to create income: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (e) {
        console.error('[CREATE] Close connection error:', e)
      }
    }
  }
}

// PUT /api/income - 更新
async function handleUpdate(req: VercelRequest, res: VercelResponse) {
  let conn
  try {
    const { incomeId } = req.query
    const body = req.body as any

    console.log(`[UPDATE] Updating ${incomeId}`)

    if (!incomeId || typeof incomeId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

    const now = new Date().toISOString()

    conn = await getConnection()

    // 檢查記錄是否存在
    const checkResult = await conn.execute(
      'SELECT INCOME_ID FROM ACCTDB.INC_INCOME_MAIN WHERE INCOME_ID = :income_id',
      { income_id: incomeId }
    )

    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Income record not found'
      })
    }

    // 更新記錄
    await conn.execute(
      `UPDATE ACCTDB.INC_INCOME_MAIN SET
        BILL_DATE = :bill_date,
        INVOICE_NO = :invoice_no,
        CUSTOMER_NAME = :customer_name,
        PROJECT = :project,
        PERSONNEL = :personnel,
        LOCATION = :location,
        QUOTE_AMOUNT = :quote_amount,
        ACTUAL_AMOUNT = :actual_amount,
        UNCOLLECTED_AMOUNT = :uncollected_amount,
        COLLECTION_METHOD = :collection_method,
        COLLECTION_STATUS = :collection_status,
        COST_AMOUNT = :cost_amount,
        ESTIMATED_PROFIT = :estimated_profit,
        REMARK = :remark,
        MODIFIED_TIME = :modified_time,
        MODIFIED_USER = :modified_user
      WHERE INCOME_ID = :income_id`,
      {
        income_id: incomeId,
        bill_date: body.BILL_DATE,
        invoice_no: body.INVOICE_NO || null,
        customer_name: body.CUSTOMER_NAME,
        project: body.PROJECT || null,
        personnel: body.PERSONNEL || null,
        location: body.LOCATION || null,
        quote_amount: Number(body.QUOTE_AMOUNT),
        actual_amount: Number(body.ACTUAL_AMOUNT) || 0,
        uncollected_amount: Number(body.UNCOLLECTED_AMOUNT) || 0,
        collection_method: body.COLLECTION_METHOD || null,
        collection_status: body.COLLECTION_STATUS || 'N',
        cost_amount: body.COST_AMOUNT || null,
        estimated_profit: body.ESTIMATED_PROFIT || null,
        remark: body.REMARK || null,
        modified_time: now,
        modified_user: 'API'
      },
      { autoCommit: true }
    )

    console.log(`[UPDATE] Success: updated ${incomeId}`)

    return res.status(200).json({
      success: true,
      message: 'Income record updated successfully',
      incomeId
    })
  } catch (error) {
    console.error('[UPDATE] Error:', error)
    return res.status(500).json({
      success: false,
      error: `Failed to update income: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (e) {
        console.error('[UPDATE] Close connection error:', e)
      }
    }
  }
}

// DELETE /api/income - 刪除
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  let conn
  try {
    const { incomeId } = req.query

    console.log(`[DELETE] Deleting ${incomeId}`)

    if (!incomeId || typeof incomeId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

    conn = await getConnection()

    // 檢查記錄是否存在
    const checkResult = await conn.execute(
      'SELECT INCOME_ID FROM ACCTDB.INC_INCOME_MAIN WHERE INCOME_ID = :income_id',
      { income_id: incomeId }
    )

    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Income record not found'
      })
    }

    // 刪除記錄
    await conn.execute(
      'DELETE FROM ACCTDB.INC_INCOME_MAIN WHERE INCOME_ID = :income_id',
      { income_id: incomeId },
      { autoCommit: true }
    )

    console.log(`[DELETE] Success: deleted ${incomeId}`)

    return res.status(200).json({
      success: true,
      message: 'Income record deleted successfully'
    })
  } catch (error) {
    console.error('[DELETE] Error:', error)
    return res.status(500).json({
      success: false,
      error: `Failed to delete income: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (e) {
        console.error('[DELETE] Close connection error:', e)
      }
    }
  }
}

// 主處理函數
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[${req.method}] ${req.url}`)

  try {
    const method = req.method || 'GET'

    if (method === 'GET') {
      return handleList(req, res)
    } else if (method === 'POST') {
      return handleCreate(req, res)
    } else if (method === 'PUT') {
      return handleUpdate(req, res)
    } else if (method === 'DELETE') {
      return handleDelete(req, res)
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      })
    }
  } catch (error) {
    console.error('[HANDLER] Error:', error)
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}
