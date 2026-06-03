import { create } from 'zustand'
import type { ProjectInput, AnalysisResult, AgentAnswers, AgentStep } from '@/types/agent'
import type { Storyline } from '@/types/storyline'

interface AgentStore {
  step: AgentStep
  input: ProjectInput | null
  analysis: AnalysisResult | null
  answers: AgentAnswers
  storylines: Storyline[]
  selectedStorylineId: string | null

  setStep: (s: AgentStep) => void
  setInput: (input: ProjectInput) => void
  setAnalysis: (a: AnalysisResult) => void
  setAnswer: (id: string, value: string) => void
  setStorylines: (s: Storyline[]) => void
  setSelectedStorylineId: (id: string | null) => void
  reset: () => void
}

const INITIAL: Pick<AgentStore, 'step' | 'input' | 'analysis' | 'answers' | 'storylines' | 'selectedStorylineId'> = {
  step: 'input',
  input: null,
  analysis: null,
  answers: {},
  storylines: [],
  selectedStorylineId: null,
}

export const useAgentStore = create<AgentStore>((set) => ({
  ...INITIAL,

  setStep: (step) => set({ step }),
  setInput: (input) => set({ input }),
  setAnalysis: (analysis) => set({ analysis }),
  setAnswer: (id, value) =>
    set((s) => ({ answers: { ...s.answers, [id]: value } })),
  setStorylines: (storylines) => set({ storylines }),
  setSelectedStorylineId: (selectedStorylineId) => set({ selectedStorylineId }),
  reset: () => set(INITIAL),
}))
