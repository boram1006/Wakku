'use client'

import { useSelectedElementStore } from '@/store/selectedElementStore'
import { useReportStore } from '@/store/reportStore'
import type { EditablePath } from '@/types/report'
import { pathId } from '@/types/report'
import type { CSSProperties, MouseEvent } from 'react'

interface Props {
  path: EditablePath
  label: string
  multiline?: boolean
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: CSSProperties
}

export function EditableText({ path, label, multiline = false, as: Tag = 'span', className, style }: Props) {
  const value = useReportStore((s) => s.getValueByPath(path))
  const editMode = useReportStore((s) => s.editMode)
  const { selectedId, select } = useSelectedElementStore()

  const isSelected = selectedId === pathId(path)

  const handleClick = (e: MouseEvent) => {
    if (!editMode) return
    e.stopPropagation()
    select(path, label, multiline)
  }

  const selectedStyle: CSSProperties = isSelected
    ? { outline: '2px solid #FD312E', outlineOffset: '3px', borderRadius: '4px', cursor: 'text' }
    : {}

  const hasBreaks = value.includes('\n')

  return (
    <Tag
      className={[className, editMode ? 'editable-text' : ''].filter(Boolean).join(' ')}
      style={{ ...style, ...selectedStyle }}
      onClick={handleClick}
      dangerouslySetInnerHTML={hasBreaks ? { __html: value.replace(/\n/g, '<br />') } : undefined}
    >
      {hasBreaks ? undefined : value}
    </Tag>
  )
}
