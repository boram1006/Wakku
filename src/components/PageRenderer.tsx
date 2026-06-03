import type { ReportPage } from '@/types/report'
import {
  ScopeSection,
  OverviewSection,
  ProblemSection,
  TimelineSection,
  ToBeSection,
  EffectSection,
} from '@/components/sections'

export function PageRenderer({ page }: { page: ReportPage }) {
  switch (page.layoutType) {
    case 'scope':
      return <ScopeSection page={page} />
    case 'overview-kpi':
      return <OverviewSection page={page} />
    case 'problem-cards':
      return <ProblemSection page={page} />
    case 'timeline':
      return <TimelineSection page={page} />
    case 'to-be-flow':
      return <ToBeSection page={page} />
    case 'effect-split':
      return <EffectSection page={page} />
    default:
      return null
  }
}
