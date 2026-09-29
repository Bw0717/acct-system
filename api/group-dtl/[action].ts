import type { VercelRequest, VercelResponse } from '@vercel/node'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

interface DtlRow { account: string }

async function handleList(req: VercelRequest, res: VercelResponse) {
  const groupId = req.query.groupId as string
  if (!groupId) return res.status(400).json({ message: '缺少 groupId' })

  const q = encodeURIComponent(JSON.stringify({ group_id: groupId }))
  const listRes = await fetch(`${ORDS_BASE}/group_dtl/?q=${q}&limit=500`)
  const data = await listRes.json()
  return res.status(200).json({ items: data.items ?? [] })
}

async function handleAdd(req: VercelRequest, res: VercelResponse) {
  const { groupId, account, operator } = req.body ?? {}
  if (!groupId || !account) return res.status(400).json({ message: '缺少必要欄位' })

  const q = encodeURIComponent(JSON.stringify({ group_id: groupId, account }))
  const checkRes = await fetch(`${ORDS_BASE}/group_dtl/?q=${q}&fields=account`)
  const checkData = await checkRes.json()
  const existing: DtlRow[] = checkData.items ?? []
  if (existing.length > 0) return res.status(409).json({ message: '這個帳號已經在群組裡了' })

  const ordsRes = await fetch(`${ORDS_BASE}/group_dtl/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group_id: groupId, account, motifer: operator, motify_time: new Date().toISOString() }),
  })
  const data = await ordsRes.json()
  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '新增失敗' })
  return res.status(200).json(data)
}

async function handleRemove(req: VercelRequest, res: VercelResponse) {
  const { sid } = req.body ?? {}
  if (!sid) return res.status(400).json({ message: '缺少 sid' })

  const ordsRes = await fetch(`${ORDS_BASE}/group_dtl/${sid}`, { method: 'DELETE' })
  if (!ordsRes.ok && ordsRes.status !== 204) {
    const data = await ordsRes.json().catch(() => ({}))
    return res.status(ordsRes.status).json({ message: data.message || '移除失敗' })
  }
  return res.status(200).json({ message: '移除成功' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string

  try {
    if (req.method === 'GET') {
      if (action === 'list') return await handleList(req, res)
      return res.status(404).json({ message: '找不到這個動作' })
    }

    if (req.method === 'POST') {
      switch (action) {
        case 'add': return await handleAdd(req, res)
        case 'remove': return await handleRemove(req, res)
        default: return res.status(404).json({ message: '找不到這個動作' })
      }
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error(`Group-dtl action "${action}" error:`, err)
    return res.status(500).json({ message: '伺服器發生錯誤,請稍後再試' })
  }
}
