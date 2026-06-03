import type { LayoutType } from './report'

export interface ProjectInput {
  reportTitle: string
  /** 현재 상황 / 배경 / 왜 이 보고가 필요한지 */
  currentSituation?: string
  reportGoal?: string
  sourceText?: string
  avoidPoints?: string
}

export interface AgentQuestion {
  id: string
  question: string
  hint: string
  multiline: boolean
}

export interface AnalysisResult {
  detectedLayouts: LayoutType[]
  detectedKpis: string[]
  detectedProblems: string[]
  questions: AgentQuestion[]
}

export type AgentAnswers = Record<string, string>

export type AgentStep = 'input' | 'questions' | 'generating' | 'editor'
