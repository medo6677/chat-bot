'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface HistoryItem {
  id: string
  created_at: string
  student_name: string | null
  message_count: number
  messages?: Message[]
  expanded?: boolean
  loadingMessages?: boolean
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id')
    if (!sessionId) {
      setLoading(false)
      return
    }

    fetch(`/api/student/history?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data.map((item) => ({ ...item, expanded: false })))
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  async function toggleExpand(item: HistoryItem) {
    if (item.expanded) {
      // collapse
      setHistory((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, expanded: false } : h))
      )
      return
    }

    // If already loaded, just expand
    if (item.messages) {
      setHistory((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, expanded: true } : h))
      )
      return
    }

    // Start loading
    setHistory((prev) =>
      prev.map((h) =>
        h.id === item.id ? { ...h, expanded: true, loadingMessages: true } : h
      )
    )

    try {
      const res = await fetch(`/api/student/history?conversation_id=${item.id}`)
      const data = await res.json()
      setHistory((prev) =>
        prev.map((h) =>
          h.id === item.id
            ? { ...h, messages: data.messages || [], loadingMessages: false }
            : h
        )
      )
    } catch {
      setHistory((prev) =>
        prev.map((h) =>
          h.id === item.id ? { ...h, loadingMessages: false } : h
        )
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">
              سجل محادثاتي
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              اضغط على أي محادثة لعرض تفاصيلها
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              محادثة جديدة
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              الرئيسية
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-400">جارٍ تحميل السجل...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg mb-4">لا يوجد لديك أي محادثات سابقة</p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
            >
              ابدأ أول محادثة ✨
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                {/* Card Header — clickable */}
                <button
                  onClick={() => toggleExpand(item)}
                  className="w-full text-right p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-white font-semibold text-sm">جلسة مذاكرة</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {item.message_count} رسائل •{' '}
                        {new Date(item.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      item.expanded ? 'rotate-90' : '-rotate-90'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Expanded Messages */}
                {item.expanded && (
                  <div className="border-t border-slate-800">
                    {item.loadingMessages ? (
                      <div className="py-8 text-center text-slate-400 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    ) : !item.messages || item.messages.length === 0 ? (
                      <p className="py-6 text-center text-slate-500 text-sm">لا توجد رسائل محفوظة</p>
                    ) : (
                      <div className="p-4 sm:p-5 space-y-3 max-h-96 overflow-y-auto">
                        {item.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-slate-800 text-white rounded-tr-sm'
                                  : 'bg-purple-600 text-white rounded-tl-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Continue button */}
                    <div className="px-4 sm:px-5 pb-4 pt-2">
                      <Link
                        href="/chat"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        ابدأ محادثة جديدة
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
