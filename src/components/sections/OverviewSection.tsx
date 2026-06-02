import type { ReportSection } from '@/types/report'
import {
  ReportSection as DS,
  ReportWrap,
  ReportGrid,
  ReportCard,
} from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

interface Props {
  section: ReportSection
}

export function OverviewSection({ section }: Props) {
  const cards = section.cards ?? []

  return (
    <DS id={section.id} muted={section.isMuted}>
      <ReportWrap>
        <EditableHead section={section} />
        <ReportGrid cols={3}>
          {cards.map((card, i) => (
            <ReportCard key={i} emphasis={card.emphasis}>
              <div>
                <EditableText
                  target={{ type: 'card', sectionId: section.id, cardIdx: i, field: 'kpiNum', label: `KPI ${i + 1} 숫자`, multiline: false }}
                  as="span"
                  className="report-num"
                />
                <EditableText
                  target={{ type: 'card', sectionId: section.id, cardIdx: i, field: 'kpiUnit', label: `KPI ${i + 1} 단위`, multiline: false }}
                  as="span"
                  className="report-unit"
                />
              </div>
              <EditableText
                target={{ type: 'card', sectionId: section.id, cardIdx: i, field: 'title', label: `KPI ${i + 1} 제목`, multiline: false }}
                as="h3"
                className="report-card-title"
              />
              <EditableText
                target={{ type: 'card', sectionId: section.id, cardIdx: i, field: 'desc', label: `KPI ${i + 1} 설명`, multiline: true }}
                as="p"
                className="report-card-desc"
              />
            </ReportCard>
          ))}
        </ReportGrid>
      </ReportWrap>
    </DS>
  )
}
