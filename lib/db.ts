'use server'
import postgres from 'postgres'
import { getDatabaseUrl, shouldUseDatabaseSsl } from '@/lib/db-config'

const databaseUrl = getDatabaseUrl()
const ssl = shouldUseDatabaseSsl()

const sql = databaseUrl
  ? postgres(databaseUrl, { ssl })
  : postgres({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'super_blog',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl,
    })

export default sql
