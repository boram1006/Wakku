import type { ReportPage } from '@/types/report'
import { ReportCard, ReportGrid, ReportSection, ReportWrap } from '@/components/ds'
import { EditableText } from '@/components/editor/EditableText'
import { EditableHead } from '@/components/editor/EditableHead'

interface Props {
  page: ReportPage
  pageIndex: number
}

export function OverviewKPIPageTemplate({ page, pageIndex }: Props) {
  const kpis = page.blocks.filter((block) => block.type === 'kpi')

  return (
    <ReportSection id={page.id} muted={pageIndex % 2 === 0}>
      <ReportWrap>
        <EditableHead page={page} />
        <ReportGrid cols={3}>
          {kpis.map((block, index) => (
            <ReportCard key={block.id} emphasis={index === 1}>
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
