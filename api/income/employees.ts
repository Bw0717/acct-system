import oracledb from 'oracledb'

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

export interface Employee {
  PERSONNEL: string
  ENG_NAME?: string
  CTW_NAME?: string
}

/**
 * 獲取所有員工列表
 */
export const getEmployees = async (): Promise<Employee[]> => {
  await initializePool()
  const connection = await oracledb.getConnection()

  try {
    const result = await connection.execute(
      `SELECT DISTINCT 
        PERSONNEL,
        ENG_NAME,
        CTW_NAME
      FROM (
        SELECT PERSONNEL, NULL as ENG_NAME, NULL as CTW_NAME FROM "ADMIN"."INC_INCOME_MAIN"
        WHERE PERSONNEL IS NOT NULL
        UNION ALL
        SELECT PERSONNEL, ENG_NAME, CTW_NAME FROM "ADMIN"."BS_EMPLOYEE"
      )
      WHERE PERSONNEL IS NOT NULL
      ORDER BY PERSONNEL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    return (result.rows as Employee[]) || []
  } finally {
    await connection.close()
  }
}

/**
 * 獲取所有員工（從 BS_EMPLOYEE 表）
 */
export const getEmployeesFromDB = async (): Promise<Employee[]> => {
  await initializePool()
  const connection = await oracledb.getConnection()

  try {
    const result = await connection.execute(
      `SELECT 
        EMP_ID as PERSONNEL,
        ENG_NAME,
        CTW_NAME
      FROM "ADMIN"."BS_EMPLOYEE"
      WHERE ISENABLE = 'Y'
      ORDER BY EMP_ID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    return (result.rows as Employee[]) || []
  } finally {
    await connection.close()
  }
}

/**
 * 獲取收款方式列表（從既有記錄中提取）
 */
export const getCollectionMethods = async (): Promise<string[]> => {
  await initializePool()
  const connection = await oracledb.getConnection()

  try {
    const result = await connection.execute(
      `SELECT DISTINCT COLLECTION_METHOD
      FROM "ADMIN"."INC_INCOME_MAIN"
      WHERE COLLECTION_METHOD IS NOT NULL
      ORDER BY COLLECTION_METHOD`,
      []
    )

    // 返回平面數組
    const methods = result.rows?.map((row: any) => row[0]).filter((m: any) => m) || []
    
    // 添加默認值
    const defaultMethods = ['現金', '支票', '轉帳', '信用卡']
    const allMethods = Array.from(new Set([...defaultMethods, ...methods]))
    
    return allMethods
  } finally {
    await connection.close()
  }
}
