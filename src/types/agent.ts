import type { LayoutType } from './report'

export interface ProjectInput {
  reportTitle: string
  reportContext?: string
  reportGoal?: string
  referenceMaterial?: string
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

export type AgentStep = 'input' | 'analysis' | 'storyline' | 'questions' | 'generating' | 'editor'
