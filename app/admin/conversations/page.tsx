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
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  async function handleDeleteAll() {
    setIsDeleting(true)
    const res = await fetch('/api/admin/conversations', { method: 'DELETE' })
    if (res.ok) {
      setConversations([])
      setMessages([])
      setSelectedConvId(null)
      setDeleteAllConfirm(false)
    } else {
      alert('حدث خطأ أثناء مسح المحادثات')
    }
    setIsDeleting(false)
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

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>سجل المحادثات</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>عرض جميع محادثات الطلاب</p>
        </div>
        <button
          onClick={() => setDeleteAllConfirm(true)}
          disabled={conversations.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold rounded-xl transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline">مسح السجل بالكامل</span>
          <span className="sm:hidden">مسح</span>
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>تصفية حسب المادة</label>
        <select
          id="conversations-subject-filter"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full max-w-xs px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-subtle)',
          }}
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
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full h-[calc(100vh-12rem)] min-h-[500px] max-h-[800px]">
        {/* List */}
        <div
          className="w-full sm:w-1/3 min-w-full sm:min-w-[280px] h-[45%] sm:h-full flex flex-col border rounded-2xl overflow-hidden shrink-0"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="px-4 py-3 border-b text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            {loading ? 'جارٍ التحميل...' : `${conversations.length} محادثة`}
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 && !loading ? (
              <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>لا توجد محادثات</div>
            ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    id={`conv-${conv.id}`}
                    className={`w-full text-right px-4 py-4 border-b transition-colors ${
                      selectedConvId === conv.id ? 'border-r-2 border-r-purple-500' : ''
                    }`}
                    style={{
                      borderColor: 'var(--border)',
                      background: selectedConvId === conv.id ? 'rgba(147,51,234,0.1)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (selectedConvId !== conv.id) e.currentTarget.style.background = 'var(--bg-elevated)' }}
                    onMouseLeave={(e) => { if (selectedConvId !== conv.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{conv.student_name || 'طالب مجهول'}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                        {conv.messages?.[0]?.count ?? 0} رسالة
                      </span>
                    </div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {conv.subjects?.name || 'مادة غير معروفة'}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatDate(conv.created_at)}</div>
                  </button>
                ))
              )}
            </div>
          </div>

        {/* Message thread */}
        <div className="flex-1 border rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                اختر محادثة من القائمة
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>جارٍ التحميل...</div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-3 border-b text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                {messages.length} رسالة
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                      style={
                        msg.role === 'user'
                          ? {
                              background: 'var(--user-bubble)',
                              color: 'var(--user-text)',
                              borderRadius: '1rem 0.25rem 1rem 1rem',
                            }
                          : {
                              background: '#7c3aed',
                              color: '#ffffff',
                              borderRadius: '0.25rem 1rem 1rem 1rem',
                            }
                      }
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

      {/* Delete All Confirm Modal */}
      {deleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="border rounded-2xl p-6 max-w-sm w-full shadow-2xl" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>تحذير هام!</h3>
            </div>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              هل أنت متأكد من مسح <strong>جميع</strong> المحادثات والرسائل؟ لا يمكن التراجع عن هذا الإجراء وسيفقد كل الطلاب سجل محادثاتهم.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200"
              >
                {isDeleting ? 'جارٍ المسح...' : 'مسح نهائيًا'}
              </button>
              <button
                onClick={() => setDeleteAllConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 font-semibold rounded-xl transition-all duration-200 disabled:opacity-60"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
