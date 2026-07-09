'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface HistoryItem {
  id: string
  created_at: string
  subject_id: string
  subject_name: string
  student_name: string | null
  message_count: number
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
          setHistory(data)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">سجل محادثاتي</h1>
            <p className="text-sm sm:text-base text-slate-400">جميع المحادثات التي قمت بها مع المساعد الذكي</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            العودة للرئيسية
          </Link>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-400">جارٍ تحميل السجل...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg">لا يوجد لديك أي محادثات سابقة</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <Link
                key={item.id}
                href="/chat"
                className="block bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 sm:p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      جلسة مذاكرة
                    </h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {item.message_count} رسائل متبادلة
                    </p>
                  </div>
                  <div className="text-left w-full sm:w-auto flex flex-row-reverse sm:flex-col justify-between sm:justify-start items-center sm:items-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-800 sm:border-0">
                    <span className="inline-block px-2.5 py-1 sm:px-3 sm:py-1 bg-slate-800 text-slate-300 rounded-lg text-xs sm:text-sm font-medium mb-0 sm:mb-2">
                      {new Date(item.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="text-purple-400 text-sm font-medium flex items-center gap-1">
                      إكمال المذاكرة
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
