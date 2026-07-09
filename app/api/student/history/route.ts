import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        created_at,
        subject_id,
        student_name,
        subjects (
          name
        ),
        messages (
          id
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format the response: filter out empty conversations and get counts
    // subjects returns an array or object depending on relation, usually object for 1-to-many
    const history = conversations
      .filter((conv) => conv.messages && conv.messages.length > 0)
      .map((conv: any) => ({
        id: conv.id,
        created_at: conv.created_at,
        subject_id: conv.subject_id,
        subject_name: conv.subjects?.name || 'مادة محذوفة',
        student_name: conv.student_name,
        message_count: conv.messages.length
      }))

    return NextResponse.json(history)
  } catch (error: any) {
    console.error('Failed to fetch history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
