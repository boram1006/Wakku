import { create } from 'zustand'
import type { EditablePath } from '@/types/editor'
import { pathId } from '@/types/editor'

interface SelectedElementStore {
  path: EditablePath | null
  selectedId: string | null
  label: string
  multiline: boolean

  select: (path: EditablePath, label: string, multiline?: boolean) => void
  clear: () => void
}

export const useSelectedElementStore = create<SelectedElementStore>((set) => ({
  path: null,
  selectedId: null,
  label: '',
  multiline: false,

  select: (path, label, multiline = false) =>
    set({ path, selectedId: pathId(path), label, multiline }),

  clear: () =>
    set({ path: null, selectedId: null, label: '', multiline: false }),
}))
