import type { VercelRequest, VercelResponse } from '@vercel/node'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

interface GroupRowLike { sid: string }

async function handleList(req: VercelRequest, res: VercelResponse) {
  const fields = 'sid,group_id,group_name,type,isenable'
  const listRes = await fetch(`${ORDS_BASE}/groups/?fields=${fields}&limit=500`)
  const data = await listRes.json()
  return res.status(200).json({ items: data.items ?? [] })
}

async function handleCheckUnique(req: VercelRequest, res: VercelResponse) {
  const { groupId, excludeSid } = req.body ?? {}
  if (!groupId) return res.status(200).json({ groupIdTaken: false })

  const q = encodeURIComponent(JSON.stringify({ group_id: groupId }))
  const r = await fetch(`${ORDS_BASE}/groups/?q=${q}&fields=sid`)
  const data = await r.json()
  const items: GroupRowLike[] = data.items ?? []
  const groupIdTaken = items.some((item) => item.sid !== excludeSid)

  return res.status(200).json({ groupIdTaken })
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const { groupId, groupName, type, isenable, operator } = req.body ?? {}
  if (!groupId) return res.status(400).json({ message: '群組ID為必填' })

  const ordsRes = await fetch(`${ORDS_BASE}/groups/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      group_id: groupId, group_name: groupName || null, type,
      isenable: isenable || 'Y', create_user: operator,
    }),
  })
  const data = await ordsRes.json()
  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '新增失敗' })
  return res.status(200).json(data)
}

async function handleUpdate(req: VercelRequest, res: VercelResponse) {
  const { sid, groupId, groupName, type, isenable, operator } = req.body ?? {}
  if (!sid || !groupId) return res.status(400).json({ message: '缺少必要欄位' })

  const ordsRes = await fetch(`${ORDS_BASE}/groups/${sid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      group_id: groupId, group_name: groupName || null, type,
      isenable: isenable || 'Y', motifer: operator, motify_time: new Date().toISOString(),
    }),
  })
  const data = await ordsRes.json()
  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '更新失敗' })
  return res.status(200).json(data)
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { sid } = req.body ?? {}
  if (!sid) return res.status(400).json({ message: '缺少 sid' })

  const ordsRes = await fetch(`${ORDS_BASE}/groups/${sid}`, { method: 'DELETE' })
  if (!ordsRes.ok && ordsRes.status !== 204) {
    const data = await ordsRes.json().catch(() => ({}))
    return res.status(ordsRes.status).json({ message: data.message || '刪除失敗' })
  }
  return res.status(200).json({ message: '刪除成功' })
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
        case 'check-unique': return await handleCheckUnique(req, res)
        case 'create': return await handleCreate(req, res)
        case 'update': return await handleUpdate(req, res)
        case 'delete': return await handleDelete(req, res)
        default: return res.status(404).json({ message: '找不到這個動作' })
      }
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error(`Groups action "${action}" error:`, err)
    return res.status(500).json({ message: '伺服器發生錯誤,請稍後再試' })
  }
}
