import type { ReportSection } from '@/types/report'

interface Props {
  section: ReportSection
}

export function EffectSection({ section }: Props) {
  return <div data-section-id={section.id} data-section-type="effect" />
}
