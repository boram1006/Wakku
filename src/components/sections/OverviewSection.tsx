import type { ReportSection } from '@/types/report'

interface Props {
  section: ReportSection
}

export function OverviewSection({ section }: Props) {
  return <div data-section-id={section.id} data-section-type="overview" />
}
