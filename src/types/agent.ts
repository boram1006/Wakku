import type { SectionType } from './report'

export interface ProjectInput {
  reportTitle: string
  reportContext?: string
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
  detectedSections: SectionType[]
  detectedKpis: string[]
  detectedProblems: string[]
  questions: AgentQuestion[]
}

export type AgentAnswers = Record<string, string>

export type AgentStep = 'input' | 'questions' | 'generating' | 'editor'
