import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Simple in-memory rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const attempt = loginAttempts.get(ip)

    if (attempt) {
      if (now < attempt.lockoutUntil) {
        return NextResponse.json(
          { error: 'تم حظر تسجيل الدخول مؤقتاً بسبب كثرة المحاولات. حاول مجدداً بعد 15 دقيقة.' },
          { status: 429 }
        )
      } else if (now > attempt.lockoutUntil && attempt.count >= MAX_ATTEMPTS) {
        // Reset after lockout expired
        loginAttempts.set(ip, { count: 0, lockoutUntil: 0 })
      }
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'كلمة المرور مطلوبة' },
        { status: 400 }
      )
    }

    const correctPassword = process.env.ADMIN_PASSWORD
    const sessionSecret = process.env.ADMIN_SESSION_SECRET

    if (!correctPassword || !sessionSecret) {
      console.error('ADMIN_PASSWORD or ADMIN_SESSION_SECRET is not set')
      return NextResponse.json(
        { error: 'خطأ في إعدادات الخادم' },
        { status: 500 }
      )
    }

    if (password !== correctPassword) {
      // Record failed attempt
      const currentCount = (loginAttempts.get(ip)?.count || 0) + 1
      const isLocked = currentCount >= MAX_ATTEMPTS
      loginAttempts.set(ip, {
        count: currentCount,
        lockoutUntil: isLocked ? now + LOCKOUT_TIME : 0,
      })

      return NextResponse.json(
        { error: isLocked ? 'محاولات خاطئة كثيرة. تم حظر الدخول لمدة 15 دقيقة.' : 'كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Success - reset attempts
    loginAttempts.delete(ip)

    const cookieStore = await cookies()
    const cookieValue = `authenticated:${sessionSecret}`

    cookieStore.set('admin_session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 })
  }
}
