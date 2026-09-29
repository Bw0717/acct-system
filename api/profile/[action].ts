import type { VercelRequest, VercelResponse } from '@vercel/node'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const account = req.query.account as string
  if (!account) return res.status(400).json({ message: '缺少 account' })

  const fields = 'emp_id,account,ctw_name,eng_name,tel_no,tel_ex,email'
  const q = encodeURIComponent(JSON.stringify({ account }))
  const ordsRes = await fetch(`${ORDS_BASE}/employees/?q=${q}&fields=${fields}`)
  const data = await ordsRes.json()
  const row = data.items?.[0]

  if (!row) return res.status(404).json({ message: '找不到帳號資料' })
  return res.status(200).json(row)
}

async function handleUpdate(req: VercelRequest, res: VercelResponse) {
  const { account, ctwName, engName, telNo, telEx, email } = req.body ?? {}
  if (!account) return res.status(400).json({ message: '缺少 account' })

  const ordsRes = await fetch(`${ORDS_BASE}/emp/update-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account, ctw_name: ctwName || null, eng_name: engName || null,
      tel_no: telNo || null, tel_ex: telEx || null, email: email || null,
    }),
  })
  const data = await ordsRes.json()
  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '更新失敗' })
  return res.status(200).json(data)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string

  try {
    if (req.method === 'GET' && action === 'get') return await handleGet(req, res)
    if (req.method === 'POST' && action === 'update') return await handleUpdate(req, res)
    return res.status(404).json({ message: '找不到這個動作' })
  } catch (err) {
    console.error(`Profile action "${action}" error:`, err)
    return res.status(500).json({ message: '伺服器發生錯誤,請稍後再試' })
  }
}
