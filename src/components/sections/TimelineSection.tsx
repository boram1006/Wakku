import type { ReportSection } from '@/types/report'
import {
  ReportSection as DS,
  ReportWrap,
  ReportHead,
  ReportCard,
  ReportSplitRow,
} from '@/components/ds'

interface Props {
  section: ReportSection
}

export function TimelineSection({ section }: Props) {
  const rows = section.rows ?? []

  return (
    <DS id={section.id} muted={section.isMuted}>
      <ReportWrap>
        <ReportHead
          kicker={section.kicker}
          title={section.title}
          subtitle={section.subtitle}
        />
        <ReportCard>
          {rows.map((row, i) => (
            <ReportSplitRow key={i} label={row.label} text={row.text} />
          ))}
        </ReportCard>
      </ReportWrap>
    </DS>
  )
}
