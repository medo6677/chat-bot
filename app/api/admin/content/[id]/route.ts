import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyAdminApi } from '@/lib/auth'

// PUT update a content file
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminApi())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (body.title !== undefined) updateData.title = body.title.trim()
  if (body.content_md !== undefined) updateData.content_md = body.content_md.trim()
  if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active)

  const { data, error } = await supabaseAdmin
    .from('content_files')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE a content file
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminApi())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('content_files')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
