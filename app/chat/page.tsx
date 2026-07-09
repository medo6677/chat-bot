'use client'

import { useEffect, useState, useRef, FormEvent, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function ChatContent() {
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Redirect to home if no session
    if (!localStorage.getItem('session_id')) {
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, streamingId])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
    }
  }, [])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || streamingId) return

    const sessionId = localStorage.getItem('session_id')
    if (!sessionId) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const studentName = localStorage.getItem('thinky_student_name') || ''
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          conversation_id: conversationId,
          message: text,
          student_name: studentName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ أثناء الإرسال')
        setMessages((prev) => prev.slice(0, -1))
        setLoading(false)
        inputRef.current?.focus()
      } else {
        if (data.conversation_id && !conversationId) {
          setConversationId(data.conversation_id)
        }

        const fullReply: string = data.reply
        const msgId = data.message_id || Date.now().toString() + '-a'

        // Add message with empty content, stop loading dots
        setLoading(false)
        setMessages((prev) => [
          ...prev,
          { id: msgId, role: 'assistant', content: '' },
        ])
        setStreamingId(msgId)

        // Typewriter effect
        let i = 0
        // Adaptive speed: faster for long responses
        const charsPerTick = fullReply.length > 500 ? 3 : 1
        const tickMs = 18

        streamTimerRef.current = setInterval(() => {
          i += charsPerTick
          const sliced = fullReply.slice(0, i)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, content: sliced } : m
            )
          )
          if (i >= fullReply.length) {
            // Show full text in case of rounding
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId ? { ...m, content: fullReply } : m
              )
            )
            clearInterval(streamTimerRef.current!)
            streamTimerRef.current = null
            setStreamingId(null)
            inputRef.current?.focus()
          }
        }, tickMs)
      }
    } catch {
      setError('تعذّر الاتصال بالخادم')
      setMessages((prev) => prev.slice(0, -1))
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e as unknown as FormEvent)
    }
  }

  const isBusy = loading || !!streamingId

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-sm">
        <Link
          href="/"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          title="العودة"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">ثينكي</p>
          <p className="text-purple-400 text-xs">المساعد الذكي للدراسة</p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-slate-400 text-xs">متصل</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">ابدأ المذاكرة!</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                اطرح أي سؤال وسأجيبك بناءً على محتوى المادة الدراسية.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-purple-800 flex items-center justify-center shrink-0 ms-3 self-end mb-1">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[90%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white rounded-tr-sm'
                  : 'bg-purple-600 text-white rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">
                {msg.content}
                {/* Blinking cursor on the streaming message */}
                {msg.id === streamingId && (
                  <span className="inline-block w-0.5 h-4 bg-white/80 ml-0.5 align-middle animate-pulse" />
                )}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-end items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-purple-800 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="bg-purple-600 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <span className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 inline-block">
              {error}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-900 border-t border-slate-800 px-3 sm:px-4 py-3 sm:py-4">
        <form onSubmit={handleSend} className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isBusy ? 'ثينكي يفكر...' : 'اكتب سؤالك هنا...'}
            rows={1}
            disabled={isBusy}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-60 text-sm leading-relaxed overflow-y-auto max-h-32"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            type="submit"
            id="chat-send-btn"
            disabled={isBusy || !input.trim()}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-slate-500 text-xs text-center mt-2">اضغط Enter للإرسال، Shift+Enter لسطر جديد</p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-400">
        جارٍ التحميل...
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
