import { VercelRequest, VercelResponse } from '@vercel/node'
import incomeRoutes from './routes'

/**
 * 收入記帳 API 主入口
 * 路由：/api/income
 * 
 * 支持方法：
 * - GET: 查詢列表或單筆記錄
 * - POST: 新增記帳
 * - PUT: 更新記帳
 * - DELETE: 刪除記帳
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  return incomeRoutes(req, res)
}
