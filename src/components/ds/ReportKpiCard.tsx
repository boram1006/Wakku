import { cn } from '@/lib/utils'

interface Props {
  num: string
  unit: string
  title: string
  desc: string
  emphasis?: boolean
  className?: string
}

export function ReportKpiCard({ num, unit, title, desc, emphasis, className }: Props) {
  return (
    <article className={cn('report-card', emphasis && 'is-emphasis', className)}>
      <div>
        <span className="report-num">{num}</span>
        <span className="report-unit">{unit}</span>
      </div>
      <h3 className="report-card-title">{title}</h3>
      <p className="report-card-desc">{desc}</p>
    </article>
  )
}
