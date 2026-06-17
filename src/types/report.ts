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
  | 'activity-reduction'
  | 'asis-tobe-transformation'

export interface ReportBlock {
  id: string
  type: 'text' | 'card' | 'kpi' | 'list' | 'timeline' | 'flow'
  title?: string
  body?: string
  value?: string
  meta?: string
  items?: string[]
}

export interface ReportPage {
  id: string
  sectionNumber: string
  sectionLabel: string
  title: string
  subtitle?: string
  layoutType: LayoutType
  blocks: ReportBlock[]
  /** For interactive pattern pages — identifies which data variant is loaded */
  patternVariantId?: string
}

export interface ReportData {
  brand: string
  pages: ReportPage[]
}

export type EditableField =
  | 'sectionLabel'
  | 'title'
  | 'subtitle'
  | 'block.title'
  | 'block.body'
  | 'block.value'
  | 'block.meta'
  | 'block.items'

export interface EditablePath {
  pageId: string
  field: EditableField
  blockId?: string
  itemIndex?: number
}

export function pathId(path: EditablePath): string {
  let id = `${path.pageId}:${path.field}`
  if (path.blockId) id += `:${path.blockId}`
  if (path.itemIndex !== undefined) id += `:${path.itemIndex}`
  return id
}
