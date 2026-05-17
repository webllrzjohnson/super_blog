import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join('/app/public/uploads', ...params.path)
    const file = await readFile(filePath)
    
    const ext = params.path[params.path.length - 1].split('.').pop()
    const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'png' ? 'image/png'
      : ext === 'gif' ? 'image/gif'
      : ext === 'webp' ? 'image/webp'
      : 'application/octet-stream'

    return new NextResponse(file, {
      headers: { 'Content-Type': contentType }
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}