const PLACEHOLDER_ALT_PATTERNS = [
  /^temporary image$/i,
  /^placeholder image$/i,
  /^describe this image$/i,
];

export function isPlaceholderImageAltText(altText: string | null | undefined) {
  const trimmedAlt = altText?.trim();
  if (!trimmedAlt) return false;
  return PLACEHOLDER_ALT_PATTERNS.some((pattern) => pattern.test(trimmedAlt));
}

export function getSafeImageAltText(
  altText: string | null | undefined,
  fallback: string,
) {
  const trimmedAlt = altText?.trim();
  const trimmedFallback = fallback.trim();

  if (!trimmedAlt) return trimmedFallback;

  if (isPlaceholderImageAltText(trimmedAlt)) return trimmedFallback;

  return trimmedAlt;
}
