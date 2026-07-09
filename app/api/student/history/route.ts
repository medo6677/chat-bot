import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const conversationId = searchParams.get('conversation_id')

  // ─── Mode 2: fetch messages for a specific conversation ───
  if (conversationId) {
    try {
      const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return NextResponse.json({ messages: messages ?? [] })
    } catch (error: any) {
      console.error('Failed to fetch messages:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // ─── Mode 1: fetch all conversations for a session ───
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id or conversation_id required' }, { status: 400 })
  }

  try {
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        created_at,
        subject_id,
        student_name,
        messages (
          id
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const history = conversations
      .filter((conv) => conv.messages && conv.messages.length > 0)
      .map((conv: any) => ({
        id: conv.id,
        created_at: conv.created_at,
        subject_id: conv.subject_id,
        student_name: conv.student_name,
        message_count: conv.messages.length,
      }))

    return NextResponse.json(history)
  } catch (error: any) {
    console.error('Failed to fetch history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
