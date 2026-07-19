export const AD_POSITIONS = [
  'top-of-content',
  'mid-content',
  'end-of-article',
  'between-posts',
] as const

export type AdPosition = (typeof AD_POSITIONS)[number]

const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{16}$/
const ADSENSE_SLOT_ID_PATTERN = /^\d{10}$/

export function isAdPosition(value: string): value is AdPosition {
  return (AD_POSITIONS as readonly string[]).includes(value)
}

export function normalizeAdSenseSlotId(
  value: string | null | undefined,
): string | undefined {
  const normalized = value?.trim()
  if (!normalized || !ADSENSE_SLOT_ID_PATTERN.test(normalized)) return undefined
  return normalized
}

export function hasUniqueAdPositions(slots: readonly { position: string }[]): boolean {
  return new Set(slots.map(({ position }) => position)).size === slots.length
}

export function normalizeAdSenseClientId(value: string | null | undefined): string | undefined {
  const normalized = value?.trim()
  if (!normalized || !ADSENSE_CLIENT_ID_PATTERN.test(normalized)) return undefined
  return normalized
}

export function buildAdSenseScriptSrc(
  value: string | null | undefined,
): string | undefined {
  const clientId = normalizeAdSenseClientId(value)
  return clientId
    ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
    : undefined
}

export function getAdSenseAccountMetadata(
  value: string | null | undefined,
): Record<string, string> | undefined {
  const clientId = normalizeAdSenseClientId(value)
  return clientId ? { 'google-adsense-account': clientId } : undefined
}

export function buildAdsTxt(value: string | null | undefined): string | undefined {
  const clientId = normalizeAdSenseClientId(value)
  if (!clientId) return undefined

  const publisherId = clientId.replace(/^ca-/, '')
  return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
}

export function createAdsTxtResponse(value: string | null | undefined): Response {
  const content = buildAdsTxt(value)
  const headers = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=120',
  }

  return new Response(content ?? 'Not found\n', {
    status: content ? 200 : 404,
    headers,
  })
}
