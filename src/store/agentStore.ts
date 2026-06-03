import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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

const safeSessionStorage = {
  getItem: (name: string): string | null =>
    typeof window !== 'undefined' ? sessionStorage.getItem(name) : null,
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined') sessionStorage.setItem(name, value)
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(name)
  },
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set) => ({
      ...INITIAL,

      setStep: (step) => set({ step }),
      setInput: (input) => set({ input }),
      setAnalysis: (analysis) => set({ analysis }),
      setAnswer: (id, value) =>
        set((s) => ({ answers: { ...s.answers, [id]: value } })),
      setStorylines: (storylines) => set({ storylines }),
      setSelectedStorylineId: (selectedStorylineId) => set({ selectedStorylineId }),
      reset: () => set(INITIAL),
    }),
    {
      name: 'wakku-agent',
      storage: createJSONStorage(() => safeSessionStorage),
    }
  )
)
