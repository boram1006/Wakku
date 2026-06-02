import { create } from 'zustand'
import type { Report, ReportSection, ReportCardData, ReportStepData } from '@/types/report'
import type { ViewportPreset, DensityPreset } from '@/types/editor'
import { mockReport } from '@/lib/mockReport'

interface ReportStore {
  report: Report
  editMode: boolean
  viewport: ViewportPreset
  density: DensityPreset

  setEditMode: (v: boolean) => void
  setViewport: (v: ViewportPreset) => void
  setDensity: (v: DensityPreset) => void

  setSection: (id: string, partial: Partial<Pick<ReportSection, 'kicker' | 'title' | 'subtitle' | 'callout'>>) => void
  setCard: (sectionId: string, cardIdx: number, partial: Partial<ReportCardData>) => void
  setStep: (sectionId: string, stepIdx: number, partial: Partial<ReportStepData>) => void

  loadReport: (report: Report) => void
}

export const useReportStore = create<ReportStore>((set) => ({
  report: mockReport,
  editMode: false,
  viewport: '1920',
  density: 'default',

  setEditMode: (v) => set({ editMode: v }),
  setViewport: (v) => set({ viewport: v }),
  setDensity: (v) => set({ density: v }),

  setSection: (id, partial) =>
    set((state) => ({
      report: {
        ...state.report,
        sections: state.report.sections.map((s) =>
          s.id === id ? { ...s, ...partial } : s
        ),
      },
    })),

  setCard: (sectionId, cardIdx, partial) =>
    set((state) => ({
      report: {
        ...state.report,
        sections: state.report.sections.map((s) =>
          s.id === sectionId && s.cards
            ? {
                ...s,
                cards: s.cards.map((c, i) =>
                  i === cardIdx ? { ...c, ...partial } : c
                ),
              }
            : s
        ),
      },
    })),

  setStep: (sectionId, stepIdx, partial) =>
    set((state) => ({
      report: {
        ...state.report,
        sections: state.report.sections.map((s) =>
          s.id === sectionId && s.steps
            ? {
                ...s,
                steps: s.steps.map((st, i) =>
                  i === stepIdx ? { ...st, ...partial } : st
                ),
              }
            : s
        ),
      },
    })),

  loadReport: (report) => set({ report }),
}))
