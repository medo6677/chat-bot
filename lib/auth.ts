import { cookies } from 'next/headers'

/**
 * Verify admin access from within an API Route.
 * Returns true if the request has a valid admin_session cookie.
 */
export async function verifyAdminApi(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')
    if (!sessionCookie) return false

    const sessionSecret = process.env.ADMIN_SESSION_SECRET
    if (!sessionSecret) return false

    return sessionCookie.value === `authenticated:${sessionSecret}`
  } catch {
    return false
  }
}
