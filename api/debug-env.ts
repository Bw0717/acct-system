import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadEnv } from './_lib/loadEnv'

loadEnv()

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    DB_USER: process.env.DB_USER ? '有值' : '沒有值',
    DB_PASSWORD: process.env.DB_PASSWORD ? '有值' : '沒有值',
    DB_CONNECT_STRING: process.env.DB_CONNECT_STRING ? '有值' : '沒有值',
    WALLET_SQLNET_length: process.env.WALLET_SQLNET?.length ?? 0,
    WALLET_CWALLET_length: process.env.WALLET_CWALLET?.length ?? 0,
  })
}