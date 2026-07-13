'use client'

import { useEffect, useState, FormEvent } from 'react'

interface Settings {
  id: string
  openrouter_api_key: string
  model_name: string
  system_prompt: string
}

const PROVIDER_MODELS = [
  {
    provider: 'Google Gemini',
    models: ['gemini-2.5-flash', 'gemini-2.0-flash-exp'],
  },
  {
    provider: 'Groq',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
  },
  {
    provider: 'OpenRouter',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemini-2.0-flash-exp:free', 'deepseek/deepseek-chat'],
  },
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
        <div style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>الإعدادات</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>إعدادات OpenRouter والنموذج وتعليمات المساعد</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Key */}
        <div className="border rounded-2xl p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            مفتاح الـ API (مزود الذكاء الاصطناعي)
          </h2>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              أدخل مفتاح الـ API لأي من المزودين المدعومين (مُخفى جزئيًا)
            </label>
            <input
              id="settings-api-key"
              type="password"
              value={form.openrouter_api_key}
              onChange={(e) => setForm({ ...form, openrouter_api_key: e.target.value })}
              placeholder="AIza... أو gsk_... أو sk-or-..."
              autoComplete="off"
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            />
            <div className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              <p className="mb-1">يتعرف النظام تلقائياً على مزود الخدمة من خلال المفتاح:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong style={{ color: 'var(--text-secondary)' }}>Google Gemini:</strong> يبدأ بـ <code>AIza</code></li>
                <li><strong style={{ color: 'var(--text-secondary)' }}>Groq:</strong> يبدأ بـ <code>gsk_</code></li>
                <li><strong style={{ color: 'var(--text-secondary)' }}>OpenRouter:</strong> يبدأ بـ <code>sk-or-</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Model Name */}
        <div className="border rounded-2xl p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
            اسم النموذج
          </h2>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>النموذج المستخدم</label>
            <input
              id="settings-model-name"
              type="text"
              value={form.model_name}
              onChange={(e) => setForm({ ...form, model_name: e.target.value })}
              required
              dir="ltr"
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            />
            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>نماذج مقترحة حسب المزود:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROVIDER_MODELS.map((group) => (
                  <div key={group.provider} className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{group.provider}</p>
                    <div className="flex flex-col gap-1.5">
                      {group.models.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setForm({ ...form, model_name: m })}
                          className="text-[11px] text-left px-2 py-1.5 border rounded-lg transition-all font-mono truncate"
                          style={{
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-secondary)',
                            borderColor: 'var(--border-subtle)',
                          }}
                          title={m}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(147,51,234,0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
                          dir="ltr"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="border rounded-2xl p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            تعليمات النظام (System Prompt)
          </h2>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              التعليمات التي تُرسل للنموذج في كل محادثة
            </label>
            <textarea
              id="settings-system-prompt"
              value={form.system_prompt}
              onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
              rows={8}
              required
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-y"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
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
