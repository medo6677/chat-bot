import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateLimit = checkRateLimit(ip + '_login', 5, 60000)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'محاولات دخول كثيرة، يرجى المحاولة لاحقاً.' },
        { status: 429 }
      )
    }

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
      return NextResponse.json(
        { error: 'كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

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
