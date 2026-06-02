import type { ReportSection } from '@/types/report'
import {
  ScopeSection,
  OverviewSection,
  ProblemSection,
  TimelineSection,
  ToBeSection,
  EffectSection,
} from '@/components/sections'

interface Props {
  section: ReportSection
}

export function PageRenderer({ section }: Props) {
  switch (section.type) {
    case 'scope':
      return <ScopeSection section={section} />
    case 'overview':
      return <OverviewSection section={section} />
    case 'problem':
      return <ProblemSection section={section} />
    case 'timeline':
      return <TimelineSection section={section} />
    case 'tobe':
      return <ToBeSection section={section} />
    case 'effect':
      return <EffectSection section={section} />
    default:
      return null
  }
}
