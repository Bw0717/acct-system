import type { VercelRequest, VercelResponse } from '@vercel/node'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

interface IncomeRecord {
  sid?: string
  income_id?: string
  bill_date: string
  invoice_no?: string
  customer_name: string
  project?: string
  personnel?: string
  location?: string
  quote_amount: number
  actual_amount: number
  uncollected_amount: number
  collection_method?: string
  collection_status: 'Y' | 'N'
  cost_amount?: number
  estimated_profit?: number
  remark?: string
}

// 獲取員工列表
async function getEmployees() {
  const fields = 'emp_id,eng_name,ctw_name'
  try {
    const res = await fetch(`${ORDS_BASE}/employees/?fields=${fields}&limit=500`)
    const data = await res.json()
    return data.items?.map((item: any) => ({
      label: item.eng_name || item.ctw_name || item.emp_id,
      value: item.emp_id
    })) || []
  } catch (err) {
    console.error('Failed to get employees:', err)
    return []
  }
}

// 獲取選項
async function handleOptions(req: VercelRequest, res: VercelResponse) {
  try {
    const employees = await getEmployees()
    
    const collectionMethods = ['現金', '支票', '轉帳', '信用卡']

    return res.status(200).json({
      success: true,
      data: {
        employees,
        collectionMethods: collectionMethods.map(method => ({
          label: method,
          value: method
        }))
      }
    })
  } catch (error) {
    console.error('Options error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch options',
      data: {
        employees: [],
        collectionMethods: ['現金', '支票', '轉帳', '信用卡'].map(m => ({ label: m, value: m }))
      }
    })
  }
}

// 列表查詢
async function handleList(req: VercelRequest, res: VercelResponse) {
  try {
    const { limit = '20', offset = '0', customerName, billDateStart, billDateEnd, collectionStatus } = req.query

    let q = ''
    if (customerName || billDateStart || billDateEnd || collectionStatus) {
      const filters: any = {}
      if (customerName) filters.customer_name = { $like: `%${customerName}%` }
      if (billDateStart) filters.bill_date = { $gte: billDateStart }
      if (billDateEnd) filters.bill_date = { ...filters.bill_date, $lte: billDateEnd }
      if (collectionStatus) filters.collection_status = collectionStatus
      q = encodeURIComponent(JSON.stringify(filters))
    }

    const url = q 
      ? `${ORDS_BASE}/inc_income_main/?q=${q}&limit=${limit}&offset=${offset}`
      : `${ORDS_BASE}/inc_income_main/?limit=${limit}&offset=${offset}`

    const listRes = await fetch(url)
    const data = await listRes.json()

    return res.status(200).json({
      success: true,
      data: data.items ?? [],
      pagination: {
        total: data.count ?? 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    })
  } catch (error) {
    console.error('List error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch incomes'
    })
  }
}

// 新增
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  try {
    const body: IncomeRecord = req.body

    // 驗證必填欄位
    if (!body.customer_name || !body.bill_date || body.quote_amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }

    const ordsRes = await fetch(`${ORDS_BASE}/income_create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bill_date: body.bill_date,
        invoice_no: body.invoice_no || null,
        customer_name: body.customer_name,
        project: body.project || null,
        personnel: body.personnel || null,
        location: body.location || null,
        quote_amount: body.quote_amount,
        actual_amount: body.actual_amount || body.quote_amount,
        uncollected_amount: body.uncollected_amount || 0,
        collection_method: body.collection_method || null,
        collection_status: body.collection_status || 'N',
        cost_amount: body.cost_amount || null,
        estimated_profit: body.estimated_profit || null,
        remark: body.remark || null
      })
    })

    const data = await ordsRes.json()
    if (!ordsRes.ok) {
      return res.status(ordsRes.status).json({
        success: false,
        error: data.message || 'Failed to create income record'
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Income record created successfully',
      incomeId: data.income_id || data.sid
    })
  } catch (error) {
    console.error('Create error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// 更新
async function handleUpdate(req: VercelRequest, res: VercelResponse) {
  try {
    const { incomeId } = req.query
    const body: IncomeRecord = req.body

    if (!incomeId) {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

    const ordsRes = await fetch(`${ORDS_BASE}/income_update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        income_id: incomeId,
        bill_date: body.bill_date,
        invoice_no: body.invoice_no || null,
        customer_name: body.customer_name,
        project: body.project || null,
        personnel: body.personnel || null,
        location: body.location || null,
        quote_amount: body.quote_amount,
        actual_amount: body.actual_amount,
        uncollected_amount: body.uncollected_amount,
        collection_method: body.collection_method || null,
        collection_status: body.collection_status || 'N',
        cost_amount: body.cost_amount || null,
        estimated_profit: body.estimated_profit || null,
        remark: body.remark || null
      })
    })

    const data = await ordsRes.json()
    if (!ordsRes.ok) {
      return res.status(ordsRes.status).json({
        success: false,
        error: data.message || 'Failed to update income record'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Income record updated successfully',
      incomeId
    })
  } catch (error) {
    console.error('Update error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// 刪除
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  try {
    const { incomeId } = req.query

    if (!incomeId) {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

    const ordsRes = await fetch(`${ORDS_BASE}/income_delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ income_id: incomeId })
    })

    const data = await ordsRes.json()
    if (!ordsRes.ok) {
      return res.status(ordsRes.status).json({
        success: false,
        error: data.message || 'Failed to delete income record'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Income record deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 處理 options 端點（無需認證）
  if (req.url?.includes('/options')) {
    return handleOptions(req, res)
  }

  try {
    if (req.method === 'GET') {
      return handleList(req, res)
    } else if (req.method === 'POST') {
      return handleCreate(req, res)
    } else if (req.method === 'PUT') {
      return handleUpdate(req, res)
    } else if (req.method === 'DELETE') {
      return handleDelete(req, res)
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Income handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
