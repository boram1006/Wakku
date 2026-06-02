// Design system registry
// MVP: AX Report Basic only
// Future: add new design systems here without breaking existing ones

export const DESIGN_SYSTEMS = {
  'ax-report-basic': {
    id: 'ax-report-basic',
    label: 'AX Report Basic',
    cssPath: '/design-system/report-design-system.css',
  },
} as const

export type DesignSystemId = keyof typeof DESIGN_SYSTEMS
