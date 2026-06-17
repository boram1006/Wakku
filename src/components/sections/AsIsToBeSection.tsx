import type { ReportPage } from '@/types/report'
import { ReportSection, ReportWrap } from '@/components/ds'
import { EditableHead } from '@/components/editor/EditableHead'
import { AsIsToBePattern } from '@/components/patterns/AsIsToBePattern'
import { SAMPLE_ASIS_TOBE_ITEMS } from '@/data/patternData'

interface Props { page: ReportPage; pageIndex: number }

export function AsIsToBePageTemplate({ page, pageIndex }: Props) {
  return (
    <ReportSection id={page.id} muted={pageIndex % 2 === 0}>
      <ReportWrap>
        <EditableHead page={page} />
        <AsIsToBePattern items={SAMPLE_ASIS_TOBE_ITEMS} />
      </ReportWrap>
    </ReportSection>
  )
}
