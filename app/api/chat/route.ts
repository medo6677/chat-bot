import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { checkRateLimit } from '@/lib/rateLimit'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MAX_HISTORY_CHARS = 8000

/**
 * Detect API provider from key format:
 * - Google AI keys start with "AIza"
 * - Groq keys start with "gsk_"
 * - OpenRouter keys start with "sk-or-"
 */
function detectProvider(apiKey: string): 'google' | 'groq' | 'openrouter' {
  if (apiKey.startsWith('AIza')) return 'google'
  if (apiKey.startsWith('gsk_')) return 'groq'
  return 'openrouter'
}

/**
 * Call Google Gemini API directly
 */
async function callGemini(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  historyMessages: { role: string; content: string }[],
  userMessage: string
): Promise<{ reply: string; error?: string }> {
  // Map model name: if admin typed full OpenRouter-style name, extract just the model part
  // e.g. "gemini-2.0-flash" or "google/gemini-2.0-flash" -> "gemini-2.0-flash"
  let geminiModel = modelName
  if (geminiModel.includes('/')) {
    geminiModel = geminiModel.split('/').pop()!
  }
  // Remove :free suffix if present
  geminiModel = geminiModel.replace(/:free$/, '')

  const url = `${GEMINI_BASE_URL}/${geminiModel}:generateContent?key=${apiKey}`

  // Build Gemini contents array
  const contents: { role: string; parts: { text: string }[] }[] = []

  // Add history
  for (const msg of historyMessages) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })
  }

  // Add the current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  })

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Gemini API error:', errText)
    return { reply: '', error: errText }
  }

  const data = await res.json()
  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    'عذرًا، لم أتمكن من توليد إجابة. حاول مجدداً.'

  return { reply }
}

/**
 * Call OpenAI-Compatible API (OpenRouter, Groq, etc) with retry
 */
async function callOpenAICompatible(
  apiKey: string,
  modelName: string,
  messages: { role: string; content: string }[],
  provider: 'groq' | 'openrouter'
): Promise<{ reply: string; error?: string }> {
  const MAX_RETRIES = 3
  let lastError = ''
  
  const baseURL = provider === 'groq' ? GROQ_URL : OPENROUTER_URL

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(baseURL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://thinky.app',
        'X-Title': 'Thinky Student Chatbot',
      },
      body: JSON.stringify({ model: modelName, messages }),
    })

    if (res.ok) {
      const data = await res.json()
      const reply =
        data.choices?.[0]?.message?.content ||
        'عذرًا، لم أتمكن من توليد إجابة. حاول مجدداً.'
      return { reply }
    }

    lastError = await res.text()
    console.error(`${provider} error (attempt ${attempt + 1}/${MAX_RETRIES}):`, lastError)

    if (res.status === 429 && attempt < MAX_RETRIES - 1) {
      const waitSeconds = Math.pow(2, attempt + 1)
      console.log(`[chat] Rate limited. Retrying in ${waitSeconds}s...`)
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000))
      continue
    }
    break
  }

  return { reply: '', error: lastError }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // subject_id is now optional — if not provided, all active content is used
    const { session_id, subject_id, conversation_id, message, student_name } = body

    if (!session_id || !message?.trim()) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة ناقصة' },
        { status: 400 }
      )
    }

    // Rate Limiting (10 requests per minute per IP)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateLimit = checkRateLimit(ip, 10, 60000)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد المسموح به للرسائل. يرجى الانتظار قليلاً.' },
        { status: 429 }
      )
    }

    // 1. Fetch settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'تعذّر تحميل إعدادات النظام' },
        { status: 500 }
      )
    }

    if (!settings.openrouter_api_key) {
      return NextResponse.json(
        { error: 'مفتاح API غير مضبوط. يرجى التواصل مع المسؤول.' },
        { status: 500 }
      )
    }

    // 2. Fetch active content files
    // If subject_id is provided, filter by it; otherwise fetch ALL active content
    let contentQuery = supabaseAdmin
      .from('content_files')
      .select('title, content_md')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (subject_id) {
      contentQuery = contentQuery.eq('subject_id', subject_id)
    }

    const { data: contentFiles, error: contentError } = await contentQuery

    if (contentError) {
      return NextResponse.json(
        { error: 'تعذّر تحميل المحتوى الدراسي' },
        { status: 500 }
      )
    }

    // 3. Build study content (Hard limit to avoid Context Window Overflow)
    let studyContent = ''
    if (contentFiles && contentFiles.length > 0) {
      studyContent = contentFiles
        .map((f) => `## ${f.title}\n\n${f.content_md}`)
        .join('\n\n---\n\n')
      
      // Limit to max 30,000 characters
      if (studyContent.length > 30000) {
        studyContent = studyContent.substring(0, 30000) + '\n\n[تم اقتطاع باقي المحتوى لتجاوز الحد الأقصى]'
      }
    }

    // 4. Build system prompt
    const systemPrompt = studyContent
      ? `${settings.system_prompt}\n\n--- محتوى المادة الدراسية ---\n\n${studyContent}\n\n--- نهاية محتوى المادة ---\n\nأجب فقط بناءً على المحتوى أعلاه. إذا كان سؤال الطالب خارج نطاق هذا المحتوى، أخبره بلطف أنك لا تستطيع المساعدة إلا في موضوعات المادة المقررة.`
      : `${settings.system_prompt}\n\nملاحظة: لا يوجد محتوى دراسي مضاف لهذه المادة بعد.`

    // 5. Resolve / create conversation
    let convId = conversation_id
    if (!convId) {
      const { data: newConv, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({
          session_id,
          subject_id: subject_id || null,
          student_name: student_name || null,
        })
        .select()
        .single()

      if (convError || !newConv) {
        return NextResponse.json(
          { error: 'تعذّر إنشاء المحادثة' },
          { status: 500 }
        )
      }
      convId = newConv.id
    }

    // 6. Fetch conversation history
    const { data: history } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false })
      .limit(10)

    const chronoHistory = (history || []).reverse()
    let historyMessages: { role: string; content: string }[] = chronoHistory
    let historyChars = chronoHistory.reduce((sum, m) => sum + m.content.length, 0)
    while (historyChars > MAX_HISTORY_CHARS && historyMessages.length > 0) {
      const removed = historyMessages.shift()
      historyChars -= removed?.content.length ?? 0
    }

    // 7. Detect provider and call AI
    const provider = detectProvider(settings.openrouter_api_key)
    console.log(`[chat] Provider: ${provider}, Model: ${settings.model_name}`)

    let result: { reply: string; error?: string }

    if (provider === 'google') {
      result = await callGemini(
        settings.openrouter_api_key,
        settings.model_name,
        systemPrompt,
        historyMessages,
        message.trim()
      )
    } else {
      const openRouterMessages = [
        { role: 'system', content: systemPrompt },
        ...historyMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: message.trim() },
      ]
      result = await callOpenAICompatible(
        settings.openrouter_api_key,
        settings.model_name,
        openRouterMessages,
        provider as 'groq' | 'openrouter'
      )
    }

    if (!result.reply) {
      return NextResponse.json(
        { error: 'تعذّر الحصول على إجابة من نموذج الذكاء الاصطناعي. حاول مرة أخرى بعد لحظات.' },
        { status: 502 }
      )
    }

    // 8. Save messages
    const { error: insertError } = await supabaseAdmin
      .from('messages')
      .insert([
        { conversation_id: convId, role: 'user', content: message.trim() },
        { conversation_id: convId, role: 'assistant', content: result.reply },
      ])

    if (insertError) {
      console.error('Failed to save messages:', insertError)
    }

    return NextResponse.json({
      reply: result.reply,
      conversation_id: convId,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    )
  }
}
