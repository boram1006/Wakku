import type { ReportData, LayoutType } from '@/types/report'

export interface ReportInput {
  brand: string
  topic: string
  messages: string[]
  layouts: LayoutType[]
}

// TODO: Phase 2 — transform user input into ReportData structure
export function parseInput(_input: ReportInput): ReportData {
  return { brand: '', pages: [] }
}
