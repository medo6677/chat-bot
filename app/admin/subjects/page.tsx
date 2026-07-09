'use client'

import { useEffect, useState, FormEvent } from 'react'

interface Subject {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  content_files: [{ count: number }]
}

type FormData = {
  name: string
  description: string
  display_order: string
}

const emptyForm: FormData = { name: '', description: '', display_order: '0' }

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  async function fetchSubjects() {
    setLoading(true)
    const res = await fetch('/api/admin/subjects')
    const data = await res.json()
    if (res.ok) setSubjects(data)
    else setError(data.error)
    setLoading(false)
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(subject: Subject) {
    setEditingId(subject.id)
    setForm({
      name: subject.name,
      description: subject.description || '',
      display_order: String(subject.display_order),
    })
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      description: form.description,
      display_order: Number(form.display_order),
    }

    const url = editingId
      ? `/api/admin/subjects/${editingId}`
      : '/api/admin/subjects'
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
      fetchSubjects()
    } else {
      const data = await res.json()
      setError(data.error || 'حدث خطأ')
    }
    setSaving(false)
  }

  async function handleToggleActive(subject: Subject) {
    await fetch(`/api/admin/subjects/${subject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !subject.is_active }),
    })
    fetchSubjects()
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDeleteConfirm(null)
      fetchSubjects()
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">المواد الدراسية</h1>
          <p className="text-slate-400 text-sm mt-1">إدارة المواد والموضوعات الدراسية</p>
        </div>
        <button
          id="add-subject-btn"
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة مادة
        </button>
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
            {editingId ? 'تعديل المادة' : 'إضافة مادة جديدة'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">اسم المادة *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: رياضيات — الفصل الأول"
                required
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">الوصف</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف مختصر للمادة (اختياري)"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">ترتيب العرض</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                min="0"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                type="submit"
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

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">جارٍ التحميل...</div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          لا توجد مواد بعد. ابدأ بإضافة مادة جديدة.
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-right">
                <th className="px-6 py-4 font-medium">المادة</th>
                <th className="px-6 py-4 font-medium">الترتيب</th>
                <th className="px-6 py-4 font-medium">الملفات</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr
                  key={subject.id}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{subject.name}</div>
                    {subject.description && (
                      <div className="text-slate-400 text-xs mt-0.5">{subject.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{subject.display_order}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1 rounded-full">
                      {subject.content_files?.[0]?.count ?? 0} ملف
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(subject)}
                      id={`toggle-subject-${subject.id}`}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        subject.is_active ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          subject.is_active ? 'translate-x-1' : '-translate-x-5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(subject)}
                        id={`edit-subject-${subject.id}`}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                        title="تعديل"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(subject.id)}
                        id={`delete-subject-${subject.id}`}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="حذف"
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

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">تأكيد الحذف</h3>
            </div>
            <p className="text-slate-300 text-sm mb-6">
              هل تريد حذف هذه المادة؟ سيتم حذف جميع الملفات التعليمية المرتبطة بها تلقائيًا ولا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                id="confirm-delete-subject-btn"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200"
              >
                حذف نهائيًا
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl transition-all duration-200"
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
