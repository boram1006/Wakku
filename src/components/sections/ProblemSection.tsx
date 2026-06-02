import type { ReportSection } from '@/types/report'
import {
  ReportSection as DS,
  ReportWrap,
  ReportHead,
  ReportGrid,
  ReportCard,
  ReportLabel,
} from '@/components/ds'

interface Props {
  section: ReportSection
}

export function ProblemSection({ section }: Props) {
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
            <ReportCard key={i} emphasis={card.emphasis}>
              {card.label && <ReportLabel>{card.label}</ReportLabel>}
              <h3 className="report-card-title" style={{ marginTop: 14 }}>
                {card.title}
              </h3>
              <p className="report-card-desc">{card.desc}</p>
            </ReportCard>
          ))}
        </ReportGrid>
      </ReportWrap>
    </DS>
  )
}
