import { VercelRequest, VercelResponse } from '@vercel/node'
import { authMiddleware } from '../_lib/auth-middleware'
import {
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeById,
  listIncomes,
  getIncomeHistory,
  IncomeRecord,
} from './db'

export default async (req: VercelRequest, res: VercelResponse) => {
  // 執行認證中間件
  const authResult = await authMiddleware(req, res)
  if (!authResult.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { user } = authResult

  try {
    if (req.method === 'GET') {
      return handleGet(req, res)
    } else if (req.method === 'POST') {
      return handlePost(req, res, user.ACCOUNT)
    } else if (req.method === 'PUT') {
      return handlePut(req, res, user.ACCOUNT)
    } else if (req.method === 'DELETE') {
      return handleDelete(req, res, user.ACCOUNT)
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Income route error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * GET /api/income
 * - 無參數：列表分頁
 * - ?incomeId=xxx：單筆記錄
 * - ?incomeId=xxx&history=true：歷史紀錄
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { incomeId, history, limit = '20', offset = '0', customerName, billDateStart, billDateEnd, collectionStatus } = req.query

  try {
    // 查詢歷史紀錄
    if (history === 'true' && incomeId) {
      const historyData = await getIncomeHistory(incomeId as string)
      return res.status(200).json({
        success: true,
        data: historyData,
      })
    }

    // 查詢單筆記錄
    if (incomeId) {
      const data = await getIncomeById(incomeId as string)
      if (!data) {
        return res.status(404).json({ success: false, error: 'Income record not found' })
      }
      return res.status(200).json({ success: true, data })
    }

    // 查詢列表（分頁）
    const filters: any = {}
    if (customerName) filters.customerName = customerName as string
    if (billDateStart) filters.billDateStart = new Date(billDateStart as string)
    if (billDateEnd) filters.billDateEnd = new Date(billDateEnd as string)
    if (collectionStatus) filters.collectionStatus = collectionStatus as 'Y' | 'N'

    const { data, total } = await listIncomes(
      parseInt(limit as string),
      parseInt(offset as string),
      filters
    )

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    })
  } catch (error) {
    console.error('GET income error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch income records' })
  }
}

/**
 * POST /api/income
 * 新增收入記帳
 */
async function handlePost(req: VercelRequest, res: VercelResponse, currentUser: string) {
  try {
    const body = req.body as IncomeRecord

    // 驗證必填欄位
    if (!body.CUSTOMER_NAME || !body.BILL_DATE || body.QUOTE_AMOUNT === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: CUSTOMER_NAME, BILL_DATE, QUOTE_AMOUNT',
      })
    }

    // 確保金額欄位是數字
    body.QUOTE_AMOUNT = Number(body.QUOTE_AMOUNT)
    body.ACTUAL_AMOUNT = Number(body.ACTUAL_AMOUNT) || body.QUOTE_AMOUNT
    body.UNCOLLECTED_AMOUNT = Number(body.UNCOLLECTED_AMOUNT) || 0
    body.COST_AMOUNT = body.COST_AMOUNT ? Number(body.COST_AMOUNT) : null
    body.ESTIMATED_PROFIT = body.ESTIMATED_PROFIT ? Number(body.ESTIMATED_PROFIT) : null
    body.COLLECTION_STATUS = body.COLLECTION_STATUS || 'N'

    const incomeId = await createIncome(body, currentUser)

    return res.status(201).json({
      success: true,
      message: 'Income record created successfully',
      incomeId,
    })
  } catch (error) {
    console.error('POST income error:', error)
    return res.status(500).json({ success: false, error: 'Failed to create income record' })
  }
}

/**
 * PUT /api/income?incomeId=xxx
 * 更新收入記帳
 */
async function handlePut(req: VercelRequest, res: VercelResponse, currentUser: string) {
  try {
    const { incomeId } = req.query
    const body = req.body as IncomeRecord

    if (!incomeId) {
      return res.status(400).json({ success: false, error: 'Income ID is required' })
    }

    // 驗證記錄是否存在
    const existing = await getIncomeById(incomeId as string)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Income record not found' })
    }

    // 確保金額欄位是數字
    body.QUOTE_AMOUNT = Number(body.QUOTE_AMOUNT)
    body.ACTUAL_AMOUNT = Number(body.ACTUAL_AMOUNT) || existing.ACTUAL_AMOUNT
    body.UNCOLLECTED_AMOUNT = Number(body.UNCOLLECTED_AMOUNT) || existing.UNCOLLECTED_AMOUNT
    body.COST_AMOUNT = body.COST_AMOUNT ? Number(body.COST_AMOUNT) : existing.COST_AMOUNT
    body.ESTIMATED_PROFIT = body.ESTIMATED_PROFIT ? Number(body.ESTIMATED_PROFIT) : existing.ESTIMATED_PROFIT
    body.COLLECTION_STATUS = body.COLLECTION_STATUS || 'N'

    await updateIncome(incomeId as string, body, currentUser)

    return res.status(200).json({
      success: true,
      message: 'Income record updated successfully',
      incomeId,
    })
  } catch (error) {
    console.error('PUT income error:', error)
    return res.status(500).json({ success: false, error: 'Failed to update income record' })
  }
}

/**
 * DELETE /api/income?incomeId=xxx
 * 刪除收入記帳
 */
async function handleDelete(req: VercelRequest, res: VercelResponse, currentUser: string) {
  try {
    const { incomeId } = req.query

    if (!incomeId) {
      return res.status(400).json({ success: false, error: 'Income ID is required' })
    }

    // 驗證記錄是否存在
    const existing = await getIncomeById(incomeId as string)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Income record not found' })
    }

    await deleteIncome(incomeId as string, currentUser)

    return res.status(200).json({
      success: true,
      message: 'Income record deleted successfully',
    })
  } catch (error) {
    console.error('DELETE income error:', error)
    return res.status(500).json({ success: false, error: 'Failed to delete income record' })
  }
}
