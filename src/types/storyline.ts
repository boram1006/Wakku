import type { LayoutType } from './report'
import type { AnalysisResult } from './agent'

export type StorylineType =
  | 'decision'
  | 'roi'
  | 'problem-solution'
  | 'execution'
  | 'demo'
  | 'alignment'
  | 'risk-control'
  | 'scope-clarification'

export type StorylinePageRole =
  | 'hook'
  | 'context'
  | 'scope'
  | 'problem'
  | 'evidence'
  | 'decision'
  | 'solution'
  | 'effect'
  | 'to-be'
  | 'execution'
  | 'risk'
  | 'next-step'
  | 'appendix'

export interface StorylinePagePlan {
  id: string
  order: number
  role: StorylinePageRole
  message: string
  suggestedLayoutType: LayoutType
}

export interface Storyline {
  id: string
  name: string
  type: StorylineType
  oneLineSummary: string
  recommendedReason: string
  keyMessage: string
  narrativeFlow: string[]
  pagePlan: StorylinePagePlan[]
}

/** AnalysisResult의 storyline 컨텍스트 내 의미론적 alias */
export type SourceAnalysis = AnalysisResult
