import { cn } from '@/lib/utils'

interface Props {
  accent?: boolean
  children: React.ReactNode
  className?: string
}

export function ReportLabel({ accent, children, className }: Props) {
  return (
    <span className={cn('report-label', accent && 'is-accent', className)}>
      {children}
    </span>
  )
}
