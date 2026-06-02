import { cn } from '@/lib/utils'

interface Props {
  num: string
  title: string
  desc: string
  className?: string
}

export function ReportStep({ num, title, desc, className }: Props) {
  return (
    <div className={cn('report-step', className)}>
      <div className="report-step-num">{num}</div>
      <div className="report-step-title">{title}</div>
      <div className="report-step-desc">{desc}</div>
    </div>
  )
}
