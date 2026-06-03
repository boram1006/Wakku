import type { ReportPage } from '@/types/report'
import {
  EffectSplitPageTemplate,
  OverviewKPIPageTemplate,
  ProblemCardsPageTemplate,
  ScopePageTemplate,
  TimelinePageTemplate,
  ToBeFlowPageTemplate,
} from '@/components/sections'

interface PageRendererProps {
  page: ReportPage
  pageIndex: number
}

export function PageRenderer({ page, pageIndex }: PageRendererProps) {
  switch (page.layoutType) {
    case 'scope':
      return <ScopePageTemplate page={page} pageIndex={pageIndex} />
    case 'overview-kpi':
      return <OverviewKPIPageTemplate page={page} pageIndex={pageIndex} />
    case 'problem-cards':
      return <ProblemCardsPageTemplate page={page} pageIndex={pageIndex} />
    case 'timeline':
      return <TimelinePageTemplate page={page} pageIndex={pageIndex} />
    case 'to-be-flow':
      return <ToBeFlowPageTemplate page={page} pageIndex={pageIndex} />
    case 'effect-split':
      return <EffectSplitPageTemplate page={page} pageIndex={pageIndex} />
    default:
      return null
  }
}
