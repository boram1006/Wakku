import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

export function ReportCallout({ children, className }: Props) {
  return <div className={cn('report-callout', className)}>{children}</div>
}
