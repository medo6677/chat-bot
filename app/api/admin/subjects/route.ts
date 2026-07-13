import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAdminApi } from '@/lib/auth'

// GET all subjects with content file count
export async function GET() {
  if (!(await verifyAdminApi())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select(`
      *,
      content_files(count)
    `)
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create a subject
export async function POST(request: Request) {
  if (!(await verifyAdminApi())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, description, display_order } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'اسم المادة مطلوب' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('subjects')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      display_order: Number(display_order) || 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
