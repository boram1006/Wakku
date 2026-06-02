'use client'

import { useEffect } from 'react'
import { useReportStore } from '@/store/reportStore'
import { ReportNav } from '@/components/ds'
import { PageRenderer } from '@/components/PageRenderer'
import { ViewportSwitcher } from '@/components/layout/ViewportSwitcher'
import { ExportBar } from '@/components/layout/ExportBar'

const VIEWPORT_CLASS: Record<string, string> = {
  '1920': 'report-viewport-1920',
  '1440': 'report-viewport-1440',
  '1200': 'report-viewport-1200',
}

export function ReportViewer() {
  const { report, viewport } = useReportStore()

  // viewport class를 <body>에 반영
  useEffect(() => {
    const cls = VIEWPORT_CLASS[viewport]
    document.body.classList.remove(...Object.values(VIEWPORT_CLASS))
    document.body.classList.add(cls)
    return () => {
      document.body.classList.remove(cls)
    }
  }, [viewport])

  const navLinks = report.sections.map((s) => ({
    href: `#${s.id}`,
    label: s.kicker.split(' · ')[1] ?? s.kicker,
  }))

  return (
    <>
      {/* 뷰포트 전환 바 */}
      <div
        style={{
          position: 'fixed',
          top: 72,
          right: 24,
          zIndex: 100,
          display: 'flex',
          gap: 8,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--report-border)',
          borderRadius: 'var(--report-radius-md)',
          padding: '8px 12px',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--report-text-muted)',
            marginRight: 4,
          }}
        >
          Viewport
        </span>
        <ViewportSwitcher />
      </div>

      <ReportNav brand={report.brand} links={navLinks} />

      <main>
        {report.sections.map((section) => (
          <PageRenderer key={section.id} section={section} />
        ))}
      </main>

      <ExportBar />
    </>
  )
}
