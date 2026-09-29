import type { VercelRequest, VercelResponse } from '@vercel/node'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const groupId = req.query.groupId as string
  if (!groupId) return res.status(400).json({ message: '缺少 groupId' })

  const q = encodeURIComponent(JSON.stringify({ group_id: groupId }))
  const ordsRes = await fetch(`${ORDS_BASE}/group_attr/?q=${q}`)
  const data = await ordsRes.json()
  const row = data.items?.[0]

  if (!row) {
    return res.status(200).json({
      sid: null, group_id: groupId,
      option1: 'N', option2: 'N', option3: 'N', option4: 'N', option5: 'N',
      option6: 'N', option7: 'N', option8: 'N', option9: 'N', option10: 'N',
    })
  }
  return res.status(200).json(row)
}

async function handleSave(req: VercelRequest, res: VercelResponse) {
  const { groupId, options, operator } = req.body ?? {}
  if (!groupId || !options) return res.status(400).json({ message: '缺少必要欄位' })

  const q = encodeURIComponent(JSON.stringify({ group_id: groupId }))
  const checkRes = await fetch(`${ORDS_BASE}/group_attr/?q=${q}&fields=sid`)
  const checkData = await checkRes.json()
  const existing = checkData.items?.[0]

  const body = {
    group_id: groupId,
    option1: options.option1, option2: options.option2, option3: options.option3,
    option4: options.option4, option5: options.option5, option6: options.option6,
    option7: options.option7, option8: options.option8, option9: options.option9,
    option10: options.option10, motifer: operator, motify_time: new Date().toISOString(),
  }

  let ordsRes
  if (existing) {
    ordsRes = await fetch(`${ORDS_BASE}/group_attr/${existing.sid}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
  } else {
    ordsRes = await fetch(`${ORDS_BASE}/group_attr/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
  }

  const data = await ordsRes.json()
  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '儲存失敗' })
  return res.status(200).json({ message: '權限定義已儲存' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string

  try {
    if (req.method === 'GET' && action === 'get') return await handleGet(req, res)
    if (req.method === 'POST' && action === 'save') return await handleSave(req, res)
    return res.status(404).json({ message: '找不到這個動作' })
  } catch (err) {
    console.error(`Group-attr action "${action}" error:`, err)
    return res.status(500).json({ message: '伺服器發生錯誤,請稍後再試' })
  }
}
