'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export default function StudentEntry() {
  const router = useRouter()
  const [studentName, setStudentName] = useState<string>('')
  const [showModal, setShowModal] = useState<boolean>(false)
  const [tempName, setTempName] = useState<string>('')

  useEffect(() => {
    // Ensure session_id exists
    if (!localStorage.getItem('session_id')) {
      localStorage.setItem('session_id', uuidv4())
    }
    const savedName = localStorage.getItem('thinky_student_name')
    if (savedName) {
      setStudentName(savedName)
    } else {
      setShowModal(true)
    }
  }, [])

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!tempName.trim()) return
    localStorage.setItem('thinky_student_name', tempName.trim())
    setStudentName(tempName.trim())
    setShowModal(false)
  }

  return (
    <>
      {/* Name Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-8 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">أهلاً بك في ثينكي! 👋</h2>
            <p className="text-slate-400 text-xs sm:text-sm text-center mb-5 sm:mb-6">
              يرجى إدخال اسمك للبدء في المذاكرة.
            </p>
            <form onSubmit={handleSaveName} className="space-y-4">
              <input
                type="text"
                required
                placeholder="اسمك الكامل أو الأول..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!tempName.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
              >
                حفظ والبدء
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Actions (shown after name is saved) */}
      {studentName && !showModal && (
        <div className="w-full max-w-xs text-center space-y-4">
          <div className="mb-2">
            <p className="text-slate-400 text-sm mb-1">مرحباً،</p>
            <p className="text-2xl font-bold text-white">{studentName} 👋</p>
          </div>

          <button
            id="start-chat-btn"
            onClick={() => router.push('/chat')}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            ابدأ المذاكرة ✨
          </button>

          <button
            id="history-btn"
            onClick={() => router.push('/history')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            سجل محادثاتي
          </button>
        </div>
      )}
    </>
  )
}
