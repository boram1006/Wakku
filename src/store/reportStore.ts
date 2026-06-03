import { create } from 'zustand'
import type { ReportData, ReportPage, ReportBlock, LayoutType } from '@/types/report'
import type { EditablePath, ViewportPreset, DensityPreset } from '@/types/editor'
import { mockReport } from '@/lib/mockReport'

interface ReportStore {
  brand: string
  pages: ReportPage[]
  editMode: boolean
  viewport: ViewportPreset
  density: DensityPreset

  // ── Page CRUD ──────────────────────────────────────────────────────────────
  setPages: (pages: ReportPage[]) => void
  updatePage: (pageId: string, patch: Partial<Omit<ReportPage, 'id' | 'blocks'>>) => void
  addPage: (page: ReportPage, afterId?: string) => void
  removePage: (pageId: string) => void
  movePage: (fromIndex: number, toIndex: number) => void
  changeLayoutType: (pageId: string, layoutType: LayoutType) => void

  // ── Block CRUD ─────────────────────────────────────────────────────────────
  updateBlock: (pageId: string, blockId: string, patch: Partial<Omit<ReportBlock, 'id'>>) => void
  updateBlockItem: (pageId: string, blockId: string, itemIndex: number, value: string) => void

  // ── Editor helpers ─────────────────────────────────────────────────────────
  getValueByPath: (path: EditablePath) => string
  setValueByPath: (path: EditablePath, value: string) => void

  // ── Settings ───────────────────────────────────────────────────────────────
  setEditMode: (v: boolean) => void
  setViewport: (v: ViewportPreset) => void
  setDensity: (v: DensityPreset) => void

  // ── Report load ────────────────────────────────────────────────────────────
  loadReport: (data: ReportData) => void
}

export const useReportStore = create<ReportStore>((set, get) => ({
  brand: mockReport.brand,
  pages: mockReport.pages,
  editMode: true,
  viewport: '1920',
  density: 'default',

  setPages: (pages) => set({ pages }),

  updatePage: (pageId, patch) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p)),
    })),

  addPage: (page, afterId) =>
    set((s) => {
      if (!afterId) return { pages: [...s.pages, page] }
      const idx = s.pages.findIndex((p) => p.id === afterId)
      const next = [...s.pages]
      next.splice(idx + 1, 0, page)
      return { pages: next }
    }),

  removePage: (pageId) =>
    set((s) => ({ pages: s.pages.filter((p) => p.id !== pageId) })),

  movePage: (fromIndex, toIndex) =>
    set((s) => {
      const next = [...s.pages]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { pages: next }
    }),

  changeLayoutType: (pageId, layoutType) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === pageId ? { ...p, layoutType } : p)),
    })),

  updateBlock: (pageId, blockId, patch) =>
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id !== pageId ? p : {
          ...p,
          blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
        }
      ),
    })),

  updateBlockItem: (pageId, blockId, itemIndex, value) =>
    set((s) => ({
      pages: s.pages.map((p) => {
        if (p.id !== pageId) return p
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id !== blockId || !b.items) return b
            const items = [...b.items]
            items[itemIndex] = value
            return { ...b, items }
          }),
        }
      }),
    })),

  getValueByPath: (path) => {
    const page = get().pages.find((p) => p.id === path.pageId)
    if (!page) return ''
    switch (path.field) {
      case 'sectionLabel': return page.sectionLabel
      case 'title':        return page.title
      case 'subtitle':     return page.subtitle ?? ''
      case 'block.title':
      case 'block.body':
      case 'block.value':
      case 'block.meta': {
        const block = page.blocks.find((b) => b.id === path.blockId)
        if (!block) return ''
        const key = path.field.split('.')[1] as keyof ReportBlock
        return String(block[key] ?? '')
      }
      case 'block.items': {
        const block = page.blocks.find((b) => b.id === path.blockId)
        return block?.items?.[path.itemIndex ?? 0] ?? ''
      }
    }
  },

  setValueByPath: (path, value) => {
    const { updatePage, updateBlock, updateBlockItem } = get()
    switch (path.field) {
      case 'sectionLabel': updatePage(path.pageId, { sectionLabel: value }); break
      case 'title':        updatePage(path.pageId, { title: value });        break
      case 'subtitle':     updatePage(path.pageId, { subtitle: value });     break
      case 'block.title':  updateBlock(path.pageId, path.blockId!, { title: value }); break
      case 'block.body':   updateBlock(path.pageId, path.blockId!, { body: value });  break
      case 'block.value':  updateBlock(path.pageId, path.blockId!, { value });        break
      case 'block.meta':   updateBlock(path.pageId, path.blockId!, { meta: value });  break
      case 'block.items':  updateBlockItem(path.pageId, path.blockId!, path.itemIndex ?? 0, value); break
    }
  },

  setEditMode: (v) => set({ editMode: v }),
  setViewport: (v) => set({ viewport: v }),
  setDensity:  (v) => set({ density: v }),

  loadReport: (data) => set({ brand: data.brand, pages: data.pages }),
}))
