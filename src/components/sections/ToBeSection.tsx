import type { ReportSection } from '@/types/report'
import {
  ReportSection as DS,
  ReportWrap,
  ReportFlow,
  ReportStep,
  ReportArrow,
  ReportCallout,
} from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

interface Props {
  section: ReportSection
}

export function ToBeSection({ section }: Props) {
  const steps = section.steps ?? []

  return (
    <DS id={section.id} muted={section.isMuted}>
      <ReportWrap>
        <EditableHead section={section} />
        <ReportFlow>
          {steps.flatMap((_, i) => {
            const items = [
              <div key={`step-${i}`} className="report-step">
                <EditableText
                  target={{ type: 'step', sectionId: section.id, stepIdx: i, field: 'num', label: `단계 ${i + 1} 번호`, multiline: false }}
                  as="div"
                  className="report-step-num"
                />
                <EditableText
                  target={{ type: 'step', sectionId: section.id, stepIdx: i, field: 'title', label: `단계 ${i + 1} 제목`, multiline: false }}
                  as="div"
                  className="report-step-title"
                />
                <EditableText
                  target={{ type: 'step', sectionId: section.id, stepIdx: i, field: 'desc', label: `단계 ${i + 1} 설명`, multiline: true }}
                  as="div"
                  className="report-step-desc"
                />
              </div>,
            ]
            if (i < steps.length - 1) {
              items.push(<ReportArrow key={`arrow-${i}`} />)
            }
            return items
          })}
        </ReportFlow>
        {section.callout && (
          <ReportCallout style={{ marginTop: 28 }}>
            <EditableText
              target={{ type: 'section', sectionId: section.id, field: 'callout', label: '결론 문구', multiline: true }}
              as="span"
            />
          </ReportCallout>
        )}
      </ReportWrap>
    </DS>
  )
}
