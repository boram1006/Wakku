import { cn } from '@/lib/utils'

interface Props {
  cols: 2 | 3 | 4
  children: React.ReactNode
  className?: string
}

const colClass: Record<number, string> = {
  2: 'report-grid-2',
  3: 'report-grid-3',
  4: 'report-grid-4',
}

export function ReportGrid({ cols, children, className }: Props) {
  return <div className={cn(colClass[cols], className)}>{children}</div>
}
