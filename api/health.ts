import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[HEALTH] Checking environment variables...')
  
  const envVars = {
    DB_USER: process.env.DB_USER ? '✓ 設置' : '✗ 未設置',
    DB_PASSWORD: process.env.DB_PASSWORD ? '✓ 設置' : '✗ 未設置',
    DB_CONNECT_STRING: process.env.DB_CONNECT_STRING ? '✓ 設置' : '✗ 未設置',
    WALLET_SQLNET: process.env.WALLET_SQLNET ? '✓ 設置' : '✗ 未設置',
    WALLET_CWALLET: process.env.WALLET_CWALLET ? '✓ 設置' : '✗ 未設置',
    WALLET_EWALLET: process.env.WALLET_EWALLET ? '✓ 設置' : '✗ 未設置'
  }

  return res.status(200).json({
    success: true,
    message: 'Health check',
    timestamp: new Date().toISOString(),
    environment: envVars,
    nodeVersion: process.version
  })
}
