import { VercelRequest, VercelResponse } from '@vercel/node'
import { getEmployeesFromDB, getCollectionMethods } from './employees'

/**
 * GET /api/income/options
 * 獲取下拉框選項（員工、收款方式等）
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // 獲取員工列表
    const employees = await getEmployeesFromDB()
    
    // 獲取收款方式
    const collectionMethods = await getCollectionMethods()

    return res.status(200).json({
      success: true,
      data: {
        employees: employees.map(emp => ({
          label: emp.ENG_NAME || emp.CTW_NAME || emp.PERSONNEL,
          value: emp.PERSONNEL
        })),
        collectionMethods: collectionMethods.map(method => ({
          label: method,
          value: method
        }))
      }
    })
  } catch (error) {
    console.error('Options endpoint error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch options',
      data: {
        employees: [],
        collectionMethods: ['現金', '支票', '轉帳', '信用卡']
      }
    })
  }
}
