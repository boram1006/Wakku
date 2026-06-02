import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

export function ReportCallout({ children, className, style }: Props) {
  return (
    <div className={cn('report-callout', className)} style={style}>
      {children}
    </div>
  )
}
