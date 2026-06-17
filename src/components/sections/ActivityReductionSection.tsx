import type { ReportPage } from '@/types/report'
import { ReportSection, ReportWrap } from '@/components/ds'
import { EditableHead } from '@/components/editor/EditableHead'
import { ActivityReductionPattern } from '@/components/patterns/ActivityReductionPattern'
import { SAMPLE_ACTIVITY_ITEMS } from '@/data/patternData'

interface Props { page: ReportPage; pageIndex: number }

export function ActivityReductionPageTemplate({ page, pageIndex }: Props) {
  return (
    <ReportSection id={page.id} muted={pageIndex % 2 === 0}>
      <ReportWrap>
        <EditableHead page={page} />
        <ActivityReductionPattern items={SAMPLE_ACTIVITY_ITEMS} />
      </ReportWrap>
    </ReportSection>
  )
}
