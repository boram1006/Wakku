import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wakku — 보고자료 HTML Builder',
  description: '사내 보고자료 HTML 생성 및 편집',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
