'use client'

import { useReportStore } from '@/store/reportStore'
import type { ViewportPreset } from '@/types/editor'

const OPTIONS: { label: string; value: ViewportPreset }[] = [
  { label: '1920', value: '1920' },
  { label: '1440', value: '1440' },
  { label: '1200', value: '1200' },
]

export function ViewportSwitcher() {
  const { viewport, setViewport } = useReportStore()

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setViewport(o.value)}
          className={viewport === o.value ? 'report-button is-active' : 'report-button'}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
