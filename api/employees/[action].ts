import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

interface GroupRowLike { sid: string }

async function handleList(req: VercelRequest, res: VercelResponse) {
  const fields = 'sid,emp_id,account,ctw_name,eng_name,tel_no,tel_ex,email,isenable'
  const listRes = await fetch(`${ORDS_BASE}/employees/?fields=${fields}&limit=500`)
  const data = await listRes.json()
  return res.status(200).json({ items: data.items ?? [] })
}

async function handleActiveAccounts(req: VercelRequest, res: VercelResponse) {
  const q = encodeURIComponent(JSON.stringify({ isenable: 'Y' }))
  const fields = 'account,ctw_name'
  const listRes = await fetch(`${ORDS_BASE}/employees/?q=${q}&fields=${fields}&limit=500`)
  const data = await listRes.json()
  return res.status(200).json({ items: data.items ?? [] })
}

async function handleCheckUnique(req: VercelRequest, res: VercelResponse) {
  const { empId, account, excludeSid } = req.body ?? {}

  async function isTaken(field: string, value: string): Promise<boolean> {
    if (!value) return false
    const q = encodeURIComponent(JSON.stringify({ [field]: value }))
    const r = await fetch(`${ORDS_BASE}/employees/?q=${q}&fields=sid`)
    const data = await r.json()
    const items: GroupRowLike[] = data.items ?? []
    return items.some((item) => item.sid !== excludeSid)
  }

  const [empIdTaken, accountTaken] = await Promise.all([
    isTaken('emp_id', empId),
    isTaken('account', account),
  ])

  return res.status(200).json({ empIdTaken, accountTaken })
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const { empId, account, password, ctwName, engName, telNo, telEx, email, isenable, operator } = req.body ?? {}
  if (!empId || !account || !password) return res.status(400).json({ message: '工號、帳號、密碼為必填' })

  const pwHash = await bcrypt.hash(password, 10)

  const ordsRes = await fetch(`${ORDS_BASE}/emp/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emp_id: empId, account, pw: pwHash,
      ctw_name: ctwName || null, eng_name: engName || null,
      tel_no: telNo || null, tel_ex: telEx || null, email: email || null,
      isenable: isenable || 'Y', operator,
    }),
  })
  const data = await ordsRes.json()
  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '新增失敗' })
  return res.status(200).json(data)
}

async function handleUpdate(req: VercelRequest, res: VercelResponse) {
  const { sid, empId, account, ctwName, engName, telNo, telEx, email, isenable, operator } = req.body ?? {}
  if (!sid || !empId || !account) return res.status(400).json({ message: '缺少必要欄位' })

  const ordsRes = await fetch(`${ORDS_BASE}/emp/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sid, emp_id: empId, account,
      ctw_name: ctwName || null, eng_name: engName || null,
      tel_no: telNo || null, tel_ex: telEx || null, email: email || null,
      isenable: isenable || 'Y', operator,
    }),
  })
  const data = await ordsRes.json()
  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '更新失敗' })
  return res.status(200).json(data)
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { sid, operator } = req.body ?? {}
  if (!sid) return res.status(400).json({ message: '缺少 sid' })

  const ordsRes = await fetch(`${ORDS_BASE}/emp/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sid, operator }),
  })
  const data = await ordsRes.json()
  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '刪除失敗' })
  return res.status(200).json(data)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string

  try {
    if (req.method === 'GET') {
      if (action === 'list') return await handleList(req, res)
      if (action === 'active-accounts') return await handleActiveAccounts(req, res)
      return res.status(404).json({ message: '找不到這個動作' })
    }

    if (req.method === 'POST') {
      switch (action) {
        case 'check-unique': return await handleCheckUnique(req, res)
        case 'create': return await handleCreate(req, res)
        case 'update': return await handleUpdate(req, res)
        case 'delete': return await handleDelete(req, res)
        default: return res.status(404).json({ message: '找不到這個動作' })
      }
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error(`Employees action "${action}" error:`, err)
    return res.status(500).json({ message: '伺服器發生錯誤,請稍後再試' })
  }
}
