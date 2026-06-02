import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

export function ReportWrap({ children, className }: Props) {
  return <div className={cn('report-wrap', className)}>{children}</div>
}
