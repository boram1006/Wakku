'use client'

import { useSelectedElementStore } from '@/store/selectedElementStore'
import { useReportStore } from '@/store/reportStore'
import type { SelectionTarget } from '@/types/editor'
import { selectionId } from '@/types/editor'
import type { CSSProperties, MouseEvent } from 'react'

interface Props {
  target: SelectionTarget
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: CSSProperties
}

export function EditableText({ target, as: Tag = 'span', className, style }: Props) {
  const value = useReportStore((s) => s.getValueByTarget(target))
  const editMode = useReportStore((s) => s.editMode)
  const { selectedId, select } = useSelectedElementStore()

  const isSelected = selectedId === selectionId(target)

  const handleClick = (e: MouseEvent) => {
    if (!editMode) return
    e.stopPropagation()
    select(target)
  }

  const selectedStyle: CSSProperties = isSelected
    ? {
        outline: '2px solid #FD312E',
        outlineOffset: '3px',
        borderRadius: '4px',
        cursor: 'text',
      }
    : {}

  const hoverClass = editMode ? 'editable-text' : ''

  // Preserve line breaks from \n in titles
  const hasBreaks = value.includes('\n')

  return (
    <Tag
      className={[className, hoverClass].filter(Boolean).join(' ')}
      style={{ ...style, ...selectedStyle }}
      onClick={handleClick}
      dangerouslySetInnerHTML={
        hasBreaks ? { __html: value.replace(/\n/g, '<br />') } : undefined
      }
    >
      {hasBreaks ? undefined : value}
    </Tag>
  )
}
