import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const UPLOAD_CACHE_CONTROL = 'public, max-age=31536000, immutable'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params
    const fullPath = path.join('/app/public/uploads', ...filePath)
    const file = await readFile(fullPath)

    const ext = filePath[filePath.length - 1].split('.').pop()
    const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'png' ? 'image/png'
      : ext === 'gif' ? 'image/gif'
      : ext === 'webp' ? 'image/webp'
      : 'application/octet-stream'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': UPLOAD_CACHE_CONTROL,
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
