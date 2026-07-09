import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (except /admin/login itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session')

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Validate cookie value matches the signed secret
    const expectedValue = `authenticated:${process.env.ADMIN_SESSION_SECRET}`
    if (sessionCookie.value !== expectedValue) {
      const response = NextResponse.redirect(
        new URL('/admin/login', request.url)
      )
      response.cookies.delete('admin_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
