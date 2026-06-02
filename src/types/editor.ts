export type EditTarget =
  | { sectionId: string; field: 'kicker' | 'title' | 'subtitle' | 'callout' }
  | { sectionId: string; cardIdx: number; field: 'label' | 'title' | 'desc' | 'kpiNum' | 'kpiUnit' }
  | { sectionId: string; stepIdx: number; field: 'num' | 'title' | 'desc' }

export type ViewportPreset = '1920' | '1440' | '1200'
export type DensityPreset = 'default' | 'compact' | 'presentation'
