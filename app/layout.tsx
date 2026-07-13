import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import ThemeProvider from './ThemeProvider'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ثينكي — المساعد الدراسي الذكي',
    template: '%s | ثينكي',
  },
  description:
    'ثينكي مساعدك الذكي للدراسة — يجيب على أسئلتك بناءً على محتوى المادة الدراسية مباشرةً وبدون تشتيت.',
  keywords: ['ثينكي', 'مساعد ذكي', 'دراسة', 'تعليم', 'chatbot', 'AI'],
  authors: [{ name: 'Thinky Team' }],
  creator: 'Thinky',
  metadataBase: new URL('https://chat-bot-xi-two.vercel.app'),
  openGraph: {
    title: 'ثينكي — المساعد الدراسي الذكي',
    description: 'اسأل ثينكي أي سؤال وسيجاوبك من محتوى مادتك الدراسية فقط',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ثينكي — المساعد الدراسي الذكي',
    description: 'اسأل ثينكي أي سؤال وسيجاوبك من محتوى مادتك الدراسية فقط',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} min-h-screen`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
