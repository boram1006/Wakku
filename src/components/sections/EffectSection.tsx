import type { ReportPage } from '@/types/report'
import { ReportSection, ReportWrap, ReportGrid, ReportCard, ReportLabel } from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

export function EffectSection({ page }: { page: ReportPage }) {
  const cards = page.blocks.filter((b) => b.type === 'card')

  return (
    <ReportSection id={page.id} muted={page.isMuted}>
      <ReportWrap>
        <EditableHead page={page} />
        <ReportGrid cols={2}>
          {cards.map((block) => (
            <ReportCard key={block.id} emphasis={block.emphasis}>
              <ReportLabel accent={block.accent}>
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
