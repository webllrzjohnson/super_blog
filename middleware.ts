import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdmin = request.nextUrl.pathname.startsWith('/admin')

  if (!isAdmin) {
    return NextResponse.next()
  }

  // Allow admin login page and API routes
  if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const session = request.cookies.get('admin_session')?.value
  if (session !== 'authenticated') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
