import type { ProjectInput, AgentQuestion } from '@/types/agent'
import type { Storyline } from '@/types/storyline'

const uid = () => Math.random().toString(36).slice(2, 9)

function combined(input: ProjectInput): string {
  return [input.reportTitle, input.currentSituation, input.reportGoal, input.sourceText]
    .filter(Boolean)
    .join('\n')
}

function hasNumber(text: string): boolean {
  return /(\d+\.?\d*)\s*(%|h|시간|건|개|명|만원|억)/.test(text)
}

/**
 * 선택된 Storyline과 입력 정보를 기반으로 0~3개의 보완 질문을 생성합니다.
 * 이미 입력에서 추론 가능한 내용은 묻지 않습니다.
 */
export function generateStorylineQuestions(
  storyline: Storyline,
  input: ProjectInput
): AgentQuestion[] {
  const text = combined(input)
  const qs: AgentQuestion[] = []
  const add = (q: AgentQuestion) => { if (qs.length < 3) qs.push(q) }

  switch (storyline.type) {
    case 'execution':
      if (!hasNumber(text))
        add({
          id: uid(),
          question: '실행 결과 중 수치로 확인된 성과가 있다면 알려주세요.',
          hint: '예: 착수 리드타임 30% 단축, 검토 반복 횟수 2회 → 1회 감소',
          multiline: false,
        })
      if (!/병목|지연|막힘|블로커|지체/.test(text))
        add({
          id: uid(),
          question: '현재 남아 있는 병목이나 해결되지 않은 부분이 있다면 설명해 주세요.',
          hint: '예: 승인 단계가 여전히 수동으로 처리됨, 데이터 연동 미완료',
          multiline: true,
        })
      break

    case 'roi':
      if (!/기준|산정|측정|기반|환산/.test(text))
        add({
          id: uid(),
          question: '효과 수치의 산정 기준을 알려주세요.',
          hint: '예: 프로젝트 1건 평균 2.5시간 절감, 연 40건 기준',
          multiline: false,
        })
      if (!hasNumber(text))
        add({
          id: uid(),
          question: '현재 비효율의 규모를 수치로 알려주세요.',
          hint: '예: 담당자 1명 기준 주 3시간 소요, 팀 5명',
          multiline: false,
        })
      break

    case 'decision':
      if (!/결정|판단|승인|확정|검토\s*대상|오늘\s*(결정|확인)/.test(text))
        add({
          id: uid(),
          question: '오늘 결정 또는 승인을 요청할 항목은 무엇인가요?',
          hint: '예: A 방안 채택 여부, 예산 확보 요청, 담당 조직 확정',
          multiline: true,
        })
      break

    case 'scope-clarification':
      if (!/제외|포함하지|하지\s*않|범위\s*밖|별도/.test(text))
        add({
          id: uid(),
          question: '이번 보고 범위에서 제외된 항목이나 다루지 않는 것을 알려주세요.',
          hint: '예: 예산 집행은 이번 범위 아님, 조직 개편은 별도 검토',
          multiline: true,
        })
      break

    case 'demo':
      if (!/확인\s*포인트|검증\s*항목|무엇을\s*확인/.test(text))
        add({
          id: uid(),
          question: '오늘 데모에서 확인해야 할 핵심 포인트를 알려주세요.',
          hint: '예: 응답 속도, 생성 결과 품질, 특정 케이스 처리 방식',
          multiline: true,
        })
      break

    case 'alignment':
      if (!/전사\s*전략|로드맵|상위\s*전략|OKR/.test(text))
        add({
          id: uid(),
          question: '이 과제가 연결되는 전사 전략이나 상위 로드맵을 알려주세요.',
          hint: '예: 2024 디지털 전환 로드맵 3단계, OKR 운영 효율화 목표',
          multiline: false,
        })
      break

    case 'problem-solution':
      if (!/핵심\s*문제|근본\s*원인|구조적/.test(text))
        add({
          id: uid(),
          question: '해결하려는 핵심 문제를 한 문장으로 정리해 주세요.',
          hint: '예: A 프로세스에서 B 단계가 반복되어 C가 지연됨',
          multiline: false,
        })
      break

    case 'risk-control':
      if (!/리스크|위험|우려|주의/.test(text))
        add({
          id: uid(),
          question: '추진 시 예상되는 주요 리스크를 알려주세요.',
          hint: '예: 담당자 부재, 데이터 품질 미확보, 이해관계자 반발',
          multiline: true,
        })
      break
  }

  return qs
}
