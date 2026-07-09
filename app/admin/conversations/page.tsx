'use client'

import { useEffect, useState } from 'react'

interface Subject {
  id: string
  name: string
}

interface Conversation {
  id: string
  session_id: string
  subject_id: string | null
  created_at: string
  student_name: string | null
  subjects: { name: string } | null
  messages: [{ count: number }]
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function ConversationsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/subjects')
      .then((r) => r.json())
      .then(setSubjects)
  }, [])

  async function fetchConversations(subjectId: string) {
    setLoading(true)
    const params = subjectId !== 'all' ? `?subject_id=${subjectId}` : ''
    const res = await fetch(`/api/admin/conversations${params}`)
    const data = await res.json()
    if (res.ok) setConversations(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchConversations(selectedSubjectId)
  }, [selectedSubjectId])

  async function openConversation(id: string) {
    setSelectedConvId(id)
    setMessagesLoading(true)
    const res = await fetch(`/api/admin/conversations/${id}`)
    const data = await res.json()
    if (res.ok) setMessages(data)
    setMessagesLoading(false)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function shortSession(id: string) {
    return id.slice(0, 8) + '...'
  }

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">سجل المحادثات</h1>
        <p className="text-slate-400 text-sm mt-1">عرض جميع محادثات الطلاب</p>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">تصفية حسب المادة</label>
        <select
          id="conversations-subject-filter"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full max-w-xs px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">جميع المواد</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {/* Split View */}
      <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 overflow-hidden min-h-[600px] sm:min-h-[500px]">
        {/* List */}
        <div className="w-full sm:w-1/3 min-w-full sm:min-w-[280px] h-1/2 sm:h-auto flex flex-col bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b border-slate-700 text-slate-300 text-sm font-medium">
            {loading ? 'جارٍ التحميل...' : `${conversations.length} محادثة`}
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 && !loading ? (
              <div className="text-center py-12 text-slate-400 text-sm">لا توجد محادثات</div>
            ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    id={`conv-${conv.id}`}
                    className={`w-full text-right px-4 py-4 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors ${
                      selectedConvId === conv.id ? 'bg-purple-600/20 border-r-2 border-r-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{conv.student_name || 'طالب مجهول'}</span>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                        {conv.messages?.[0]?.count ?? 0} رسالة
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {conv.subjects?.name || 'مادة غير معروفة'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{formatDate(conv.created_at)}</div>
                  </button>
                ))
              )}
            </div>
          </div>

        {/* Message thread */}
        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                اختر محادثة من القائمة
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">جارٍ التحميل...</div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700 text-sm text-slate-300 font-medium">
                {messages.length} رسالة
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-slate-700 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      <div className="text-xs mb-1 opacity-60">
                        {msg.role === 'user' ? 'الطالب' : 'المساعد'} · {formatDate(msg.created_at)}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
