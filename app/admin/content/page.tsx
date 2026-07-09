'use client'

import { useEffect, useState, FormEvent, useRef } from 'react'

interface Subject {
  id: string
  name: string
}

interface ContentFile {
  id: string
  subject_id: string
  title: string
  content_md: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type FormData = { title: string; content_md: string }
const emptyForm: FormData = { title: '', content_md: '' }

export default function ContentPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [files, setFiles] = useState<ContentFile[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/subjects')
      .then((r) => r.json())
      .then((data) => {
        setSubjects(data)
        if (data.length > 0) setSelectedSubjectId(data[0].id)
      })
  }, [])

  async function fetchFiles(subjectId: string) {
    if (!subjectId) return
    setLoading(true)
    const res = await fetch(`/api/admin/content?subject_id=${subjectId}`)
    const data = await res.json()
    if (res.ok) setFiles(data)
    else setError(data.error)
    setLoading(false)
  }

  useEffect(() => {
    if (selectedSubjectId) fetchFiles(selectedSubjectId)
  }, [selectedSubjectId])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, content_md: (ev.target?.result as string) || '' }))
    }
    reader.readAsText(file)
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(file: ContentFile) {
    setEditingId(file.id)
    setForm({ title: file.title, content_md: file.content_md })
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = { ...form, subject_id: selectedSubjectId }
    const url = editingId ? `/api/admin/content/${editingId}` : '/api/admin/content'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      fetchFiles(selectedSubjectId)
    } else {
      const data = await res.json()
      setError(data.error || 'حدث خطأ')
    }
    setSaving(false)
  }

  async function handleToggle(file: ContentFile) {
    await fetch(`/api/admin/content/${file.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !file.is_active }),
    })
    fetchFiles(selectedSubjectId)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDeleteConfirm(null)
      fetchFiles(selectedSubjectId)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الملفات التعليمية</h1>
          <p className="text-slate-400 text-sm mt-1">إدارة محتوى المواد الدراسية</p>
        </div>
        <button
          id="add-content-btn"
          onClick={openAdd}
          disabled={!selectedSubjectId}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة ملف
        </button>
      </div>

      {/* Subject Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">اختر المادة</label>
        <select
          id="content-subject-select"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'تعديل الملف' : 'إضافة ملف جديد'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">العنوان *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: الفصل الأول — المعادلات التربيعية"
                required
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-300">المحتوى (Markdown) *</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  رفع ملف .md
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <textarea
                value={form.content_md}
                onChange={(e) => setForm({ ...form, content_md: e.target.value })}
                placeholder="الصق محتوى Markdown هنا أو ارفع ملف..."
                required
                rows={12}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-y"
                dir="ltr"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                id="save-content-btn"
                disabled={saving}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200"
              >
                {saving ? 'جارٍ الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null) }}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl transition-all duration-200"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Files Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">جارٍ التحميل...</div>
      ) : !selectedSubjectId ? (
        <div className="text-center py-16 text-slate-400">اختر مادة أولاً</div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          لا توجد ملفات لهذه المادة بعد.
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-right">
                <th className="px-6 py-4 font-medium">العنوان</th>
                <th className="px-6 py-4 font-medium">آخر تعديل</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{file.title}</td>
                  <td className="px-6 py-4 text-slate-400">{formatDate(file.updated_at)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(file)}
                      id={`toggle-content-${file.id}`}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        file.is_active ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${file.is_active ? 'translate-x-1' : '-translate-x-5'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(file)}
                        id={`edit-content-${file.id}`}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(file.id)}
                        id={`delete-content-${file.id}`}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-3">تأكيد الحذف</h3>
            <p className="text-slate-300 text-sm mb-6">هل تريد حذف هذا الملف التعليمي نهائيًا؟</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                id="confirm-delete-content-btn"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all"
              >
                حذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl transition-all"
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
