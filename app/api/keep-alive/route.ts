import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('id')
      .limit(1)

    if (error) {
      console.error('[keep-alive] Supabase query error:', error)
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase pinged successfully to prevent auto-pause',
      timestamp: new Date().toISOString(),
      data,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[keep-alive] Error:', message)
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
