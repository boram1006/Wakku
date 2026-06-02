import type { ReportSection } from '@/types/report'
import {
  ReportSection as DS,
  ReportWrap,
  ReportCard,
} from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

interface Props {
  section: ReportSection
}

export function TimelineSection({ section }: Props) {
  const rows = section.rows ?? []

  return (
    <DS id={section.id} muted={section.isMuted}>
      <ReportWrap>
        <EditableHead section={section} />
        <ReportCard>
          {rows.map((_, i) => (
            <div key={i} className="report-split-row">
              <EditableText
                target={{ type: 'row', sectionId: section.id, rowIdx: i, field: 'label', label: `일정 ${i + 1} 구분`, multiline: false }}
                as="div"
                className="report-row-label"
              />
              <EditableText
                target={{ type: 'row', sectionId: section.id, rowIdx: i, field: 'text', label: `일정 ${i + 1} 내용`, multiline: true }}
                as="div"
                className="report-row-text"
              />
            </div>
          ))}
        </ReportCard>
      </ReportWrap>
    </DS>
  )
}
