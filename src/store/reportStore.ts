import { create } from 'zustand'
import type { EditablePath, LayoutType, ReportBlock, ReportData, ReportPage } from '@/types/report'
import type { DensityPreset, ViewportPreset } from '@/types/editor'
import { mockReport } from '@/lib/mockReport'

interface ReportStore {
  brand: string
  pages: ReportPage[]
  editMode: boolean
  viewport: ViewportPreset
  density: DensityPreset

  setPages: (pages: ReportPage[]) => void
  updatePage: (pageId: string, patch: Partial<Omit<ReportPage, 'id' | 'blocks'>>) => void
  updateBlock: (pageId: string, blockId: string, patch: Partial<Omit<ReportBlock, 'id'>>) => void
  updateBlockItem: (pageId: string, blockId: string, itemIndex: number, value: string) => void
  addPage: (page: ReportPage) => void
  removePage: (pageId: string) => void
  movePage: (fromIndex: number, toIndex: number) => void
  changeLayoutType: (pageId: string, layoutType: LayoutType) => void

  getValueByPath: (path: EditablePath) => string
  setValueByPath: (path: EditablePath, value: string) => void

  setEditMode: (value: boolean) => void
  setViewport: (value: ViewportPreset) => void
  setDensity: (value: DensityPreset) => void
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
    set((state) => ({
      pages: state.pages.map((page) => (page.id === pageId ? { ...page, ...patch } : page)),
    })),

  updateBlock: (pageId, blockId, patch) =>
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              blocks: page.blocks.map((block) =>
                block.id === blockId ? { ...block, ...patch } : block
              ),
            }
          : page
      ),
    })),

  updateBlockItem: (pageId, blockId, itemIndex, value) =>
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              blocks: page.blocks.map((block) => {
                if (block.id !== blockId) return block
                const items = [...(block.items ?? [])]
                items[itemIndex] = value
                return { ...block, items }
              }),
            }
          : page
      ),
    })),

  addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),

  removePage: (pageId) =>
    set((state) => ({ pages: state.pages.filter((page) => page.id !== pageId) })),

  movePage: (fromIndex, toIndex) =>
    set((state) => {
      const pages = [...state.pages]
      const [moved] = pages.splice(fromIndex, 1)
      if (!moved) return { pages }
      pages.splice(toIndex, 0, moved)
      return { pages }
    }),

  changeLayoutType: (pageId, layoutType) =>
    set((state) => ({
      pages: state.pages.map((page) => (page.id === pageId ? { ...page, layoutType } : page)),
    })),

  getValueByPath: (path) => {
    const page = get().pages.find((item) => item.id === path.pageId)
    if (!page) return ''

    switch (path.field) {
      case 'sectionLabel':
        return page.sectionLabel
      case 'title':
        return page.title
      case 'subtitle':
        return page.subtitle ?? ''
      case 'block.title':
      case 'block.body':
      case 'block.value':
      case 'block.meta': {
        const block = page.blocks.find((item) => item.id === path.blockId)
        const field = path.field.replace('block.', '') as 'title' | 'body' | 'value' | 'meta'
        return block?.[field] ?? ''
      }
      case 'block.items': {
        const block = page.blocks.find((item) => item.id === path.blockId)
        return block?.items?.[path.itemIndex ?? 0] ?? ''
      }
    }
  },

  setValueByPath: (path, value) => {
    const { updatePage, updateBlock, updateBlockItem } = get()

    switch (path.field) {
      case 'sectionLabel':
        updatePage(path.pageId, { sectionLabel: value })
        break
      case 'title':
        updatePage(path.pageId, { title: value })
        break
      case 'subtitle':
        updatePage(path.pageId, { subtitle: value })
        break
      case 'block.title':
        if (path.blockId) updateBlock(path.pageId, path.blockId, { title: value })
        break
      case 'block.body':
        if (path.blockId) updateBlock(path.pageId, path.blockId, { body: value })
        break
      case 'block.value':
        if (path.blockId) updateBlock(path.pageId, path.blockId, { value })
        break
      case 'block.meta':
        if (path.blockId) updateBlock(path.pageId, path.blockId, { meta: value })
        break
      case 'block.items':
        if (path.blockId) updateBlockItem(path.pageId, path.blockId, path.itemIndex ?? 0, value)
        break
    }
  },

  setEditMode: (value) => set({ editMode: value }),
  setViewport: (value) => set({ viewport: value }),
  setDensity: (value) => set({ density: value }),
  loadReport: (data) => set({ brand: data.brand, pages: data.pages }),
}))
