import type { ReportSection } from '@/types/report'
import {
  ReportSection as DS,
  ReportWrap,
  ReportGrid,
  ReportCard,
  ReportLabel,
} from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

interface Props {
  section: ReportSection
}

export function EffectSection({ section }: Props) {
  const cards = section.cards ?? []

  return (
    <DS id={section.id} muted={section.isMuted}>
      <ReportWrap>
        <EditableHead section={section} />
        <ReportGrid cols={2}>
          {cards.map((card, i) => (
            <ReportCard key={i} emphasis={card.emphasis}>
              {card.label && (
                <ReportLabel accent={card.labelAccent}>
                  <EditableText
                    target={{ type: 'card', sectionId: section.id, cardIdx: i, field: 'label', label: `효과 ${i + 1} 레이블`, multiline: false }}
                    as="span"
                  />
                </ReportLabel>
              )}
              <EditableText
                target={{ type: 'card', sectionId: section.id, cardIdx: i, field: 'title', label: `효과 ${i + 1} 제목`, multiline: false }}
                as="h3"
                className="report-card-title"
                style={{ marginTop: 14 }}
              />
              <EditableText
                target={{ type: 'card', sectionId: section.id, cardIdx: i, field: 'desc', label: `효과 ${i + 1} 본문`, multiline: true }}
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
