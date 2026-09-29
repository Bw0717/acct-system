import type { VercelRequest, VercelResponse } from '@vercel/node'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

// 獲取員工列表用於下拉框
async function getEmployees() {
  try {
    const fields = 'emp_id,eng_name,ctw_name'
    const res = await fetch(`${ORDS_BASE}/employees/?fields=${fields}&limit=500`)
    
    if (!res.ok) {
      console.error('Employees API error:', res.status)
      return []
    }
    
    const data = await res.json()
    return data.items?.map((item: any) => ({
      label: item.eng_name || item.ctw_name || item.emp_id,
      value: item.emp_id
    })) || []
  } catch (err) {
    console.error('Error fetching employees:', err)
    return []
  }
}

// 獲取下拉框選項（options 端點）
async function handleOptions(req: VercelRequest, res: VercelResponse) {
  try {
    const employees = await getEmployees()
    const collectionMethods = [
      { label: '現金', value: '現金' },
      { label: '支票', value: '支票' },
      { label: '轉帳', value: '轉帳' },
      { label: '信用卡', value: '信用卡' }
    ]

    return res.status(200).json({
      success: true,
      data: {
        employees,
        collectionMethods
      }
    })
  } catch (error) {
    console.error('Options error:', error)
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

// GET /api/income - 列表查詢
async function handleList(req: VercelRequest, res: VercelResponse) {
  try {
    const { limit = '20', offset = '0' } = req.query

    const url = `${ORDS_BASE}/inc_income_main/?limit=${limit}&offset=${offset}&order_by=bill_date:desc`

    const listRes = await fetch(url)
    const data = await listRes.json()

    return res.status(200).json({
      success: true,
      data: data.items || [],
      pagination: {
        total: data.count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    })
  } catch (error) {
    console.error('List error:', error)
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
    console.log('Create payload:', body)

    // 驗證必填欄位
    if (!body.CUSTOMER_NAME || !body.BILL_DATE || body.QUOTE_AMOUNT === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: CUSTOMER_NAME, BILL_DATE, QUOTE_AMOUNT'
      })
    }

    // 準備 ORDS 請求體（轉換為小寫列名）
    const payload = {
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
      remark: body.REMARK || null
    }

    console.log('Sending to ORDS:', payload)

    const ordsRes = await fetch(`${ORDS_BASE}/inc_income_main/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await ordsRes.json()
    console.log('ORDS response:', data)

    if (!ordsRes.ok) {
      return res.status(ordsRes.status).json({
        success: false,
        error: data.message || `ORDS error: ${ordsRes.status}`
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
      error: `Failed to create income: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}

// PUT /api/income - 更新
async function handleUpdate(req: VercelRequest, res: VercelResponse) {
  try {
    const { incomeId } = req.query
    const body = req.body as any

    if (!incomeId) {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

    const payload = {
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
      remark: body.REMARK || null
    }

    const ordsRes = await fetch(`${ORDS_BASE}/inc_income_main/${incomeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await ordsRes.json()

    if (!ordsRes.ok) {
      return res.status(ordsRes.status).json({
        success: false,
        error: data.message || `ORDS error: ${ordsRes.status}`
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Income record updated successfully'
    })
  } catch (error) {
    console.error('Update error:', error)
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

    if (!incomeId) {
      return res.status(400).json({
        success: false,
        error: 'Income ID is required'
      })
    }

    const ordsRes = await fetch(`${ORDS_BASE}/inc_income_main/${incomeId}`, {
      method: 'DELETE'
    })

    if (!ordsRes.ok) {
      const data = await ordsRes.json()
      return res.status(ordsRes.status).json({
        success: false,
        error: data.message || `ORDS error: ${ordsRes.status}`
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
      error: `Failed to delete income: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}

// 主處理函數
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 處理 /api/income/options 端點
  if (req.url?.includes('/options')) {
    return handleOptions(req, res)
  }

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
    console.error('Handler error:', error)
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}
