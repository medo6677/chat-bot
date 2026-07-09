import { cookies } from 'next/headers'

export async function verifyAdminApi(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')

  if (!sessionCookie) return false

  const expectedValue = `authenticated:${process.env.ADMIN_SESSION_SECRET}`
  if (sessionCookie.value !== expectedValue) {
    return false
  }

  return true
}
