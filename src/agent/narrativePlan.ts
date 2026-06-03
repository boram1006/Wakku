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

// ── 페이지 레이블: (type, role) → 자연어 섹션명 ───────────────────────────────

const LABEL: Record<StorylineType, Partial<Record<StorylinePageRole, string>>> = {
  execution: {
    hook:         '보고 개요',
    context:      '배경',
    problem:      '문제 정의',
    execution:    '현재 구현',
    evidence:     '검증 결과',
    effect:       '확인된 효과',
    'next-step':  '향후 계획',
  },
  demo: {
    hook:         '확인 포인트',
    context:      '배경',
    execution:    '데모 시연',
    evidence:     '검증 결과',
    effect:       '가능성과 한계',
    'next-step':  '다음 검증',
  },
  decision: {
    hook:         '결정 배경',
    context:      '현재 상황',
    scope:        '선택지',
    decision:     '추천안',
    risk:         '리스크',
    'next-step':  '요청사항',
  },
  roi: {
    hook:         '보고 개요',
    problem:      '현재 비효율',
    scope:        '적용 범위',
    evidence:     '효과 수치',
    effect:       '기대효과',
    'next-step':  '다음 단계',
  },
  alignment: {
    hook:         '보고 개요',
    context:      '상위 전략',
    scope:        '현재 과제',
    execution:    '실행 현황',
    evidence:     '검증 결과',
    effect:       '전사 기여',
    'next-step':  '확장 방향',
  },
  'scope-clarification': {
    hook:         '보고 범위',
    scope:        '포함/제외 정의',
    context:      '배경과 전제',
    evidence:     '현황 수치',
    'next-step':  '후속 검토',
  },
  'problem-solution': {
    hook:         '보고 개요',
    problem:      '핵심 문제',
    evidence:     '근거',
    solution:     '해결 방향',
    effect:       '기대효과',
    'next-step':  '실행 계획',
  },
  'risk-control': {
    hook:         '보고 개요',
    context:      '배경',
    problem:      '리스크 현황',
    risk:         '대응 방안',
    'next-step':  '모니터링 계획',
  },
}

const FALLBACK_LABEL: Record<StorylinePageRole, string> = {
  hook:         '보고 개요',
  context:      '배경',
  scope:        '범위',
  problem:      '문제',
  evidence:     '근거',
  decision:     '의사결정',
  solution:     '해결 방향',
  effect:       '기대효과',
  'to-be':      'To-Be',
  execution:    '실행 현황',
  risk:         '리스크',
  'next-step':  '다음 단계',
  appendix:     '참고',
}

// ── 제외 주제: 이 타입의 보고에서 일반적으로 다루지 않는 것 ─────────────────────

const EXCLUDED: Record<StorylineType, string[]> = {
  execution:             ['ROI 정량 수치', '조직 개편', '예산 세부 내역'],
  demo:                  ['ROI 산정', '조직 역할', '추진 일정 상세'],
  decision:              ['기술 구현 세부 스펙', '데모 시연', '과거 히스토리'],
  roi:                   ['기술 구현 상세', '조직 개편', '데모'],
  alignment:             ['ROI 정량 수치', '기술 구현 세부', '담당자별 업무 분장'],
  'scope-clarification': ['ROI', '기술 구현', '실행 일정 상세'],
  'problem-solution':    ['전사 전략 정렬', '데모', '예산'],
  'risk-control':        ['ROI', '데모', '전사 전략'],
}

// ── 공개 함수 ─────────────────────────────────────────────────────────────────

export function buildNarrativePlan(storyline: Storyline): NarrativePlan {
  const type = storyline.type
  const typeLabels = LABEL[type] ?? {}

  const pages: NarrativePage[] = storyline.pagePlan.map((plan) => ({
    id: uid(),
    order: plan.order,
    sectionLabel: typeLabels[plan.role] ?? FALLBACK_LABEL[plan.role] ?? plan.role,
    role: plan.role,
    purpose: plan.message,
    layoutType: plan.suggestedLayoutType,
  }))

  return {
    nature: NATURE[type] ?? '보고자료',
    persuasionFlow: storyline.narrativeFlow,
    pages,
    excludedTopics: EXCLUDED[type] ?? [],
  }
}
