import path from 'node:path'

const CONTAINER_UPLOAD_DIR = '/app/public/uploads'

type ResolveUploadDirOptions = {
  cwd?: string
  nodeEnv?: string
  uploadDir?: string
}

type PublicUploadUrlOptions = {
  requestOrigin?: string
  siteUrl?: string
  forwardedHost?: string | null
  forwardedProto?: string | null
}

export function resolveUploadDir(options: ResolveUploadDirOptions = {}): string {
  const configured = options.uploadDir ?? process.env.UPLOAD_DIR
  if (configured?.trim()) return configured.trim()

  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV
  if (nodeEnv === 'production') return CONTAINER_UPLOAD_DIR

  return path.join(options.cwd ?? process.cwd(), 'public', 'uploads')
}

function cleanBaseUrl(value?: string | null): string {
  return value?.trim().replace(/\/$/, '') ?? ''
}

function publicOriginFromForwardedHeaders(host?: string | null, proto?: string | null): string {
  const forwardedHost = host?.split(',')[0]?.trim()
  if (!forwardedHost) return ''

  const forwardedProto = proto?.split(',')[0]?.trim() || 'https'
  return `${forwardedProto}://${forwardedHost}`
}

export function publicUploadUrl(
  filename: string,
  options: string | PublicUploadUrlOptions = {}
): string {
  const opts = typeof options === 'string' ? { requestOrigin: options } : options
  const base =
    cleanBaseUrl(opts.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanBaseUrl(publicOriginFromForwardedHeaders(opts.forwardedHost, opts.forwardedProto)) ||
    cleanBaseUrl(opts.requestOrigin)

  return `${base}/api/uploads/${filename}`
}
