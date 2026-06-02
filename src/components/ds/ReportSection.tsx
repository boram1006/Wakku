import { cn } from '@/lib/utils'

interface Props {
  id?: string
  muted?: boolean
  children: React.ReactNode
  className?: string
}

export function ReportSection({ id, muted, children, className }: Props) {
  return (
    <section
      id={id}
      className={cn('report-section', muted && 'is-muted', className)}
    >
      {children}
    </section>
  )
}
