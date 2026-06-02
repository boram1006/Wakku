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
  const { report, viewport } = useReportStore()
  const { target, clear } = useSelectedElementStore()
  const reset = useAgentStore((s) => s.reset)
  const router = useRouter()

  // Apply viewport class to body
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

  const panelOpen = Boolean(target)

  return (
    <>
      {/* Viewport switcher bar */}
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

      <ReportNav brand={report.brand} links={navLinks} />

      {/* Backdrop click to deselect */}
      {panelOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 190,
            pointerEvents: 'none',
          }}
        />
      )}

      <main
        style={{
          paddingRight: panelOpen ? 320 : 0,
          transition: 'padding-right 0.2s ease',
        }}
        onClick={(e) => {
          // Deselect when clicking the main area (not an editable element)
          const target = e.target as HTMLElement
          if (!target.closest('.editable-text') && !target.closest('[data-inspector]')) {
            clear()
          }
        }}
      >
        {report.sections.map((section) => (
          <PageRenderer key={section.id} section={section} />
        ))}
      </main>

      <InspectorPanel />
      <ExportBar />
    </>
  )
}
