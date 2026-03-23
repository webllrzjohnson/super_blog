import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth-session'

export async function middleware(request: NextRequest) {
  const isAdmin = request.nextUrl.pathname.startsWith('/admin')

  if (!isAdmin) {
    return NextResponse.next()
  }

  // Allow admin login page and API routes
  if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const session = request.cookies.get('admin_session')?.value
  const valid = session ? await verifySessionToken(session) : false
  if (!valid) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
