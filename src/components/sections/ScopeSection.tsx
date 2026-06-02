import type { ReportSection } from '@/types/report'

interface Props {
  section: ReportSection
}

// TODO: Phase 2 — full implementation with EditableText
export function ScopeSection({ section }: Props) {
  return <div data-section-id={section.id} data-section-type="scope" />
}
