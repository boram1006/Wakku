import type { Report, SectionType } from '@/types/report'

export interface ReportInput {
  brand: string
  topic: string
  messages: string[]
  sections: SectionType[]
}

// TODO: Phase 2 — transform user input into Report structure
export function parseInput(_input: ReportInput): Report {
  return { brand: '', sections: [] }
}
