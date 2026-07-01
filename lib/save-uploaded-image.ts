import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const UPLOAD_DIR = '/app/public/uploads'

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function getExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName) return fromName
  switch (file.type) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'bin'
  }
}

function publicUploadUrl(filename: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''
  return `${base}/api/uploads/${filename}`
}

export async function saveUploadedImageFile(file: File): Promise<{ url: string; filename: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Unsupported file type')
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File too large (max 5MB)')
  }

  const ext = getExtension(file)
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`
  const fullPath = path.join(UPLOAD_DIR, filename)

  await mkdir(UPLOAD_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(fullPath, buffer)

  return { url: publicUploadUrl(filename), filename }
}

export async function saveUploadedImageBuffer(
  buffer: Buffer,
  mimeType: string,
  prefix = 'generated'
): Promise<{ url: string; filename: string }> {
  const ext =
    mimeType === 'image/png'
      ? 'png'
      : mimeType === 'image/webp'
        ? 'webp'
        : mimeType === 'image/jpeg'
          ? 'jpg'
          : 'png'

  const filename = `${prefix}_${Date.now()}-${crypto.randomUUID()}.${ext}`
  const fullPath = path.join(UPLOAD_DIR, filename)

  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(fullPath, buffer)

  return { url: publicUploadUrl(filename), filename }
}
