import type { Report } from '@/types/report'

// TODO: Phase 3 — serialize Report state to standalone HTML string
export function exportToHtml(_report: Report): string {
  return ''
}

export function downloadHtml(html: string, filename = 'report.html') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
