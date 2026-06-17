import type { ReportPage } from '@/types/report'
import { ReportSection, ReportWrap } from '@/components/ds'
import { EditableHead } from '@/components/editor/EditableHead'
import { AsIsToBePattern } from '@/components/patterns/AsIsToBePattern'
import { ASIS_TOBE_VARIANTS } from '@/data/patternData'

interface Props { page: ReportPage; pageIndex: number }

export function AsIsToBePageTemplate({ page, pageIndex }: Props) {
  const variant = ASIS_TOBE_VARIANTS.find((v) => v.id === page.patternVariantId) ?? ASIS_TOBE_VARIANTS[0]
  const headline = page.subtitle && page.subtitle !== '이 페이지의 핵심 메시지를 입력하세요.'
    ? page.subtitle
    : variant.headline

  return (
    <ReportSection id={page.id} muted={pageIndex % 2 === 0}>
      <ReportWrap>
        <EditableHead page={page} />
        <AsIsToBePattern items={variant.items} headline={headline} />
      </ReportWrap>
    </ReportSection>
  )
}
