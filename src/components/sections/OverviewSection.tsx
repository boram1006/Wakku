import type { ReportPage } from '@/types/report'
import { ReportSection, ReportWrap, ReportGrid, ReportCard } from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

export function OverviewSection({ page }: { page: ReportPage }) {
  const kpis = page.blocks.filter((b) => b.type === 'kpi')

  return (
    <ReportSection id={page.id} muted={page.isMuted}>
      <ReportWrap>
        <EditableHead page={page} />
        <ReportGrid cols={3}>
          {kpis.map((block) => (
            <ReportCard key={block.id} emphasis={block.emphasis}>
              <div>
                <EditableText
                  path={{ pageId: page.id, field: 'block.value', blockId: block.id }}
                  label="KPI 숫자"
                  as="span"
                  className="report-num"
                />
                <EditableText
                  path={{ pageId: page.id, field: 'block.meta', blockId: block.id }}
                  label="KPI 단위"
                  as="span"
                  className="report-unit"
                />
              </div>
              <EditableText
                path={{ pageId: page.id, field: 'block.title', blockId: block.id }}
                label="KPI 제목"
                as="h3"
                className="report-card-title"
              />
              <EditableText
                path={{ pageId: page.id, field: 'block.body', blockId: block.id }}
                label="KPI 설명"
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
