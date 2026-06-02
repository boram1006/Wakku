import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

export function ReportFlow({ children, className }: Props) {
  return <div className={cn('report-flow', className)}>{children}</div>
}
