import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth-session'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  const authenticated = session ? await verifySessionToken(session) : false

  return NextResponse.json({ authenticated })
}
