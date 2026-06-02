'use client'

// TODO: Phase 2 — full implementation
// Behavior: default = plain render / click = contentEditable / blur or Enter = commit / Esc = cancel
interface Props {
  value: string
  onChange: (next: string) => void
  as?: keyof React.JSX.IntrinsicElements
  className?: string
}

export function EditableText({ value, as: Tag = 'span', className }: Props) {
  return <Tag className={className}>{value}</Tag>
}
