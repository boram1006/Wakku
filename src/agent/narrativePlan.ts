import type { Storyline, StorylinePageRole, StorylineType } from '@/types/storyline'
import type { NarrativePlan, NarrativePage } from '@/types/narrative'

const uid = () => Math.random().toString(36).slice(2, 9)

// ── 보고 성격 ─────────────────────────────────────────────────────────────────

const NATURE: Record<StorylineType, string> = {
  execution:             '진행현황 보고',
  demo:                  '데모/검증 보고',
  decision:              '의사결정 보고',
  roi:                   '효과 입증 보고',
  alignment:             '전략 정렬 보고',
  'scope-clarification': '범위 정의 보고',
  'problem-solution':    '문제 해결 보고',
  'risk-control':        '리스크 관리 보고',
}

// ── 보고 유형별 기본 설득 흐름 ────────────────────────────────────────────────
// storyline.narrativeFlow가 비어 있을 때 fallback으로 사용

const BASE_FLOW: Record<StorylineType, string[]> = {
  execution: [
    '왜 지금 이 보고가 필요한가',
    '현재 어디까지 구현/진행됐는가',
    '확인 가능한 결과 또는 데모',
    '남은 이슈와 해결 방향',
    '다음 단계 일정',
  ],
  demo: [
    '오늘 확인할 핵심 포인트',
    '데모 조건과 시연',
    '결과 확인',
    '가능성과 한계',
    '다음 검증 방향',
  ],
  decision: [
    '왜 지금 결정이 필요한가',
    '선택 가능한 방향',
    '추천안과 그 근거',
    '리스크와 대응',
    '오늘 요청하는 결정',
  ],
  roi: [
    '기존 구조의 비효율 규모',
    '개선 후 달라지는 것',
    '직접 효과 (즉시 측정 가능)',
    '간접 효과 (조건부 실현)',
    '확산 조건과 다음 단계',
  ],
  alignment: [
    '상위 전략/로드맵과 연결',
    '현재 과제의 위치와 역할',
    '선행 실행 또는 검증 의미',
    '전사 확장 가능성',
    '후속 계획',
  ],
  'scope-clarification': [
    '이번 보고의 범위 확정',
    '다루지 않는 범위 명시',
    '배경과 전제 설명',
    '후속 논의 항목',
  ],
  'problem-solution': [
    '현재 구조적 문제',
    '문제의 원인',
    '해결 접근 방식',
    '기대 변화',
    '실행 계획',
  ],
  'risk-control': [
    '배경과 리스크 맥락',
    '주요 리스크 현황',
    '대응 방안',
    '모니터링 계획',
  ],
}

// ── (타입 × 역할) → 기본 섹션 레이블 ─────────────────────────────────────────
// 보고 유형별 서술 흐름을 반영한 기본값.
// refineLabel()이 message 키워드로 이를 추가 구체화합니다.

const TYPE_ROLE_LABEL: Record<StorylineType, Partial<Record<StorylinePageRole, string>>> = {
  execution: {
    hook:        '보고 배경',
    context:     '배경',
    problem:     '문제 정의',
    scope:       '보고 범위',
    execution:   '현재 구현',
    evidence:    '확인 결과',
    effect:      '확인된 효과',
    risk:        '남은 과제',
    'next-step': '다음 일정',
  },
  demo: {
    hook:        '확인 포인트',
    context:     '배경',
    scope:       '보고 범위',
    execution:   '데모',
    evidence:    '결과 확인',
    effect:      '가능성과 한계',
    'next-step': '다음 검증',
  },
  decision: {
    hook:        '결정 배경',
    context:     '현재 상황',
    scope:       '선택지',
    evidence:    '판단 근거',
    decision:    '추천안',
    risk:        '리스크',
    'next-step': '요청사항',
  },
  roi: {
    hook:        '보고 배경',
    problem:     '현재 비효율',
    scope:       '적용 범위',
    evidence:    '효과 수치',
    effect:      '기대효과',
    'next-step': '확산 가능성',
  },
  alignment: {
    hook:        '보고 배경',
    context:     '상위 방향',
    scope:       '현재 과제',
    execution:   '선행 검증',
    evidence:    '검증 결과',
    effect:      '확장 가능성',
    'next-step': '후속 계획',
  },
  'scope-clarification': {
    hook:        '보고 범위',
    scope:       '포함/제외 정의',
    context:     '배경과 전제',
    evidence:    '현황 수치',
    'next-step': '후속 검토',
  },
  'problem-solution': {
    hook:        '보고 배경',
    problem:     '현재 문제',
    context:     '문제 원인',
    evidence:    '근거',
    solution:    '해결 접근',
    'to-be':     '개선 후 모습',
    effect:      '기대 변화',
    execution:   '실행 계획',
    'next-step': '실행 계획',
  },
  'risk-control': {
    hook:        '보고 배경',
    context:     '배경',
    problem:     '리스크 현황',
    risk:        '대응 방안',
    'next-step': '모니터링 계획',
  },
}

const ROLE_FALLBACK: Record<StorylinePageRole, string> = {
  hook:        '보고 배경',
  context:     '배경',
  scope:       '범위',
  problem:     '문제',
  evidence:    '근거',
  decision:    '의사결정',
  solution:    '해결 방향',
  effect:      '기대효과',
  'to-be':     '개선 후 모습',
  execution:   '실행 현황',
  risk:        '리스크',
  'next-step': '다음 단계',
  appendix:    '참고',
}

// ── 제외 주제 ─────────────────────────────────────────────────────────────────

const EXCLUDED: Record<StorylineType, string[]> = {
  execution:             ['ROI 정량 산정', '조직 개편', '예산 세부 내역'],
  demo:                  ['ROI 산정', '추진 일정 상세', '조직 역할 분장'],
  decision:              ['기술 구현 세부', '데모 시연', '과거 전체 히스토리'],
  roi:                   ['기술 구현 상세', '조직 개편', '데모'],
  alignment:             ['ROI 정량 수치', '기술 구현 세부', '담당자별 업무 분장'],
  'scope-clarification': ['ROI', '기술 구현 상세', '실행 일정 상세'],
  'problem-solution':    ['전사 전략 정렬', '데모', '예산 세부'],
  'risk-control':        ['ROI', '데모', '전사 전략'],
}

// ── 메시지 기반 레이블 보강 ───────────────────────────────────────────────────
// pagePlan.message에 특정 키워드가 있으면 기본 레이블보다 더 구체적인 이름으로 교체.
// 규칙 순서: 구체적인 것 → 일반적인 것

function refineLabel(base: string, message: string): string {
  if (/데모|시연|시뮬/.test(message))                  return '데모'
  if (/현재\s*구현|구현\s*현황|구현\s*결과/.test(message)) return '현재 구현'
  if (/선행\s*검증|선행\s*실행/.test(message))           return '선행 검증'
  if (/향후\s*계획|다음\s*일정|후속\s*계획/.test(message)) return '향후 계획'
  if (/실행\s*계획|단계별\s*실행/.test(message))          return '실행 계획'
  if (/선택지|대안|옵션/.test(message))                  return '선택지'
  if (/추천안|추천\s*방향/.test(message))                return '추천안'
  if (/남은\s*병목|미해결|남은\s*과제/.test(message))     return '남은 과제'
  if (/확장\s*가능성|전사\s*확산/.test(message))          return '확장 가능성'
  if (/문제\s*원인|근본\s*원인/.test(message))            return '문제 원인'
  return base
}

// ── 공개 함수 ─────────────────────────────────────────────────────────────────

export function buildNarrativePlan(storyline: Storyline): NarrativePlan {
  const type = storyline.type
  const typeLabels = TYPE_ROLE_LABEL[type] ?? {}

  const pages: NarrativePage[] = storyline.pagePlan.map((plan) => {
    const baseLabel = typeLabels[plan.role] ?? ROLE_FALLBACK[plan.role] ?? plan.role
    return {
      id: uid(),
      order: plan.order,
      sectionLabel: refineLabel(baseLabel, plan.message),
      role: plan.role,
      purpose: plan.message,
      layoutType: plan.suggestedLayoutType,
    }
  })

  return {
    nature: NATURE[type] ?? '보고자료',
    persuasionFlow:
      storyline.narrativeFlow.length > 0
        ? storyline.narrativeFlow
        : BASE_FLOW[type] ?? [],
    pages,
    excludedTopics: EXCLUDED[type] ?? [],
  }
}
