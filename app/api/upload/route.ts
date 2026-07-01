import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'
 
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
])
 
function getExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName) return fromName
  switch (file.type) {
    case 'image/jpeg': return 'jpg'
    case 'image/png': return 'png'
    case 'image/webp': return 'webp'
    case 'image/gif': return 'gif'
    case 'image/svg+xml': return 'svg'
    case 'image/x-icon':
    case 'image/vnd.microsoft.icon': return 'ico'
    default: return 'bin'
  }
}
 
export async function POST(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `upload:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 20,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many uploads. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    )
  }
 
  // Auth: accept either admin session cookie OR bearer token (legacy automation)
  const auth = request.headers.get('authorization') ?? ''
  const secret = process.env.UPLOAD_SECRET
  const bearerValid = secret && auth === `Bearer ${secret}`
 
  if (!bearerValid) {
    // Fall back to checking admin session cookie
    const { headers } = await import('next/headers')
    const { isAdminSession } = await import('@/lib/auth-session')
    const headersList = await headers()
    const isAdmin = isAdminSession(headersList.get('cookie'))
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
 
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }
 
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }
 
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }
 
  const ext = getExtension(file)
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`
  const uploadDir = '/app/public/uploads'
  const fullPath = path.join(uploadDir, filename)
 
  try {
    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(fullPath, buffer)
  } catch (err) {
    console.error('File write error:', err)
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
 
  const publicUrl = `https://maplehub.cloud/api/uploads/${filename}`
 
  return NextResponse.json({ url: publicUrl, filename })
}