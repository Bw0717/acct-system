import type { VercelRequest, VercelResponse } from '@vercel/node'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

// 簡單的內存存儲
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

let incomeDatabase: Map<string, IncomeRecord> = new Map()

function generateIncomeId(): string {
  const now = new Date()
  const date = now.toISOString().split('T')[0].replace(/-/g, '')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${date}${rand}`
}

// 獲取員工列表
async function getEmployees() {
  try {
    const fields = 'emp_id,eng_name,ctw_name'
    const res = await fetch(`${ORDS_BASE}/employees/?fields=${fields}&limit=500`)
    
    if (!res.ok) {
      console.error('[getEmployees] API error:', res.status)
      return []
    }
    
    const data = await res.json()
    const employees = data.items?.map((item: any) => ({
      label: item.eng_name || item.ctw_name || item.emp_id,
      value: item.emp_id
    })) || []
    
    console.log(`[getEmployees] Success: ${employees.length} employees`)
    return employees
  } catch (err) {
    console.error('[getEmployees] Error:', err)
    return []
  }
}

// 獲取 Options（下拉框數據）
async function handleOptions(req: VercelRequest, res: VercelResponse) {
  try {
    const employees = await getEmployees()
    
    const collectionMethods = [
      { label: '現金', value: '現金' },
      { label: '支票', value: '支票' },
      { label: '轉帳', value: '轉帳' },
      { label: '信用卡', value: '信用卡' }
    ]

    console.log(`[OPTIONS] Returning: ${employees.length} employees, ${collectionMethods.length} methods`)
    
    return res.status(200).json({
      success: true,
      data: {
        employees,
        collectionMethods
      }
    })
  } catch (error) {
    console.error('[OPTIONS] Error:', error)
    return res.status(200).json({
      success: true,
      data: {
        employees: [],
        collectionMethods: [
          { label: '現金', value: '現金' },
          { label: '支票', value: '支票' },
          { label: '轉帳', value: '轉帳' },
          { label: '信用卡', value: '信用卡' }
        ]
      }
    })
  }
}

// GET /api/income
async function handleList(req: VercelRequest, res: VercelResponse) {
  try {
    const { limit = '20', offset = '0' } = req.query
    const limitNum = parseInt(limit as string)
    const offsetNum = parseInt(offset as string)

    const allIncomes = Array.from(incomeDatabase.values())
      .sort((a, b) => new Date(b.BILL_DATE).getTime() - new Date(a.BILL_DATE).getTime())
    
    const items = allIncomes.slice(offsetNum, offsetNum + limitNum)

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

// POST /api/income
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  try {
    const body = req.body as any

    if (!body.CUSTOMER_NAME || !body.BILL_DATE || body.QUOTE_AMOUNT === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: CUSTOMER_NAME, BILL_DATE, QUOTE_AMOUNT'
      })
    }

    const incomeId = generateIncomeId()
    const now = new Date().toISOString()

    const record: IncomeRecord = {
      INCOME_ID: incomeId,
      BILL_DATE: body.BILL_DATE,
      INVOICE_NO: body.INVOICE_NO,
      CUSTOMER_NAME: body.CUSTOMER_NAME,
      PROJECT: body.PROJECT,
      PERSONNEL: body.PERSONNEL,
      LOCATION: body.LOCATION,
      QUOTE_AMOUNT: Number(body.QUOTE_AMOUNT),
      ACTUAL_AMOUNT: Number(body.ACTUAL_AMOUNT) || 0,
      UNCOLLECTED_AMOUNT: Number(body.UNCOLLECTED_AMOUNT) || 0,
      COLLECTION_METHOD: body.COLLECTION_METHOD,
      COLLECTION_STATUS: body.COLLECTION_STATUS || 'N',
      COST_AMOUNT: body.COST_AMOUNT,
      ESTIMATED_PROFIT: body.ESTIMATED_PROFIT,
      REMARK: body.REMARK,
      CREATED_TIME: now,
      MODIFIED_TIME: now
    }

    incomeDatabase.set(incomeId, record)

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

// PUT /api/income
async function handleUpdate(req: VercelRequest, res: VercelResponse) {
  try {
    const { incomeId } = req.query
    const body = req.body as any

    if (!incomeId || typeof incomeId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

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
      INVOICE_NO: body.INVOICE_NO !== undefined ? body.INVOICE_NO : existing.INVOICE_NO,
      CUSTOMER_NAME: body.CUSTOMER_NAME || existing.CUSTOMER_NAME,
      PROJECT: body.PROJECT !== undefined ? body.PROJECT : existing.PROJECT,
      PERSONNEL: body.PERSONNEL !== undefined ? body.PERSONNEL : existing.PERSONNEL,
      LOCATION: body.LOCATION !== undefined ? body.LOCATION : existing.LOCATION,
      QUOTE_AMOUNT: Number(body.QUOTE_AMOUNT) || existing.QUOTE_AMOUNT,
      ACTUAL_AMOUNT: Number(body.ACTUAL_AMOUNT) || existing.ACTUAL_AMOUNT,
      UNCOLLECTED_AMOUNT: Number(body.UNCOLLECTED_AMOUNT) || existing.UNCOLLECTED_AMOUNT,
      COLLECTION_METHOD: body.COLLECTION_METHOD !== undefined ? body.COLLECTION_METHOD : existing.COLLECTION_METHOD,
      COLLECTION_STATUS: body.COLLECTION_STATUS || existing.COLLECTION_STATUS,
      COST_AMOUNT: body.COST_AMOUNT !== undefined ? body.COST_AMOUNT : existing.COST_AMOUNT,
      ESTIMATED_PROFIT: body.ESTIMATED_PROFIT !== undefined ? body.ESTIMATED_PROFIT : existing.ESTIMATED_PROFIT,
      REMARK: body.REMARK !== undefined ? body.REMARK : existing.REMARK,
      MODIFIED_TIME: now
    }

    incomeDatabase.set(incomeId, updated)

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

// DELETE /api/income
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  try {
    const { incomeId } = req.query

    if (!incomeId || typeof incomeId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

    if (!incomeDatabase.has(incomeId)) {
      return res.status(404).json({
        success: false,
        error: 'Income record not found'
      })
    }

    incomeDatabase.delete(incomeId)

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 處理 /api/income/options 端點
    if (req.url?.includes('/options')) {
      return handleOptions(req, res)
    }

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
