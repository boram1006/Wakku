import type { ReportPage } from '@/types/report'
import { ReportSection, ReportWrap, ReportCard } from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

export function TimelineSection({ page }: { page: ReportPage }) {
  const rows = page.blocks.filter((b) => b.type === 'timeline')

  return (
    <ReportSection id={page.id} muted={page.isMuted}>
      <ReportWrap>
        <EditableHead page={page} />
        <ReportCard>
          {rows.map((block) => (
            <div key={block.id} className="report-split-row">
              <EditableText
                path={{ pageId: page.id, field: 'block.meta', blockId: block.id }}
                label="기간 레이블"
                as="div"
                className="report-row-label"
              />
              <EditableText
                path={{ pageId: page.id, field: 'block.body', blockId: block.id }}
                label="일정 내용"
                as="div"
                className="report-row-text"
                multiline
              />
            </div>
          ))}
        </ReportCard>
      </ReportWrap>
    </ReportSection>
  )
}
