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

export type ViewportPreset = '1920' | '1440' | '1200'
export type DensityPreset = 'default' | 'compact' | 'presentation'
