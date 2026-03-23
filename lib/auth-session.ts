/**
 * Signed admin session tokens.
 * Uses Web Crypto API (works in Edge middleware and Node).
 */

const ALG = { name: 'HMAC', hash: 'SHA-256' }
const MAX_AGE_SEC = 60 * 60 * 24 // 24 hours

function getSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error(
      'ADMIN_SESSION_SECRET must be set in production. Add a random 32+ char string to your env.'
    )
  }
  return secret || 'dev-only-fallback-change-in-production'
}

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    ALG,
    false,
    ['sign', 'verify']
  )
}

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  let binary = ''
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i])
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = str.length % 4
  if (pad) str += '===='.slice(0, 4 - pad)
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function createSessionToken(): Promise<string> {
  const secret = getSecret()
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + MAX_AGE_SEC
  const payload = `admin.${iat}.${exp}`
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign(
    ALG,
    key,
    new TextEncoder().encode(payload)
  )
  return `${base64UrlEncode(new TextEncoder().encode(payload))}.${base64UrlEncode(sig)}`
}

export async function verifySessionToken(token: string): Promise<boolean> {
  if (!token || token === 'authenticated') return false
  const parts = token.split('.')
  if (parts.length !== 2) return false

  try {
    const payloadBytes = base64UrlDecode(parts[0])
    const payload = new TextDecoder().decode(payloadBytes)
    const [, iatStr, expStr] = payload.split('.')
    const exp = parseInt(expStr, 10)
    if (Date.now() / 1000 > exp) return false

    const secret = getSecret()
    const key = await getKey(secret)
    const sigBytes = base64UrlDecode(parts[1])
    const valid = await crypto.subtle.verify(
      ALG,
      key,
      sigBytes,
      new TextEncoder().encode(payload)
    )
    return valid
  } catch {
    return false
  }
}

/** Parse admin_session from Cookie header and verify it. */
export async function isAdminSession(cookieHeader: string | null): Promise<boolean> {
  if (!cookieHeader) return false
  const match = cookieHeader.match(/admin_session=([^;]+)/)
  const value = match?.[1]?.trim()
  return value ? verifySessionToken(value) : false
}
