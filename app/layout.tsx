import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#7e22ce',
}

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ثينكي — المساعد الدراسي الذكي',
  description:
    'منصة ثينكي للدردشة مع المساعد الذكي المخصص للمواد الدراسية. يساعدك في المذاكرة، مراجعة المحتوى، وطرح الأسئلة بسهولة.',
  keywords: ['مساعد ذكي', 'تعليم', 'مذاكرة', 'ذكاء اصطناعي', 'شات بوت', 'دراسة'],
  authors: [{ name: 'Thinky AI' }],
  openGraph: {
    title: 'ثينكي — المساعد الدراسي الذكي',
    description: 'تحدث مع المساعد الذكي للمواد الدراسية واجعل مذاكرتك أسهل وأكثر تفاعلية.',
    url: 'https://thinky-chatbot.vercel.app',
    siteName: 'ثينكي (Thinky)',
    locale: 'ar_EG',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} min-h-screen`}>{children}</body>
    </html>
  )
}
