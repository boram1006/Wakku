import type { ReportCardData, ReportStepData, TimelineRowData } from './report'

export type SelectionTarget =
  | {
      type: 'section'
      sectionId: string
      field: 'kicker' | 'title' | 'subtitle' | 'callout'
      label: string
      multiline: boolean
    }
  | {
      type: 'card'
      sectionId: string
      cardIdx: number
      field: keyof ReportCardData
      label: string
      multiline: boolean
    }
  | {
      type: 'step'
      sectionId: string
      stepIdx: number
      field: keyof ReportStepData
      label: string
      multiline: boolean
    }
  | {
      type: 'row'
      sectionId: string
      rowIdx: number
      field: keyof TimelineRowData
      label: string
      multiline: boolean
    }

export function selectionId(target: SelectionTarget): string {
  switch (target.type) {
    case 'section':
      return `section:${target.sectionId}:${target.field}`
    case 'card':
      return `card:${target.sectionId}:${target.cardIdx}:${target.field}`
    case 'step':
      return `step:${target.sectionId}:${target.stepIdx}:${target.field}`
    case 'row':
      return `row:${target.sectionId}:${target.rowIdx}:${target.field}`
  }
}

export type ViewportPreset = '1920' | '1440' | '1200'
export type DensityPreset = 'default' | 'compact' | 'presentation'
