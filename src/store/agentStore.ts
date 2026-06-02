import { create } from 'zustand'
import type { ProjectInput, AnalysisResult, AgentAnswers, AgentStep } from '@/types/agent'

interface AgentStore {
  step: AgentStep
  input: ProjectInput | null
  analysis: AnalysisResult | null
  answers: AgentAnswers

  setStep: (s: AgentStep) => void
  setInput: (input: ProjectInput) => void
  setAnalysis: (a: AnalysisResult) => void
  setAnswer: (id: string, value: string) => void
  reset: () => void
}

const INITIAL: Pick<AgentStore, 'step' | 'input' | 'analysis' | 'answers'> = {
  step: 'input',
  input: null,
  analysis: null,
  answers: {},
}

export const useAgentStore = create<AgentStore>((set) => ({
  ...INITIAL,

  setStep: (step) => set({ step }),
  setInput: (input) => set({ input }),
  setAnalysis: (analysis) => set({ analysis }),
  setAnswer: (id, value) =>
    set((s) => ({ answers: { ...s.answers, [id]: value } })),
  reset: () => set(INITIAL),
}))
