import { create } from 'zustand'
import type { Report, ReportSection, ReportCardData, ReportStepData, TimelineRowData } from '@/types/report'
import type { SelectionTarget, ViewportPreset, DensityPreset } from '@/types/editor'
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
  setRow: (sectionId: string, rowIdx: number, partial: Partial<TimelineRowData>) => void

  getValueByTarget: (target: SelectionTarget) => string
  setValueByTarget: (target: SelectionTarget, value: string) => void

  loadReport: (report: Report) => void
}

export const useReportStore = create<ReportStore>((set, get) => ({
  report: mockReport,
  editMode: true,
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

  setRow: (sectionId, rowIdx, partial) =>
    set((state) => ({
      report: {
        ...state.report,
        sections: state.report.sections.map((s) =>
          s.id === sectionId && s.rows
            ? {
                ...s,
                rows: s.rows.map((r, i) =>
                  i === rowIdx ? { ...r, ...partial } : r
                ),
              }
            : s
        ),
      },
    })),

  getValueByTarget: (target) => {
    const { report } = get()
    const section = report.sections.find((s) => s.id === target.sectionId)
    if (!section) return ''

    switch (target.type) {
      case 'section':
        return (section[target.field] as string | undefined) ?? ''
      case 'card':
        return String((section.cards?.[target.cardIdx]?.[target.field]) ?? '')
      case 'step':
        return String((section.steps?.[target.stepIdx]?.[target.field]) ?? '')
      case 'row':
        return String((section.rows?.[target.rowIdx]?.[target.field]) ?? '')
    }
  },

  setValueByTarget: (target, value) => {
    const { setSection, setCard, setStep, setRow } = get()
    switch (target.type) {
      case 'section':
        setSection(target.sectionId, { [target.field]: value })
        break
      case 'card':
        setCard(target.sectionId, target.cardIdx, { [target.field]: value })
        break
      case 'step':
        setStep(target.sectionId, target.stepIdx, { [target.field]: value })
        break
      case 'row':
        setRow(target.sectionId, target.rowIdx, { [target.field]: value })
        break
    }
  },

  loadReport: (report) => set({ report }),
}))
