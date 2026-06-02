import { create } from 'zustand'
import type { SelectionTarget } from '@/types/editor'
import { selectionId } from '@/types/editor'

interface SelectedElementStore {
  target: SelectionTarget | null
  selectedId: string | null

  select: (target: SelectionTarget) => void
  clear: () => void
  isSelected: (target: SelectionTarget) => boolean
}

export const useSelectedElementStore = create<SelectedElementStore>((set, get) => ({
  target: null,
  selectedId: null,

  select: (target) =>
    set({ target, selectedId: selectionId(target) }),

  clear: () =>
    set({ target: null, selectedId: null }),

  isSelected: (target) =>
    get().selectedId === selectionId(target),
}))
