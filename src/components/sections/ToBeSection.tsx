import type { ReportPage } from '@/types/report'
import { ReportSection, ReportWrap, ReportFlow, ReportStep, ReportArrow, ReportCallout } from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

export function ToBeSection({ page }: { page: ReportPage }) {
  const steps = page.blocks.filter((b) => b.type === 'flow')
  const callout = page.blocks.find((b) => b.type === 'text')

  return (
    <ReportSection id={page.id} muted={page.isMuted}>
      <ReportWrap>
        <EditableHead page={page} />
        <ReportFlow>
          {steps.flatMap((block, i) => {
            const items = [
              <ReportStep key={block.id}>
                <EditableText
                  path={{ pageId: page.id, field: 'block.meta', blockId: block.id }}
                  label="단계 번호"
                  as="div"
                  className="report-step-num"
                />
                <EditableText
                  path={{ pageId: page.id, field: 'block.title', blockId: block.id }}
                  label="단계 제목"
                  as="div"
                  className="report-step-title"
                />
                <EditableText
                  path={{ pageId: page.id, field: 'block.body', blockId: block.id }}
                  label="단계 설명"
                  as="div"
                  className="report-step-desc"
                  multiline
                />
              </ReportStep>,
            ]
            if (i < steps.length - 1) {
              items.push(<ReportArrow key={`arrow-${i}`} />)
            }
            return items
          })}
        </ReportFlow>
        {callout && (
          <ReportCallout style={{ marginTop: 28 }}>
            <EditableText
              path={{ pageId: page.id, field: 'block.body', blockId: callout.id }}
              label="결론 문구"
              as="span"
              multiline
            />
          </ReportCallout>
        )}
      </ReportWrap>
    </ReportSection>
  )
}
