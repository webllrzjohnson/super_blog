const databaseUrl = process.env.DATABASE_URL?.trim()
const hasDiscreteDatabaseConfig = Boolean(
  process.env.DB_HOST ||
    process.env.DB_NAME ||
    process.env.DB_USER ||
    process.env.DB_PASSWORD
)

export function hasDatabaseConfig(): boolean {
  return Boolean(databaseUrl || hasDiscreteDatabaseConfig)
}

export function getDatabaseUrl(): string | undefined {
  return databaseUrl || undefined
}

export function shouldUseDatabaseSsl(): boolean {
  return process.env.DB_SSL === 'true'
}
