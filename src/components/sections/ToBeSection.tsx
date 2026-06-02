import type { ReportSection } from '@/types/report'
import {
  ReportSection as DS,
  ReportWrap,
  ReportHead,
  ReportFlow,
  ReportStep,
  ReportArrow,
  ReportCallout,
} from '@/components/ds'

interface Props {
  section: ReportSection
}

export function ToBeSection({ section }: Props) {
  const steps = section.steps ?? []

  return (
    <DS id={section.id} muted={section.isMuted}>
      <ReportWrap>
        <ReportHead
          kicker={section.kicker}
          title={section.title}
          subtitle={section.subtitle}
        />
        <ReportFlow>
          {steps.flatMap((step, i) => {
            const items = [
              <ReportStep key={step.num} num={step.num} title={step.title} desc={step.desc} />,
            ]
            if (i < steps.length - 1) {
              items.push(<ReportArrow key={`arrow-${i}`} />)
            }
            return items
          })}
        </ReportFlow>
        {section.callout && (
          <ReportCallout style={{ marginTop: 28 }}>{section.callout}</ReportCallout>
        )}
      </ReportWrap>
    </DS>
  )
}
