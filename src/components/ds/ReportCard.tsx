import { cn } from '@/lib/utils'

interface Props {
  emphasis?: boolean
  children: React.ReactNode
  className?: string
}

export function ReportCard({ emphasis, children, className }: Props) {
  return (
    <article className={cn('report-card', emphasis && 'is-emphasis', className)}>
      {children}
    </article>
  )
}
