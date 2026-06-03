/**
 * Nature Library v1
 *
 * 7개의 초기 Nature를 정의합니다.
 * Pattern Extractor와 FlowSimilarityClassifier가 이 데이터를 기준으로 분류합니다.
 *
 * 설계 원칙:
 * - 특정 과제명 없이 보고 목적 기반으로 정의
 * - Nature 간 canonicalFlow와 requestedAction으로 명확히 구분
 * - whenToUse / whenNotToUse로 경계 조건 명시
 */

import type { NatureEntry, NatureLibrary } from '@/types/patternExtractor'

// ─────────────────────────────────────────────────────────────────────────────

const NATURE_ENTRIES: NatureEntry[] = [

  // ── 1. strategic-direction ────────────────────────────────────────────────
  {
    id: 'strategic-direction',
    nature: {
      natureId: 'strategic-direction',
      natureName: '전략 방향 보고',
      natureAliases: ['방향성 보고', '전략 전환 보고', 'Direction Report'],
    },
    description:
      '조직이 나아가야 할 방향을 새롭게 정의하거나 전환 시점을 선언하고 경영진의 승인을 받는 보고.',
    audienceTypes: ['ceo'],
    canonicalFlow: [
      '외부 환경 변화와 현재 방식의 한계',
      '새로운 방향성의 핵심 명제',
      '방향을 실현할 전략 축 (2~3개)',
      '실행 체계와 거버넌스',
      '추진 계획과 마일스톤',
    ],
    canonicalPageRoles: ['context', 'problem', 'solution', 'execution', 'next-step'],
    typicalRequestedAction: 'approve',
    commonEvidenceTypes: ['org', 'workflow', 'roadmap'],
    commonInteractionPatterns: ['scope-tab', 'step-reveal'],
    whenToUse: [
      '조직 전체의 전략적 방향을 처음 정의하거나 전환할 때',
      '경영진이 방향성에 동의해야 이후 실행이 가능한 경우',
      '2개 이상의 전략 축을 동시에 제시해야 하는 경우',
    ],
    whenNotToUse: [
      '특정 과제의 진행 상황을 보고할 때 (→ progress-update)',
      '하나의 PoC 결과를 검증받을 때 (→ poc-validation)',
      '개별 과제 시작 타당성을 묻는 경우 (→ task-discovery)',
    ],
    examplePatterns: [],
    frequency: 0,
    tags: ['strategy', 'direction', 'ceo', 'approve'],
  },

  // ── 2. platform-expansion ─────────────────────────────────────────────────
  {
    id: 'platform-expansion',
    nature: {
      natureId: 'platform-expansion',
      natureName: '플랫폼 확장 보고',
      natureAliases: ['서비스 확장 보고', '적용 확대 보고', 'Expansion Report'],
    },
    description:
      '기존에 구축된 플랫폼/서비스/역량을 새로운 대상이나 범위로 확장하는 타당성과 계획을 보고.',
    audienceTypes: ['ceo', 'executive'],
    canonicalFlow: [
      '기존 자산의 현황과 검증된 가치',
      '확장이 필요한 이유와 시점',
      '확장 범위와 적용 방향',
      '확장 실현을 위한 요건',
      '기대효과와 추진 일정',
    ],
    canonicalPageRoles: ['context', 'scope', 'solution', 'execution', 'effect'],
    typicalRequestedAction: 'align',
    commonEvidenceTypes: ['metric', 'roadmap', 'workflow'],
    commonInteractionPatterns: ['scope-tab', 'evidence-expand'],
    whenToUse: [
      '기존 성과를 발판 삼아 적용 범위를 넓히는 경우',
      '검증된 역량을 다른 조직/사업에 이전하는 경우',
      '확장에 관한 방향 정렬이 필요한 경우',
    ],
    whenNotToUse: [
      '처음부터 새로운 방향을 제시하는 경우 (→ strategic-direction)',
      '아직 검증이 안 된 아이디어를 제안하는 경우 (→ task-discovery)',
      '특정 과제의 진행 현황을 보고하는 경우 (→ progress-update)',
    ],
    examplePatterns: [],
    frequency: 0,
    tags: ['expansion', 'platform', 'scale', 'executive'],
  },

  // ── 3. task-discovery ─────────────────────────────────────────────────────
  {
    id: 'task-discovery',
    nature: {
      natureId: 'task-discovery',
      natureName: '과제 발굴/제안 보고',
      natureAliases: ['과제 제안', '신규 과제 타당성 보고', 'Task Proposal'],
    },
    description:
      '새로운 과제를 발굴하고 추진 타당성을 제시하여 시작 여부 결정을 받는 보고.',
    audienceTypes: ['executive'],
    canonicalFlow: [
      '발견한 문제 또는 기회',
      '과제 정의와 목표',
      '접근 방식과 차별점',
      '기대 가치와 성공 지표',
      '추진 요건과 결정 요청',
    ],
    canonicalPageRoles: ['problem', 'scope', 'solution', 'effect', 'next-step'],
    typicalRequestedAction: 'decide',
    commonEvidenceTypes: ['metric', 'workflow', 'none'],
    commonInteractionPatterns: ['detail-accordion', 'evidence-expand'],
    whenToUse: [
      '새 과제를 공식적으로 시작하기 전 승인이 필요한 경우',
      '문제를 발견하고 해결 방향을 처음 제안하는 경우',
      '예산이나 인력 투입 여부를 결정받아야 하는 경우',
    ],
    whenNotToUse: [
      '이미 시작된 과제의 현황을 보고하는 경우 (→ progress-update)',
      '실험이 완료되어 결과를 공유하는 경우 (→ poc-validation)',
      '전사 전략을 다루는 경우 (→ strategic-direction)',
    ],
    examplePatterns: [],
    frequency: 0,
    tags: ['proposal', 'discovery', 'new-task', 'decide'],
  },

  // ── 4. agent-build ────────────────────────────────────────────────────────
  {
    id: 'agent-build',
    nature: {
      natureId: 'agent-build',
      natureName: 'AI 시스템 구축 보고',
      natureAliases: ['에이전트 구축 보고', '자동화 시스템 보고', 'Agent Build Report'],
    },
    description:
      'AI 에이전트 또는 자동화 시스템을 설계·구현하는 과정과 아키텍처를 공유하고 다음 단계 지원을 요청하는 보고.',
    audienceTypes: ['executive'],
    canonicalFlow: [
      '현업에서 반복되는 문제와 비효율',
      'Agent가 담당할 역할과 범위',
      'As-Is/To-Be 업무 흐름 비교',
      '기대효과와 적용 조건',
      '추진 일정과 지원 요청',
    ],
    canonicalPageRoles: ['problem', 'scope', 'solution', 'effect', 'next-step'],
    typicalRequestedAction: 'support',
    commonEvidenceTypes: ['demo', 'workflow', 'metric', 'screenshot'],
    commonInteractionPatterns: ['asis-tobe-toggle', 'step-reveal', 'demo-flow'],
    whenToUse: [
      '반복 업무를 Agent로 전환하는 추진안을 보고할 때',
      'Agent가 어떤 업무를 대체하거나 보강하는지 설명해야 하는 경우',
      '현업 As-Is와 To-Be 업무 흐름 비교가 설득의 핵심인 경우',
      '기술 구조보다 현업 변화가 먼저 납득되어야 하는 보고',
    ],
    whenNotToUse: [
      'PoC 실험 결과를 검증받는 경우 (→ poc-validation)',
      '기술 내용 없이 성과만 보고하는 경우 (→ progress-update)',
      '시스템을 확장하는 방향을 논의하는 경우 (→ platform-expansion)',
    ],
    examplePatterns: [],
    frequency: 0,
    tags: ['agent', 'ai', 'system', 'build', 'architecture'],
  },

  // ── 5. poc-validation ─────────────────────────────────────────────────────
  {
    id: 'poc-validation',
    nature: {
      natureId: 'poc-validation',
      natureName: 'PoC/검증 결과 보고',
      natureAliases: ['PoC 보고', '검증 보고', 'Validation Report'],
    },
    description:
      '실험 또는 프로토타입의 검증 결과를 공유하고 가능성을 증명한 후 다음 단계 투자 결정을 받는 보고.',
    audienceTypes: ['executive'],
    canonicalFlow: [
      '검증 목적과 실험 설계',
      '실험 조건과 방법',
      '결과와 데모',
      '확인된 가능성과 현재 한계',
      '다음 단계 결정 요청',
    ],
    canonicalPageRoles: ['hook', 'context', 'evidence', 'effect', 'next-step'],
    typicalRequestedAction: 'decide',
    commonEvidenceTypes: ['demo', 'metric', 'screenshot'],
    commonInteractionPatterns: ['demo-flow', 'evidence-expand', 'asis-tobe-toggle'],
    whenToUse: [
      'PoC나 실험이 완료되어 결과를 처음 공유하는 경우',
      '데모를 통해 작동 가능성을 증명해야 하는 경우',
      '결과를 바탕으로 다음 단계 투자 여부를 결정받아야 하는 경우',
    ],
    whenNotToUse: [
      '아직 실험이 진행 중인 경우 (→ progress-update)',
      '과제 시작 제안만 하는 경우 (→ task-discovery)',
      '이미 검증된 시스템 구조를 설명하는 경우 (→ agent-build)',
    ],
    examplePatterns: [],
    frequency: 0,
    tags: ['poc', 'validation', 'demo', 'experiment', 'decide'],
  },

  // ── 6. progress-update ────────────────────────────────────────────────────
  {
    id: 'progress-update',
    nature: {
      natureId: 'progress-update',
      natureName: '진행현황 보고',
      natureAliases: ['현황 보고', '중간 보고', '주간 보고', 'Status Update'],
    },
    description:
      '진행 중인 과제의 현재 상태, 달성 사항, 이슈, 다음 일정을 정기적으로 공유하는 보고.',
    audienceTypes: ['executive'],
    canonicalFlow: [
      '이번 보고 범위와 기준일',
      '현재 진행 상태 (완료/진행/예정)',
      '주요 달성 사항',
      '현재 이슈와 리스크',
      '다음 단계 일정',
    ],
    canonicalPageRoles: ['scope', 'execution', 'effect', 'risk', 'next-step'],
    typicalRequestedAction: 'inform',
    commonEvidenceTypes: ['roadmap', 'metric', 'screenshot'],
    commonInteractionPatterns: ['detail-accordion', 'step-reveal'],
    whenToUse: [
      '주기적인 과제 현황 보고가 필요한 경우',
      '의사결정보다 인지와 공유가 목적인 경우',
      '이슈나 지원이 필요한 경우에도 구조는 현황 중심',
    ],
    whenNotToUse: [
      'PoC 결과를 처음 공유하는 경우 (→ poc-validation)',
      '새로운 과제를 제안하는 경우 (→ task-discovery)',
      '전략 방향 승인이 목적인 경우 (→ strategic-direction)',
    ],
    examplePatterns: [],
    frequency: 0,
    tags: ['status', 'update', 'progress', 'inform', 'regular'],
  },

  // ── 7. portfolio-management ───────────────────────────────────────────────
  {
    id: 'portfolio-management',
    nature: {
      natureId: 'portfolio-management',
      natureName: '포트폴리오 관리 보고',
      natureAliases: ['과제 포트폴리오 보고', '분기 검토 보고', 'Portfolio Review'],
    },
    description:
      '복수의 과제/프로젝트 전체를 한 번에 조망하고 성과 요약, 이슈 과제, 우선순위 조정을 논의하는 보고.',
    audienceTypes: ['ceo', 'executive'],
    canonicalFlow: [
      '전체 포트폴리오 현황 한눈에 보기',
      '성과 과제 요약',
      '이슈 과제와 원인',
      '우선순위 조정 방향',
      '다음 분기 계획',
    ],
    canonicalPageRoles: ['scope', 'effect', 'problem', 'decision', 'next-step'],
    typicalRequestedAction: 'align',
    commonEvidenceTypes: ['roadmap', 'metric', 'org'],
    commonInteractionPatterns: ['scope-tab', 'detail-accordion', 'evidence-expand'],
    whenToUse: [
      '분기 리뷰 또는 연간 계획 수립 시점',
      '3개 이상의 과제를 동시에 다루는 경우',
      '과제 간 우선순위 조정이 필요한 경우',
    ],
    whenNotToUse: [
      '단일 과제의 현황을 보고하는 경우 (→ progress-update)',
      '전사 전략 방향을 새롭게 제시하는 경우 (→ strategic-direction)',
      '새 과제 시작 승인을 요청하는 경우 (→ task-discovery)',
    ],
    examplePatterns: [],
    frequency: 0,
    tags: ['portfolio', 'review', 'quarterly', 'multi-task', 'align'],
  },
]

// ── Public API ────────────────────────────────────────────────────────────────

export const NATURE_LIBRARY_V1: NatureLibrary = {
  version: '1.0.0',
  updatedAt: '2026-06-03',
  entries: NATURE_ENTRIES,
}

export function getNatureById(id: string): NatureEntry | undefined {
  return NATURE_ENTRIES.find((e) => e.id === id)
}

export function getNatureByName(name: string): NatureEntry | undefined {
  return NATURE_ENTRIES.find(
    (e) =>
      e.nature.natureName === name ||
      e.nature.natureAliases?.includes(name)
  )
}

export function listNatures(): Pick<NatureEntry, 'id' | 'nature' | 'typicalRequestedAction' | 'description'>[] {
  return NATURE_ENTRIES.map(({ id, nature, typicalRequestedAction, description }) => ({
    id,
    nature,
    typicalRequestedAction,
    description,
  }))
}
