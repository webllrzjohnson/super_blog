import sql from '@/lib/db'
import { hasDatabaseConfig } from '@/lib/db-config'

export const MODEL_API_KEY_PROVIDERS = ['anthropic', 'openai', 'groq'] as const

export type ModelApiKeyProvider = (typeof MODEL_API_KEY_PROVIDERS)[number]
export type ModelApiKeyMap = Partial<Record<ModelApiKeyProvider, string>>

const SETTINGS_KEY = 'ai_api_keys'

const ENV_KEY_BY_PROVIDER: Record<ModelApiKeyProvider, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  groq: 'GROQ_API_KEY',
}

export function isModelApiKeyProvider(value: string): value is ModelApiKeyProvider {
  return MODEL_API_KEY_PROVIDERS.includes(value as ModelApiKeyProvider)
}

export function getEnvApiKeyName(provider: ModelApiKeyProvider): string {
  return ENV_KEY_BY_PROVIDER[provider]
}

export function maskApiKey(value?: string | null): string {
  const trimmed = value?.trim()
  if (!trimmed) return 'not configured'
  return `configured ending ${trimmed.slice(-4)}`
}

function normalizeKey(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export function normalizeModelApiKeys(value: unknown): ModelApiKeyMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const record = value as Record<string, unknown>
  return MODEL_API_KEY_PROVIDERS.reduce<ModelApiKeyMap>((keys, provider) => {
    const normalized = normalizeKey(record[provider])
    if (normalized) keys[provider] = normalized
    return keys
  }, {})
}

export function buildModelApiKeyPatch(
  current: ModelApiKeyMap,
  submitted: Partial<Record<ModelApiKeyProvider, unknown>>,
  clear: Partial<Record<ModelApiKeyProvider, boolean>> = {}
): ModelApiKeyMap {
  const next: ModelApiKeyMap = { ...current }

  for (const provider of MODEL_API_KEY_PROVIDERS) {
    const replacement = normalizeKey(submitted[provider])
    if (replacement) {
      next[provider] = replacement
    } else if (clear[provider]) {
      delete next[provider]
    }
  }

  return next
}

async function loadStoredModelApiKeys(): Promise<ModelApiKeyMap> {
  if (!hasDatabaseConfig()) return {}

  try {
    const rows = await sql<Array<{ value: unknown }>>`
      SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY} LIMIT 1
    `
    return normalizeModelApiKeys(rows[0]?.value)
  } catch (error) {
    console.error('Failed to load model API keys from DB:', error)
    return {}
  }
}

export async function getModelApiKey(provider: ModelApiKeyProvider): Promise<string | undefined> {
  const envKey = process.env[getEnvApiKeyName(provider)]?.trim()
  if (envKey) return envKey

  const storedKeys = await loadStoredModelApiKeys()
  return storedKeys[provider]
}

export async function getAvailableModelApiKeyProviders(): Promise<Set<ModelApiKeyProvider>> {
  const storedKeys = await loadStoredModelApiKeys()
  return getAvailableApiKeyProviders(storedKeys)
}

export function getAvailableApiKeyProviders(keys: ModelApiKeyMap): Set<ModelApiKeyProvider> {
  return new Set(
    MODEL_API_KEY_PROVIDERS.filter(
      (provider) => Boolean(process.env[getEnvApiKeyName(provider)]?.trim() || keys[provider])
    )
  )
}

export function getAvailableAiTextProviders(keys: ModelApiKeyMap): Set<'claude' | 'openai' | 'groq'> {
  const available = getAvailableApiKeyProviders(keys)
  const textProviders = new Set<'claude' | 'openai' | 'groq'>()
  if (available.has('anthropic')) textProviders.add('claude')
  if (available.has('openai')) textProviders.add('openai')
  if (available.has('groq')) textProviders.add('groq')
  return textProviders
}

export async function getAvailableConfiguredAiTextProviders(): Promise<Set<'claude' | 'openai' | 'groq'>> {
  return getAvailableAiTextProviders(await loadStoredModelApiKeys())
}

export async function getModelApiKeyStatus() {
  const storedKeys = await loadStoredModelApiKeys()
  return MODEL_API_KEY_PROVIDERS.map((provider) => ({
    provider,
    envKey: getEnvApiKeyName(provider),
    envConfigured: Boolean(process.env[getEnvApiKeyName(provider)]?.trim()),
    storedConfigured: Boolean(storedKeys[provider]),
    masked: maskApiKey(process.env[getEnvApiKeyName(provider)] || storedKeys[provider]),
  }))
}

export async function upsertModelApiKeys(
  submitted: Partial<Record<ModelApiKeyProvider, unknown>>,
  clear: Partial<Record<ModelApiKeyProvider, boolean>> = {}
): Promise<ModelApiKeyMap> {
  if (!hasDatabaseConfig()) {
    throw new Error('Database is not configured')
  }

  const current = await loadStoredModelApiKeys()
  const next = buildModelApiKeyPatch(current, submitted, clear)

  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${sql.json(next as any)}, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
  `

  return next
}
