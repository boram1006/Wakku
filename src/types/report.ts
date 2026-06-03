export type LayoutType =
  | 'cover'
  | 'scope'
  | 'overview-kpi'
  | 'problem-cards'
  | 'execution-plan'
  | 'effect-split'
  | 'to-be-flow'
  | 'timeline'
  | 'discussion-cards'
  | 'rr'

export type BlockType = 'text' | 'card' | 'kpi' | 'list' | 'timeline' | 'flow'

export interface ReportBlock {
  id: string
  type: BlockType
  title?: string
  body?: string
  /** kpi: 숫자값 ("42") */
  value?: string
  /** kpi: 단위 ("h"), card/flow: 레이블, timeline: 기간 레이블 */
  meta?: string
  items?: string[]
  /** 강조 카드 여부 */
  emphasis?: boolean
  /** 레이블 accent 색상 */
  accent?: boolean
}

export interface ReportPage {
  id: string
  sectionNumber: string   // "01", "02", …
  sectionLabel: string    // "보고 범위", "개요", …
  title: string
  subtitle?: string
  layoutType: LayoutType
  isMuted?: boolean
  blocks: ReportBlock[]
}

export interface ReportData {
  brand: string
  pages: ReportPage[]
}
