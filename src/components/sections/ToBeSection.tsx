import type { ReportPage } from '@/types/report'
import { ReportArrow, ReportCallout, ReportFlow, ReportSection, ReportStep, ReportWrap } from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

interface Props {
  page: ReportPage
  pageIndex: number
}

export function ToBeFlowPageTemplate({ page, pageIndex }: Props) {
  const steps = page.blocks.filter((block) => block.type === 'flow')
  const callout = page.blocks.find((block) => block.type === 'text')

  return (
    <ReportSection id={page.id} muted={pageIndex % 2 === 0}>
      <ReportWrap>
        <EditableHead page={page} />
        <ReportFlow>
          {steps.flatMap((block, index) => {
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

            if (index < steps.length - 1) {
              items.push(<ReportArrow key={`arrow-${index}`} />)
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
