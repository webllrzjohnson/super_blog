import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { resolveUploadDir } from '@/lib/upload-storage'

const UPLOAD_CACHE_CONTROL = 'public, max-age=31536000, immutable'

function contentTypeForExtension(ext?: string): string {
  switch (ext?.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    case 'pdf':
      return 'application/pdf'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xls':
      return 'application/vnd.ms-excel'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'txt':
      return 'text/plain; charset=utf-8'
    case 'csv':
      return 'text/csv; charset=utf-8'
    case 'rtf':
      return 'application/rtf'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params
    if (filePath.some((segment) => segment === '..' || segment.includes('/'))) {
      return new NextResponse('Not found', { status: 404 })
    }

    const fullPath = path.join(resolveUploadDir(), ...filePath)
    const file = await readFile(fullPath)

    const ext = filePath[filePath.length - 1].split('.').pop()
    const contentType = contentTypeForExtension(ext)

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
