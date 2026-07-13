import StudentEntry from '@/app/SubjectCards'
import ThemeToggle from '@/app/ThemeToggle'

export default function HomePage() {
  return (
    <main
      className="min-h-screen relative"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle Button — top left */}
      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8 sm:mb-12 w-full max-w-xs sm:max-w-sm mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-linear-to-br from-purple-600 to-purple-800 shadow-2xl shadow-purple-500/30 mb-5">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>ثينكي</h1>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            مساعدك الذكي للدراسة - يجيب على أسئلتك  - يقدم لك  شرح و حلول و مراجعات 

          </p>
        </div>

        {/* Student Entry (name modal + start button) */}
        <StudentEntry />
      </div>
    </main>
  )
}
