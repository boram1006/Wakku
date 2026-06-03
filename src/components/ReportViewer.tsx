'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useReportStore } from '@/store/reportStore'
import { useSelectedElementStore } from '@/store/selectedElementStore'
import { useAgentStore } from '@/store/agentStore'
import { ReportNav } from '@/components/ds'
import { PageRenderer } from '@/components/PageRenderer'
import { ViewportSwitcher } from '@/components/layout/ViewportSwitcher'
import { ExportBar } from '@/components/layout/ExportBar'
import { InspectorPanel } from '@/components/editor/InspectorPanel'

const VIEWPORT_CLASS: Record<string, string> = {
  '1920': 'report-viewport-1920',
  '1440': 'report-viewport-1440',
  '1200': 'report-viewport-1200',
}

export function ReportViewer() {
  const { brand, pages, viewport } = useReportStore()
  const { path, clear } = useSelectedElementStore()
  const reset = useAgentStore((s) => s.reset)
  const router = useRouter()

  useEffect(() => {
    const cls = VIEWPORT_CLASS[viewport]
    document.body.classList.remove(...Object.values(VIEWPORT_CLASS))
    document.body.classList.add(cls)
    return () => {
      document.body.classList.remove(cls)
    }
  }, [viewport])

  const navLinks = pages.map((p) => ({
    href: `#${p.id}`,
    label: p.sectionLabel,
  }))

  const panelOpen = Boolean(path)

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 72,
          right: panelOpen ? 336 : 24,
          zIndex: 100,
          display: 'flex',
          gap: 8,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--report-border)',
          borderRadius: 'var(--report-radius-md)',
          padding: '8px 12px',
          alignItems: 'center',
          transition: 'right 0.2s ease',
        }}
      >
        <button
          onClick={() => { reset(); router.push('/') }}
          style={{
            height: 28,
            padding: '0 12px',
            background: 'none',
            border: '1.5px solid var(--report-border)',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--report-text-muted)',
            cursor: 'pointer',
            marginRight: 8,
          }}
        >
          새 보고서
        </button>
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

      <ReportNav brand={brand} links={navLinks} />

      <main
        style={{
          paddingRight: panelOpen ? 320 : 0,
          transition: 'padding-right 0.2s ease',
        }}
        onClick={(e) => {
          const t = e.target as HTMLElement
          if (!t.closest('.editable-text') && !t.closest('[data-inspector]')) {
            clear()
          }
        }}
      >
        {pages.map((page) => (
          <PageRenderer key={page.id} page={page} />
        ))}
      </main>

      <InspectorPanel />
      <ExportBar />
    </>
  )
}
