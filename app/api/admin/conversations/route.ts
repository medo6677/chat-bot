import { NextResponse } from 'next/server'
import { verifyAdminApi } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET conversations (optionally filtered by subject_id)
export async function GET(request: Request) {
  if (!(await verifyAdminApi())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })


  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get('subject_id')

  let query = supabaseAdmin
    .from('conversations')
    .select(`
      *,
      subjects(name),
      messages(count)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (subjectId && subjectId !== 'all') {
    query = query.eq('subject_id', subjectId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
