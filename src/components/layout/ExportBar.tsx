'use client'

import { useReportStore } from '@/store/reportStore'
import { downloadHtml } from '@/export/htmlExporter'

export function ExportBar() {
  const brand = useReportStore((s) => s.brand)
  const pages = useReportStore((s) => s.pages)

  const handleExport = () => {
    downloadHtml({ brand, pages })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button className="report-button" onClick={handleExport}>HTML 내보내기</button>
    </div>
  )
}
