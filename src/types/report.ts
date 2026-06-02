export type SectionType =
  | 'scope'
  | 'overview'
  | 'problem'
  | 'tobe'
  | 'effect'

export interface ReportCardData {
  label?: string
  labelAccent?: boolean
  title: string
  desc: string
  emphasis?: boolean
  kpiNum?: string
  kpiUnit?: string
}

export interface ReportStepData {
  num: string
  title: string
  desc: string
}

export interface ReportSection {
  id: string
  type: SectionType
  kicker: string
  title: string
  subtitle: string
  isMuted: boolean
  cards?: ReportCardData[]
  steps?: ReportStepData[]
  callout?: string
}

export interface Report {
  brand: string
  sections: ReportSection[]
}
