const PLACEHOLDER_ALT_PATTERNS = [
  /^temporary image$/i,
  /^placeholder image$/i,
  /^describe this image$/i,
]

export function getSafeImageAltText(altText: string | null | undefined, fallback: string) {
  const trimmedAlt = altText?.trim()
  const trimmedFallback = fallback.trim()

  if (!trimmedAlt) return trimmedFallback

  const isPlaceholder = PLACEHOLDER_ALT_PATTERNS.some((pattern) => pattern.test(trimmedAlt))
  if (isPlaceholder) return trimmedFallback

  return trimmedAlt
}
