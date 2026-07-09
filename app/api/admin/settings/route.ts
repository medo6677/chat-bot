import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET the settings row
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mask the API key for display (show only last 8 chars)
  const masked = {
    ...data,
    openrouter_api_key: data.openrouter_api_key
      ? '•'.repeat(Math.max(0, (data.openrouter_api_key as string).length - 8)) +
        (data.openrouter_api_key as string).slice(-8)
      : '',
  }

  return NextResponse.json(masked)
}

// PUT update settings
export async function PUT(request: Request) {
  const body = await request.json()
  const { openrouter_api_key, model_name, system_prompt, id } = body

  if (!id) {
    return NextResponse.json({ error: 'id مطلوب' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (model_name !== undefined) updateData.model_name = model_name.trim()
  if (system_prompt !== undefined) updateData.system_prompt = system_prompt.trim()
  // Only update API key if the submitted value is NOT the masked placeholder
  if (
    openrouter_api_key !== undefined &&
    !openrouter_api_key.startsWith('•')
  ) {
    updateData.openrouter_api_key = openrouter_api_key.trim()
  }

  const { data, error } = await supabaseAdmin
    .from('settings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
