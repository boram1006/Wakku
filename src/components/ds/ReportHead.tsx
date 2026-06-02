import { cn } from '@/lib/utils'

interface Props {
  kicker: string
  title: string
  subtitle: string
  className?: string
}

export function ReportHead({ kicker, title, subtitle, className }: Props) {
  return (
    <header className={cn('report-head', className)}>
      <div>
        <div className="report-kicker">{kicker}</div>
        <h2
          className="report-title"
          dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }}
        />
        <p className="report-subtitle">{subtitle}</p>
      </div>
    </header>
  )
}
