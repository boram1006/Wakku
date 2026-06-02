import type { ReportSection } from '@/types/report'
import {
  ReportSection as DS,
  ReportWrap,
  ReportHead,
  ReportGrid,
  ReportKpiCard,
} from '@/components/ds'

interface Props {
  section: ReportSection
}

export function OverviewSection({ section }: Props) {
  const cards = section.cards ?? []

  return (
    <DS id={section.id} muted={section.isMuted}>
      <ReportWrap>
        <ReportHead
          kicker={section.kicker}
          title={section.title}
          subtitle={section.subtitle}
        />
        <ReportGrid cols={3}>
          {cards.map((card, i) => (
            <ReportKpiCard
              key={i}
              num={card.kpiNum ?? '—'}
              unit={card.kpiUnit ?? ''}
              title={card.title}
              desc={card.desc}
              emphasis={card.emphasis}
            />
          ))}
        </ReportGrid>
      </ReportWrap>
    </DS>
  )
}
