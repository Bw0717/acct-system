import oracledb from 'oracledb'
import { v4 as uuidv4 } from 'uuid'

// 初始化連接池
const initializePool = async () => {
  try {
    if (!oracledb.getPool()) {
      await oracledb.createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionString: process.env.DB_CONNECTION_STRING,
        poolMin: 2,
        poolMax: 10,
      })
    }
  } catch (err) {
    console.error('Failed to initialize connection pool:', err)
    throw err
  }
}

export interface IncomeRecord {
  SID?: string
  INCOME_ID?: string
  BILL_DATE: Date
  INVOICE_NO?: string
  CUSTOMER_NAME: string
  PROJECT?: string
  PERSONNEL?: string
  LOCATION?: string
  QUOTE_AMOUNT: number
  ACTUAL_AMOUNT: number
  UNCOLLECTED_AMOUNT: number
  COLLECTION_METHOD?: string
  COLLECTION_STATUS: 'Y' | 'N'
  COST_AMOUNT?: number
  ESTIMATED_PROFIT?: number
  REMARK?: string
  CREATE_USER?: string
  CREATE_TIME?: Date
  MOTIFER?: string
  MOTIFY_TIME?: Date
}

// 生成 SID (UUID)
const generateSID = (): string => uuidv4()

// 生成 INCOME_ID (按年月日 + 序號)
const generateIncomeId = async (connection: any): Promise<string> => {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
  
  const result = await connection.execute(
    `SELECT COUNT(*) as cnt FROM "ADMIN"."INC_INCOME_MAIN" 
     WHERE INCOME_ID LIKE :prefix`,
    [`${dateStr}%`]
  )
  
  const count = (result.rows?.[0]?.[0] as number) || 0
  const seqNo = String(count + 1).padStart(4, '0')
  
  return `${dateStr}${seqNo}`
}

/**
 * 新增收入記帳
 */
export const createIncome = async (data: IncomeRecord, currentUser: string): Promise<string> => {
  await initializePool()
  const connection = await oracledb.getConnection()
  
  try {
    const sid = generateSID()
    const incomeId = await generateIncomeId(connection)
    const now = new Date()

    const sql = `
      INSERT INTO "ADMIN"."INC_INCOME_MAIN" (
        "SID", "INCOME_ID", "BILL_DATE", "INVOICE_NO", "CUSTOMER_NAME",
        "PROJECT", "PERSONNEL", "LOCATION", "QUOTE_AMOUNT", "ACTUAL_AMOUNT",
        "UNCOLLECTED_AMOUNT", "COLLECTION_METHOD", "COLLECTION_STATUS",
        "COST_AMOUNT", "ESTIMATED_PROFIT", "REMARK",
        "CREATE_USER", "CREATE_TIME", "MOTIFER", "MOTIFY_TIME"
      ) VALUES (
        :sid, :incomeId, :billDate, :invoiceNo, :customerName,
        :project, :personnel, :location, :quoteAmount, :actualAmount,
        :uncollectedAmount, :collectionMethod, :collectionStatus,
        :costAmount, :estimatedProfit, :remark,
        :createUser, :createTime, :motifer, :motifyTime
      )
    `

    await connection.execute(sql, {
      sid,
      incomeId,
      billDate: data.BILL_DATE,
      invoiceNo: data.INVOICE_NO || null,
      customerName: data.CUSTOMER_NAME,
      project: data.PROJECT || null,
      personnel: data.PERSONNEL || null,
      location: data.LOCATION || null,
      quoteAmount: data.QUOTE_AMOUNT,
      actualAmount: data.ACTUAL_AMOUNT,
      uncollectedAmount: data.UNCOLLECTED_AMOUNT,
      collectionMethod: data.COLLECTION_METHOD || null,
      collectionStatus: data.COLLECTION_STATUS,
      costAmount: data.COST_AMOUNT || null,
      estimatedProfit: data.ESTIMATED_PROFIT || null,
      remark: data.REMARK || null,
      createUser: currentUser,
      createTime: now,
      motifer: currentUser,
      motifyTime: now,
    })

    await connection.commit()
    return incomeId
  } finally {
    await connection.close()
  }
}

/**
 * 更新收入記帳並記錄歷史
 */
export const updateIncome = async (incomeId: string, data: IncomeRecord, currentUser: string): Promise<void> => {
  await initializePool()
  const connection = await oracledb.getConnection()
  
  try {
    // 1. 將舊資料複製到歷史表
    await connection.execute(`
      INSERT INTO "ADMIN"."INC_INCOME_HIST" (
        "SID", "INCOME_ID", "BILL_DATE", "INVOICE_NO", "CUSTOMER_NAME",
        "PROJECT", "PERSONNEL", "LOCATION", "QUOTE_AMOUNT", "ACTUAL_AMOUNT",
        "UNCOLLECTED_AMOUNT", "COLLECTION_METHOD", "COLLECTION_STATUS",
        "COST_AMOUNT", "ESTIMATED_PROFIT", "REMARK", "MOTIFER", "MOTIFY_TIME"
      )
      SELECT 
        SYS_GUID(), "INCOME_ID", "BILL_DATE", "INVOICE_NO", "CUSTOMER_NAME",
        "PROJECT", "PERSONNEL", "LOCATION", "QUOTE_AMOUNT", "ACTUAL_AMOUNT",
        "UNCOLLECTED_AMOUNT", "COLLECTION_METHOD", "COLLECTION_STATUS",
        "COST_AMOUNT", "ESTIMATED_PROFIT", "REMARK", "MOTIFER", "MOTIFY_TIME"
      FROM "ADMIN"."INC_INCOME_MAIN"
      WHERE "INCOME_ID" = :incomeId
    `, { incomeId })

    // 2. 更新主表
    const now = new Date()
    await connection.execute(`
      UPDATE "ADMIN"."INC_INCOME_MAIN" SET
        "BILL_DATE" = :billDate,
        "INVOICE_NO" = :invoiceNo,
        "CUSTOMER_NAME" = :customerName,
        "PROJECT" = :project,
        "PERSONNEL" = :personnel,
        "LOCATION" = :location,
        "QUOTE_AMOUNT" = :quoteAmount,
        "ACTUAL_AMOUNT" = :actualAmount,
        "UNCOLLECTED_AMOUNT" = :uncollectedAmount,
        "COLLECTION_METHOD" = :collectionMethod,
        "COLLECTION_STATUS" = :collectionStatus,
        "COST_AMOUNT" = :costAmount,
        "ESTIMATED_PROFIT" = :estimatedProfit,
        "REMARK" = :remark,
        "MOTIFER" = :motifer,
        "MOTIFY_TIME" = :motifyTime
      WHERE "INCOME_ID" = :incomeId
    `, {
      billDate: data.BILL_DATE,
      invoiceNo: data.INVOICE_NO || null,
      customerName: data.CUSTOMER_NAME,
      project: data.PROJECT || null,
      personnel: data.PERSONNEL || null,
      location: data.LOCATION || null,
      quoteAmount: data.QUOTE_AMOUNT,
      actualAmount: data.ACTUAL_AMOUNT,
      uncollectedAmount: data.UNCOLLECTED_AMOUNT,
      collectionMethod: data.COLLECTION_METHOD || null,
      collectionStatus: data.COLLECTION_STATUS,
      costAmount: data.COST_AMOUNT || null,
      estimatedProfit: data.ESTIMATED_PROFIT || null,
      remark: data.REMARK || null,
      motifer: currentUser,
      motifyTime: now,
      incomeId,
    })

    await connection.commit()
  } finally {
    await connection.close()
  }
}

/**
 * 刪除收入記帳（邏輯刪除 - 可選）
 */
export const deleteIncome = async (incomeId: string, currentUser: string): Promise<void> => {
  await initializePool()
  const connection = await oracledb.getConnection()
  
  try {
    // 複製到歷史表後刪除
    await connection.execute(`
      INSERT INTO "ADMIN"."INC_INCOME_HIST" (
        "SID", "INCOME_ID", "BILL_DATE", "INVOICE_NO", "CUSTOMER_NAME",
        "PROJECT", "PERSONNEL", "LOCATION", "QUOTE_AMOUNT", "ACTUAL_AMOUNT",
        "UNCOLLECTED_AMOUNT", "COLLECTION_METHOD", "COLLECTION_STATUS",
        "COST_AMOUNT", "ESTIMATED_PROFIT", "REMARK", "MOTIFER", "MOTIFY_TIME"
      )
      SELECT 
        SYS_GUID(), "INCOME_ID", "BILL_DATE", "INVOICE_NO", "CUSTOMER_NAME",
        "PROJECT", "PERSONNEL", "LOCATION", "QUOTE_AMOUNT", "ACTUAL_AMOUNT",
        "UNCOLLECTED_AMOUNT", "COLLECTION_METHOD", "COLLECTION_STATUS",
        "COST_AMOUNT", "ESTIMATED_PROFIT", "REMARK", "MOTIFER", SYSDATE
      FROM "ADMIN"."INC_INCOME_MAIN"
      WHERE "INCOME_ID" = :incomeId
    `, { incomeId })

    await connection.execute(
      `DELETE FROM "ADMIN"."INC_INCOME_MAIN" WHERE "INCOME_ID" = :incomeId`,
      { incomeId }
    )

    await connection.commit()
  } finally {
    await connection.close()
  }
}

/**
 * 查詢單筆收入記帳
 */
export const getIncomeById = async (incomeId: string): Promise<IncomeRecord | null> => {
  await initializePool()
  const connection = await oracledb.getConnection()
  
  try {
    const result = await connection.execute(
      `SELECT * FROM "ADMIN"."INC_INCOME_MAIN" WHERE "INCOME_ID" = :incomeId`,
      { incomeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    return result.rows?.[0] as IncomeRecord || null
  } finally {
    await connection.close()
  }
}

/**
 * 查詢所有收入記帳（分頁）
 */
export const listIncomes = async (
  limit: number = 20,
  offset: number = 0,
  filters?: {
    customerName?: string
    billDateStart?: Date
    billDateEnd?: Date
    collectionStatus?: 'Y' | 'N'
  }
): Promise<{ data: IncomeRecord[]; total: number }> => {
  await initializePool()
  const connection = await oracledb.getConnection()
  
  try {
    let whereClause = ''
    const params: any = {}

    if (filters?.customerName) {
      whereClause += ` AND "CUSTOMER_NAME" LIKE :customerName`
      params.customerName = `%${filters.customerName}%`
    }

    if (filters?.billDateStart) {
      whereClause += ` AND "BILL_DATE" >= :billDateStart`
      params.billDateStart = filters.billDateStart
    }

    if (filters?.billDateEnd) {
      whereClause += ` AND "BILL_DATE" <= :billDateEnd`
      params.billDateEnd = filters.billDateEnd
    }

    if (filters?.collectionStatus) {
      whereClause += ` AND "COLLECTION_STATUS" = :collectionStatus`
      params.collectionStatus = filters.collectionStatus
    }

    // 查詢總數
    const countResult = await connection.execute(
      `SELECT COUNT(*) as cnt FROM "ADMIN"."INC_INCOME_MAIN" WHERE 1=1 ${whereClause}`,
      params
    )
    const total = (countResult.rows?.[0]?.[0] as number) || 0

    // 查詢分頁資料
    params.limit = limit
    params.offset = offset

    const dataResult = await connection.execute(
      `
        SELECT * FROM "ADMIN"."INC_INCOME_MAIN"
        WHERE 1=1 ${whereClause}
        ORDER BY "BILL_DATE" DESC, "CREATE_TIME" DESC
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      params,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    return {
      data: (dataResult.rows as IncomeRecord[]) || [],
      total,
    }
  } finally {
    await connection.close()
  }
}

/**
 * 查詢歷史紀錄
 */
export const getIncomeHistory = async (incomeId: string): Promise<IncomeRecord[]> => {
  await initializePool()
  const connection = await oracledb.getConnection()
  
  try {
    const result = await connection.execute(
      `
        SELECT * FROM "ADMIN"."INC_INCOME_HIST" 
        WHERE "INCOME_ID" = :incomeId
        ORDER BY "MOTIFY_TIME" DESC
      `,
      { incomeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    return (result.rows as IncomeRecord[]) || []
  } finally {
    await connection.close()
  }
}
