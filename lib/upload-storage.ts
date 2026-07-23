import path from 'node:path'

const CONTAINER_UPLOAD_DIR = '/app/public/uploads'

type ResolveUploadDirOptions = {
  cwd?: string
  nodeEnv?: string
  uploadDir?: string
}

export function resolveUploadDir(options: ResolveUploadDirOptions = {}): string {
  const configured = options.uploadDir ?? process.env.UPLOAD_DIR
  if (configured?.trim()) return configured.trim()

  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV
  if (nodeEnv === 'production') return CONTAINER_UPLOAD_DIR

  return path.join(options.cwd ?? process.cwd(), 'public', 'uploads')
}

export function publicUploadUrl(filename: string, requestOrigin?: string): string {
  const base =
    requestOrigin?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    ''
  return `${base}/api/uploads/${filename}`
}
