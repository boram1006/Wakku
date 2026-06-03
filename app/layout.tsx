import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kr',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wakku — 보고자료 HTML Builder',
  description: '사내 보고자료 HTML 생성 및 편집',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  )
}
