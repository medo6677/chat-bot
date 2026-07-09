import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET content files for a subject
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get('subject_id')

  if (!subjectId) {
    return NextResponse.json({ error: 'subject_id مطلوب' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('content_files')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create a content file
export async function POST(request: Request) {
  const body = await request.json()
  const { subject_id, title, content_md } = body

  if (!subject_id || !title?.trim() || !content_md?.trim()) {
    return NextResponse.json(
      { error: 'المادة والعنوان والمحتوى مطلوبة' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('content_files')
    .insert({
      subject_id,
      title: title.trim(),
      content_md: content_md.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
