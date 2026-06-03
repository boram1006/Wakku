import type { ReportPage } from '@/types/report'
import { EditableText } from './EditableText'

interface Props {
  page: ReportPage
}

export function EditableHead({ page }: Props) {
  return (
    <header className="report-head">
      <div>
        <div className="report-kicker">
          {page.sectionNumber} · <EditableText
            path={{ pageId: page.id, field: 'sectionLabel' }}
            label="섹션 이름"
            as="span"
          />
        </div>
        <EditableText
          path={{ pageId: page.id, field: 'title' }}
          label="페이지 제목"
          as="h2"
          className="report-title"
          multiline
        />
        {page.subtitle !== undefined && (
          <EditableText
            path={{ pageId: page.id, field: 'subtitle' }}
            label="부제목"
            as="p"
            className="report-subtitle"
          />
        )}
      </div>
    </header>
  )
}
