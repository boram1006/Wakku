import type { ReportSection } from '@/types/report'
import { EditableText } from './EditableText'

interface Props {
  section: ReportSection
}

export function EditableHead({ section }: Props) {
  return (
    <header className="report-head">
      <div>
        <EditableText
          target={{ type: 'section', sectionId: section.id, field: 'kicker', label: '섹션 번호', multiline: false }}
          as="div"
          className="report-kicker"
        />
        <EditableText
          target={{ type: 'section', sectionId: section.id, field: 'title', label: '페이지 제목', multiline: true }}
          as="h2"
          className="report-title"
        />
        <EditableText
          target={{ type: 'section', sectionId: section.id, field: 'subtitle', label: '부제목', multiline: true }}
          as="p"
          className="report-subtitle"
        />
      </div>
    </header>
  )
}
