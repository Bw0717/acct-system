import type { VercelRequest, VercelResponse } from '@vercel/node'

// 簡單的內存存儲（由於 ORDS 還未配置 INC_INCOME_MAIN，暫時使用）
interface IncomeRecord {
  INCOME_ID: string
  BILL_DATE: string
  INVOICE_NO?: string
  CUSTOMER_NAME: string
  PROJECT?: string
  PERSONNEL?: string
  LOCATION?: string
  QUOTE_AMOUNT: number
  ACTUAL_AMOUNT: number
  UNCOLLECTED_AMOUNT: number
  COLLECTION_METHOD?: string
  COLLECTION_STATUS: 'Y' | 'N'
  COST_AMOUNT?: number
  ESTIMATED_PROFIT?: number
  REMARK?: string
  CREATED_TIME?: string
  MODIFIED_TIME?: string
}

// 使用內存存儲（演示用，稍後切換到真實數據庫）
let incomeDatabase: Map<string, IncomeRecord> = new Map()

// 初始化一些示例數據以進行測試
function initSampleData() {
  if (incomeDatabase.size === 0) {
    incomeDatabase.set('20260101001', {
      INCOME_ID: '20260101001',
      BILL_DATE: '2026-01-15',
      INVOICE_NO: 'INV-001',
      CUSTOMER_NAME: '示例客戶1',
      PROJECT: '示例項目1',
      PERSONNEL: 'TEST002',
      LOCATION: '台北',
      QUOTE_AMOUNT: 100000,
      ACTUAL_AMOUNT: 100000,
      UNCOLLECTED_AMOUNT: 0,
      COLLECTION_METHOD: '現金',
      COLLECTION_STATUS: 'Y',
      COST_AMOUNT: 30000,
      ESTIMATED_PROFIT: 70000,
      REMARK: '示例記帳',
      CREATED_TIME: '2026-01-15T10:00:00Z',
      MODIFIED_TIME: '2026-01-15T10:00:00Z'
    })
  }
}

// 生成 ID (YYYYMMDDNNNN 格式)
function generateIncomeId(): string {
  const now = new Date()
  const date = now.toISOString().split('T')[0].replace(/-/g, '')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${date}${rand}`
}

// GET /api/income - 列表查詢
async function handleList(req: VercelRequest, res: VercelResponse) {
  try {
    const { limit = '20', offset = '0' } = req.query
    const limitNum = parseInt(limit as string)
    const offsetNum = parseInt(offset as string)

    console.log(`[LIST] Fetching incomes: limit=${limitNum}, offset=${offsetNum}`)

    initSampleData()
    
    const allIncomes = Array.from(incomeDatabase.values())
      .sort((a, b) => new Date(b.BILL_DATE).getTime() - new Date(a.BILL_DATE).getTime())
    
    const items = allIncomes.slice(offsetNum, offsetNum + limitNum)

    console.log(`[LIST] Returning ${items.length} items (total: ${allIncomes.length})`)

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total: allIncomes.length,
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
  }
}

// POST /api/income - 新增
async function handleCreate(req: VercelRequest, res: VercelResponse) {
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

    initSampleData()

    const incomeId = generateIncomeId()
    const now = new Date().toISOString()

    const record: IncomeRecord = {
      INCOME_ID: incomeId,
      BILL_DATE: body.BILL_DATE,
      INVOICE_NO: body.INVOICE_NO || undefined,
      CUSTOMER_NAME: body.CUSTOMER_NAME,
      PROJECT: body.PROJECT || undefined,
      PERSONNEL: body.PERSONNEL || undefined,
      LOCATION: body.LOCATION || undefined,
      QUOTE_AMOUNT: Number(body.QUOTE_AMOUNT),
      ACTUAL_AMOUNT: Number(body.ACTUAL_AMOUNT) || 0,
      UNCOLLECTED_AMOUNT: Number(body.UNCOLLECTED_AMOUNT) || 0,
      COLLECTION_METHOD: body.COLLECTION_METHOD || undefined,
      COLLECTION_STATUS: body.COLLECTION_STATUS || 'N',
      COST_AMOUNT: body.COST_AMOUNT || undefined,
      ESTIMATED_PROFIT: body.ESTIMATED_PROFIT || undefined,
      REMARK: body.REMARK || undefined,
      CREATED_TIME: now,
      MODIFIED_TIME: now
    }

    incomeDatabase.set(incomeId, record)
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
  }
}

// PUT /api/income - 更新
async function handleUpdate(req: VercelRequest, res: VercelResponse) {
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

    initSampleData()

    if (!incomeDatabase.has(incomeId)) {
      return res.status(404).json({
        success: false,
        error: 'Income record not found'
      })
    }

    const existing = incomeDatabase.get(incomeId)!
    const now = new Date().toISOString()

    const updated: IncomeRecord = {
      ...existing,
      BILL_DATE: body.BILL_DATE || existing.BILL_DATE,
      INVOICE_NO: body.INVOICE_NO || existing.INVOICE_NO,
      CUSTOMER_NAME: body.CUSTOMER_NAME || existing.CUSTOMER_NAME,
      PROJECT: body.PROJECT || existing.PROJECT,
      PERSONNEL: body.PERSONNEL || existing.PERSONNEL,
      LOCATION: body.LOCATION || existing.LOCATION,
      QUOTE_AMOUNT: Number(body.QUOTE_AMOUNT) || existing.QUOTE_AMOUNT,
      ACTUAL_AMOUNT: Number(body.ACTUAL_AMOUNT) || existing.ACTUAL_AMOUNT,
      UNCOLLECTED_AMOUNT: Number(body.UNCOLLECTED_AMOUNT) || existing.UNCOLLECTED_AMOUNT,
      COLLECTION_METHOD: body.COLLECTION_METHOD || existing.COLLECTION_METHOD,
      COLLECTION_STATUS: body.COLLECTION_STATUS || existing.COLLECTION_STATUS,
      COST_AMOUNT: Number(body.COST_AMOUNT) || existing.COST_AMOUNT,
      ESTIMATED_PROFIT: Number(body.ESTIMATED_PROFIT) || existing.ESTIMATED_PROFIT,
      REMARK: body.REMARK || existing.REMARK,
      MODIFIED_TIME: now
    }

    incomeDatabase.set(incomeId, updated)
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
  }
}

// DELETE /api/income - 刪除
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  try {
    const { incomeId } = req.query

    console.log(`[DELETE] Deleting ${incomeId}`)

    if (!incomeId || typeof incomeId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

    initSampleData()

    if (!incomeDatabase.has(incomeId)) {
      return res.status(404).json({
        success: false,
        error: 'Income record not found'
      })
    }

    incomeDatabase.delete(incomeId)
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
