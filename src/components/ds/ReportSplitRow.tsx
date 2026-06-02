interface Props {
  label: string
  text: string
}

export function ReportSplitRow({ label, text }: Props) {
  return (
    <div className="report-split-row">
      <div className="report-row-label">{label}</div>
      <div className="report-row-text">{text}</div>
    </div>
  )
}
