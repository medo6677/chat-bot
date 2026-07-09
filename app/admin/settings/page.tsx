'use client'

import { useEffect, useState, FormEvent } from 'react'

interface Settings {
  id: string
  openrouter_api_key: string
  model_name: string
  system_prompt: string
}

const MODEL_EXAMPLES = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-7b-instruct:free',
  'deepseek/deepseek-chat',
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [form, setForm] = useState({ openrouter_api_key: '', model_name: '', system_prompt: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setForm({
          openrouter_api_key: data.openrouter_api_key || '',
          model_name: data.model_name || '',
          system_prompt: data.system_prompt || '',
        })
        setLoading(false)
      })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: settings?.id }),
    })

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      const data = await res.json()
      setError(data.error || 'حدث خطأ أثناء الحفظ')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-slate-400">جارٍ التحميل...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <p className="text-slate-400 text-sm mt-1">إعدادات OpenRouter والنموذج وتعليمات المساعد</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Key */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            مفتاح OpenRouter API
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              مفتاح API (مُخفى جزئيًا)
            </label>
            <input
              id="settings-api-key"
              type="password"
              value={form.openrouter_api_key}
              onChange={(e) => setForm({ ...form, openrouter_api_key: e.target.value })}
              placeholder="sk-or-v1-..."
              autoComplete="off"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
            <p className="text-slate-400 text-xs mt-1.5">
              احصل على مفتاحك من{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
                dir="ltr"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>
        </div>

        {/* Model Name */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
            اسم النموذج
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">النموذج المستخدم</label>
            <input
              id="settings-model-name"
              type="text"
              value={form.model_name}
              onChange={(e) => setForm({ ...form, model_name: e.target.value })}
              required
              dir="ltr"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
            <div className="mt-2">
              <p className="text-slate-400 text-xs mb-2">نماذج مجانية مقترحة:</p>
              <div className="flex flex-wrap gap-2">
                {MODEL_EXAMPLES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, model_name: m })}
                    className="text-xs px-3 py-1 bg-slate-700 hover:bg-purple-600/30 border border-slate-600 hover:border-purple-500 rounded-lg text-slate-300 hover:text-white transition-all font-mono"
                    dir="ltr"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            تعليمات النظام (System Prompt)
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              التعليمات التي تُرسل للنموذج في كل محادثة
            </label>
            <textarea
              id="settings-system-prompt"
              value={form.system_prompt}
              onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
              rows={8}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-y"
            />
            <p className="text-slate-400 text-xs mt-1.5">
              سيُضاف محتوى المادة الدراسية تلقائيًا بعد هذا النص في كل محادثة.
            </p>
          </div>
        </div>

        <button
          type="submit"
          id="save-settings-btn"
          disabled={saving}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5"
        >
          {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  )
}
