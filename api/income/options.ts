import type { VercelRequest, VercelResponse } from '@vercel/node'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

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

// GET /api/income/options
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[OPTIONS] Request received')
  
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
