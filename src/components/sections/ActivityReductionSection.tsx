import type { ReportPage } from '@/types/report'
import { ReportSection, ReportWrap } from '@/components/ds'
import { EditableHead } from '@/components/editor/EditableHead'
import { ActivityReductionPattern } from '@/components/patterns/ActivityReductionPattern'
import { ACTIVITY_VARIANTS } from '@/data/patternData'

interface Props { page: ReportPage; pageIndex: number }

export function ActivityReductionPageTemplate({ page, pageIndex }: Props) {
  const variant = ACTIVITY_VARIANTS.find((v) => v.id === page.patternVariantId) ?? ACTIVITY_VARIANTS[0]
  // page.subtitle overrides the variant default headline (user-editable via EditableHead)
  const headline = page.subtitle && page.subtitle !== '이 페이지의 핵심 메시지를 입력하세요.'
    ? page.subtitle
    : variant.headline

  return (
    <ReportSection id={page.id} muted={pageIndex % 2 === 0}>
      <ReportWrap>
        <EditableHead page={page} />
        <ActivityReductionPattern items={variant.items} headline={headline} />
      </ReportWrap>
    </ReportSection>
  )
}
