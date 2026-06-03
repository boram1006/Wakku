import type { ReportPage } from '@/types/report'
import { ReportCard, ReportGrid, ReportLabel, ReportSection, ReportWrap } from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

interface Props {
  page: ReportPage
  pageIndex: number
}

export function EffectSplitPageTemplate({ page, pageIndex }: Props) {
  const cards = page.blocks.filter((block) => block.type === 'card')

  return (
    <ReportSection id={page.id} muted={pageIndex % 2 === 0}>
      <ReportWrap>
        <EditableHead page={page} />
        <ReportGrid cols={2}>
          {cards.map((block, index) => (
            <ReportCard key={block.id} emphasis={index === 0}>
              <ReportLabel accent={index === 0}>
                <EditableText
                  path={{ pageId: page.id, field: 'block.meta', blockId: block.id }}
                  label="레이블"
                  as="span"
                />
              </ReportLabel>
              <EditableText
                path={{ pageId: page.id, field: 'block.title', blockId: block.id }}
                label="효과 제목"
                as="h3"
                className="report-card-title"
                style={{ marginTop: 14 }}
              />
              <EditableText
                path={{ pageId: page.id, field: 'block.body', blockId: block.id }}
                label="효과 본문"
                as="p"
                className="report-card-desc"
                multiline
              />
            </ReportCard>
          ))}
        </ReportGrid>
      </ReportWrap>
    </ReportSection>
  )
}
