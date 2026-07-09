import { NextResponse } from 'next/server'
import { verifyAdminApi } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// PUT update subject (name, description, display_order, is_active)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminApi())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })


  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) updateData.name = body.name.trim()
  if (body.description !== undefined) updateData.description = body.description?.trim() || null
  if (body.display_order !== undefined) updateData.display_order = Number(body.display_order)
  if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active)

  const { data, error } = await supabaseAdmin
    .from('subjects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE subject (cascades to content_files via DB constraint)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminApi())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })


  const { id } = await params

  const { error } = await supabaseAdmin
    .from('subjects')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
