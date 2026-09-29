import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'

const ORDS_BASE = 'https://gaa8287344c32e6-acctdb.adb.ap-singapore-1.oraclecloudapps.com/ords/admin'

interface EmployeeRow {
  sid: string
  emp_id: string
  account: string
  pw: string
  ctw_name: string
  isenable: string
  create_time: string
  motify_time: string | null
}

interface GroupIdRow { group_id: string }
interface GroupAttrRow {
  group_id: string
  option1: string; option2: string; option3: string; option4: string; option5: string
  option6: string; option7: string; option8: string; option9: string; option10: string
}

const OPTION_TO_PERMISSION: Record<string, string> = {
  option1: 'income', option2: 'expense', option3: 'payroll', option4: 'projects',
  option5: 'reports', option6: 'audit-log', option7: 'groups', option8: 'employees',
}

async function resolvePermissions(account: string): Promise<string[]> {
  const dtlQ = encodeURIComponent(JSON.stringify({ account }))
  const dtlRes = await fetch(`${ORDS_BASE}/group_dtl/?q=${dtlQ}&fields=group_id&limit=500`)
  const dtlData = await dtlRes.json()
  const accountGroupIds = new Set<string>((dtlData.items ?? []).map((r: GroupIdRow) => r.group_id))
  if (accountGroupIds.size === 0) return []

  const mainQ = encodeURIComponent(JSON.stringify({ type: '權限', isenable: 'Y' }))
  const mainRes = await fetch(`${ORDS_BASE}/groups/?q=${mainQ}&fields=group_id&limit=500`)
  const mainData = await mainRes.json()
  const permissionGroupIds: string[] = (mainData.items ?? [])
    .map((r: GroupIdRow) => r.group_id)
    .filter((id: string) => accountGroupIds.has(id))
  if (permissionGroupIds.length === 0) return []

  const attrQ = encodeURIComponent(JSON.stringify({ group_id: { $in: permissionGroupIds } }))
  const attrRes = await fetch(`${ORDS_BASE}/group_attr/?q=${attrQ}&limit=500`)
  const attrData = await attrRes.json()
  const attrRows: GroupAttrRow[] = attrData.items ?? []
  if (attrRows.length === 0) return []

  const permissions = new Set<string>()
  for (const row of attrRows) {
    for (const [optionKey, permissionKey] of Object.entries(OPTION_TO_PERMISSION)) {
      if (row[optionKey as keyof GroupAttrRow] === 'Y') permissions.add(permissionKey)
    }
  }
  return Array.from(permissions)
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const { username, password } = req.body ?? {}
  const loginIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress || 'unknown'

  if (!username || !password) return res.status(400).json({ message: '請輸入帳號與密碼' })

  const query = encodeURIComponent(JSON.stringify({ account: username }))
  const empRes = await fetch(`${ORDS_BASE}/employees/?q=${query}`)
  const empData = await empRes.json()
  const row: EmployeeRow | undefined = empData.items?.[0]

  let status: 'SUCCESS' | 'FAIL' = 'FAIL'
  let message = ''

  if (!row) {
    message = '帳號不存在'
  } else if (row.isenable !== 'Y') {
    message = '帳號已停用'
  } else {
    const passwordMatches = await bcrypt.compare(password, row.pw)
    if (!passwordMatches) {
      message = '密碼錯誤'
    } else {
      status = 'SUCCESS'
      message = '登入成功'
    }
  }

  await fetch(`${ORDS_BASE}/login_log/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: username, login_ip: loginIp, action_status: status, action_msg: message }),
  })

  if (status === 'FAIL') return res.status(401).json({ message })

  const baseTimeStr = row!.motify_time ?? row!.create_time
  const baseTime = new Date(baseTimeStr)
  const expiryTime = new Date(baseTime)
  expiryTime.setMonth(expiryTime.getMonth() + 3)
  const forceChangePassword = new Date() > expiryTime

  const permissions = await resolvePermissions(row!.account)

  return res.status(200).json({
    forceChangePassword,
    user: { username: row!.account, displayName: row!.ctw_name, permissions },
  })
}

async function handleForgotPassword(req: VercelRequest, res: VercelResponse) {
  const { account, empId } = req.body ?? {}
  if (!account || !empId) return res.status(400).json({ message: '請輸入帳號與工號' })

  const newPwHash = await bcrypt.hash(empId, 10)
  const ordsRes = await fetch(`${ORDS_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account, emp_id: empId, new_pw: newPwHash }),
  })
  const data = await ordsRes.json()

  if (!ordsRes.ok) return res.status(ordsRes.status).json({ message: data.message || '帳號或工號不正確' })
  return res.status(200).json({ message: '密碼已重設為您的工號,請立即登入並修改密碼' })
}

async function handleChangePassword(req: VercelRequest, res: VercelResponse) {
  const { username, currentPassword, newPassword } = req.body ?? {}
  if (!username || !currentPassword || !newPassword) return res.status(400).json({ message: '缺少必要欄位' })
  if (newPassword.length < 8) return res.status(400).json({ message: '新密碼至少需要 8 碼' })

  const query = encodeURIComponent(JSON.stringify({ account: username }))
  const empRes = await fetch(`${ORDS_BASE}/employees/?q=${query}`)
  const empData = await empRes.json()
  const row: EmployeeRow | undefined = empData.items?.[0]

  if (!row) return res.status(404).json({ message: '帳號不存在' })
  if (row.isenable !== 'Y') return res.status(403).json({ message: '帳號已停用' })

  const currentMatches = await bcrypt.compare(currentPassword, row.pw)
  if (!currentMatches) return res.status(401).json({ message: '目前密碼不正確' })

  const newHash = await bcrypt.hash(newPassword, 10)

  const changeRes = await fetch(`${ORDS_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sid: row.sid, new_pw: newHash, account: username }),
  })
  const changeData = await changeRes.json()

  if (!changeRes.ok) return res.status(500).json({ message: changeData.message || '更新密碼失敗,請稍後再試' })
  return res.status(200).json({ message: '密碼已更新' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const action = req.query.action as string

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res)
      case 'forgot-password':
        return await handleForgotPassword(req, res)
      case 'change-password':
        return await handleChangePassword(req, res)
      default:
        return res.status(404).json({ message: '找不到這個動作' })
    }
  } catch (err) {
    console.error(`Auth action "${action}" error:`, err)
    return res.status(500).json({ message: '伺服器發生錯誤,請稍後再試' })
  }
}
