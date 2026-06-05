import type { ProjectInput, AnalysisResult } from '@/types/agent'
import type { Storyline, StorylinePagePlan, StorylinePageRole, StorylineType } from '@/types/storyline'
import type { StorylineAgent } from './storylineAgent'

const uid = () => Math.random().toString(36).slice(2, 9)

// ── Diversity Groups ──────────────────────────────────────────────────────────

const DIVERSITY_GROUPS: [StorylineType[], StorylineType[], StorylineType[]] = [
  ['execution', 'roi'],                // 결과/효과 먼저
  ['decision', 'scope-clarification'], // 판단/명확화 먼저
  ['alignment', 'demo'],               // 맥락·포지셔닝/검증 먼저
]

// ── Requested Action Inference ────────────────────────────────────────────────

type RequestedAction = 'approve' | 'support' | 'inform' | 'align' | 'decide'

const ACTION_SIGNALS: Array<[RegExp, RequestedAction]> = [
  [/승인|확정|허가|동의\s*요청/, 'approve'],
  [/지원\s*요청|예산|인력|리소스/, 'support'],
  [/방향성?\s*정렬|방향\s*동의|방향\s*합의/, 'align'],
  [/결정|판단|선택지/, 'decide'],
  [/공유|인지|현황/, 'inform'],
]

const ACTION_LABEL: Record<RequestedAction, string> = {
  approve: '승인 요청',
  support: '지원 확보',
  inform:  '인지·공유',
  align:   '방향 정렬',
  decide:  '의사결정',
}

function inferRequestedAction(input: ProjectInput): RequestedAction {
  const goal = (input.reportGoal ?? '').toLowerCase()
  for (const [pattern, action] of ACTION_SIGNALS) {
    if (pattern.test(goal)) return action
  }
  // title as secondary signal
  const title = input.reportTitle.toLowerCase()
  for (const [pattern, action] of ACTION_SIGNALS) {
    if (pattern.test(title)) return action
  }
  return 'inform'
}

// ── Page Role Labels ──────────────────────────────────────────────────────────

const ROLE_START_LABEL: Partial<Record<StorylinePageRole, string>> = {
  hook:        '보고 목적',
  problem:     '현재 문제',
  scope:       '범위 확정',
  context:     '전략 맥락',
  evidence:    '검증 결과',
  effect:      '기대효과',
  decision:    '결정 요청',
  execution:   '실행 내용',
}

const ROLE_PEAK_LABEL: Partial<Record<StorylinePageRole, string>> = {
  decision:    '결정 요청',
  effect:      '효과 제시',
  evidence:    '검증 결과',
  execution:   '실행 내용',
  'next-step': '다음 단계',
}

// ── Reason Builder ────────────────────────────────────────────────────────────
// 전체 Storyline(pagePlan 포함)과 input을 받아 근거 문장을 생성

function buildReason(storyline: Storyline, input: ProjectInput): string {
  const action = inferRequestedAction(input)
  const actionLabel = ACTION_LABEL[action]

  const pages = storyline.pagePlan
  const firstRole = pages[0]?.role ?? 'hook'
  const startLabel = ROLE_START_LABEL[firstRole] ?? firstRole

  // Peak = 핵심 메시지가 납득되는 페이지 (decision > effect > evidence > execution)
  const peakOrder: StorylinePageRole[] = ['decision', 'effect', 'evidence', 'execution']
  const peakPage = pages.find((p) => peakOrder.includes(p.role))
  const peakLabel = peakPage
    ? `${peakPage.order}번째 페이지(${ROLE_PEAK_LABEL[peakPage.role] ?? peakPage.role})`
    : '중반부'

  const goal = input.reportGoal?.trim()
  const goalSnippet = goal
    ? `"${goal.slice(0, 35)}${goal.length > 35 ? '…' : ''}"`
    : null
  const situation = input.reportContext?.trim()
  const sitSnippet = situation
    ? `"${situation.slice(0, 35)}${situation.length > 35 ? '…' : ''}"`
    : null

  const lines: string[] = []

  switch (storyline.type) {
    case 'execution':
      lines.push(
        goalSnippet
          ? `핵심 목표(${goalSnippet})에 대한 ${actionLabel}에 실행 성과 중심 구조가 적합합니다.`
          : '실행 결과와 단계별 성과로 다음 판단을 끌어내는 구조입니다.'
      )
      lines.push(`${startLabel}으로 시작해 ${peakLabel}에 핵심 메시지를 배치합니다.`)
      break

    case 'roi':
      lines.push(
        goalSnippet
          ? `핵심 목표(${goalSnippet})에서 ${actionLabel}를 위해 수치 기반 ROI 구조가 유효합니다.`
          : '비효율 규모를 수치로 보여주고 효과로 납득시키는 구조입니다.'
      )
      lines.push(`비효율 제시 → ${peakLabel} 순서로 납득 밀도를 높입니다.`)
      if (!goal?.match(/수치|kpi|roi|절감|향상/i)) {
        lines.push('구체적 수치가 없다면 overview-kpi 페이지에 산정 기준을 명시하세요.')
      }
      break

    case 'decision':
      lines.push(
        goalSnippet
          ? `핵심 목표(${goalSnippet})에서 ${actionLabel}이 명시되어 있어 선택지 제시 → 결정 구조가 직접적입니다.`
          : `오늘 ${actionLabel}이 필요한 항목이 있을 때 효과적인 구조입니다.`
      )
      lines.push(`${startLabel}으로 시작해 ${peakLabel}에 추천안과 결정 요청을 배치합니다.`)
      break

    case 'scope-clarification':
      lines.push(
        sitSnippet
          ? `보고 맥락(${sitSnippet})에서 범위 혼선 가능성이 있어, 다루는 것과 다루지 않는 것을 먼저 확정하는 구조가 적합합니다.`
          : '범위를 먼저 확정해 불필요한 질문을 차단할 때 효과적인 구조입니다.'
      )
      lines.push(`${startLabel}으로 시작해 ${peakLabel}에 확정 사항을 배치합니다.`)
      break

    case 'alignment':
      // alignment 추천 근거는 반드시 goal에서 정렬 의도가 있는 경우에만 강하게 작성
      // situation에 전략 키워드가 있어도 goal이 정렬 목적이 아니면 선택적 대안으로만 제시
      {
        const goalMentionsAlignment = /정렬|align|연계|방향/.test(
          (input.reportGoal ?? '').toLowerCase()
        )
        if (goalMentionsAlignment && goalSnippet) {
          lines.push(
            `핵심 목표(${goalSnippet})에 방향 정렬 의도가 포함되어 있어 포지셔닝 → 기여 구조가 적합합니다.`
          )
        } else {
          lines.push(
            `전략 맥락을 배경으로 이 과제의 위치를 먼저 포지셔닝하고 싶다면 선택하세요.`
          )
          lines.push(
            `전략 맥락이 보고 배경으로만 언급된 경우, ${actionLabel} 목적에는 다른 구조가 더 직접적일 수 있습니다.`
          )
        }
        lines.push(
          `전략 맥락 → 현재 과제 위치 → 기여 흐름으로 ${peakLabel}에 확장 가능성을 배치합니다.`
        )
      }
      break

    case 'demo':
      lines.push(
        goalSnippet
          ? `핵심 목표(${goalSnippet})에서 ${actionLabel}를 위해 결과 먼저 보여주는 구조가 효과적입니다.`
          : '설명보다 결과를 먼저 보여줘야 할 때 적합한 구조입니다.'
      )
      lines.push(`확인 기준 먼저 제시 후 ${peakLabel}에 검증 결과를 배치합니다.`)
      break

    default:
      lines.push('입력 맥락을 종합해 이 구조를 선택했습니다.')
  }

  return lines.join(' ')
}

// ── Goal-Driven Primary Type ──────────────────────────────────────────────────

const GOAL_SIGNALS: Array<[RegExp, StorylineType]> = [
  [/승인|확정|결정|판단|선택지/, 'decision'],
  [/효과|roi|수치|절감|비용|향상/, 'roi'],
  [/데모|시연|검증|poc/, 'demo'],
  // alignment: goal must explicitly state alignment intent
  [/방향성?\s*정렬|방향\s*합의|전략\s*연계|align/, 'alignment'],
  [/범위|오해|역할|r&r|분리|명확화/, 'scope-clarification'],
  [/실행\s*성과|진행\s*현황|중간\s*보고|완료/, 'execution'],
]

function goalDrivenType(goal: string): StorylineType | null {
  if (!goal.trim()) return null
  const g = goal.toLowerCase()
  for (const [pattern, type] of GOAL_SIGNALS) {
    if (pattern.test(g)) return type
  }
  return null
}

// ── Keyword Scoring (secondary — from situation/title only) ───────────────────

const KEYWORD_PATTERNS: Partial<Record<StorylineType, RegExp>> = {
  demo:                  /데모|시연|시뮬|prototype|프로토타입/i,
  roi:                   /roi|효과|시간\s*절감|비용\s*절감|kpi|수치|향상|절감/i,
  decision:              /의사결정|승인\s*요청|결정\s*필요|선택지|판단\s*요청/i,
  'scope-clarification': /범위|오해|역할|r&r|분리|구분|포함하지\s*않|제외|명확/i,
  // alignment: situation 키워드만으로는 점수를 올리지 않음 — goal에서만 점수를 부여
  execution:             /실행\s*성과|진행\s*현황|poc\s*결과|중간\s*성과|완료|단계별\s*결과/i,
}

function scoreTypes(text: string): Partial<Record<StorylineType, number>> {
  const scores: Partial<Record<StorylineType, number>> = {}
  for (const [type, pattern] of Object.entries(KEYWORD_PATTERNS) as [StorylineType, RegExp][]) {
    const matches = text.match(new RegExp(pattern.source, 'gi'))
    scores[type] = matches?.length ?? 0
  }
  // alignment는 goal-driven에서만 선택됨 — situation 점수 0 유지
  scores['alignment'] = 0
  return scores
}

function bestFromGroup(
  group: StorylineType[],
  scores: Partial<Record<StorylineType, number>>,
  exclude: StorylineType[]
): StorylineType {
  return group
    .filter((t) => !exclude.includes(t))
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))[0]!
}

// ── Top-Three Selection ───────────────────────────────────────────────────────

function selectTopThree(input: ProjectInput): StorylineType[] {
  const primary = goalDrivenType(input.reportGoal ?? '')

  // Score from situation + title only
  // alignment is intentionally excluded from this scoring (see scoreTypes)
  const secondaryText = [
    input.reportContext ?? '',
    input.reportTitle,
  ].join(' ')
  const scores = scoreTypes(secondaryText)

  const card1 = primary ?? bestFromGroup(DIVERSITY_GROUPS[0], scores, [])
  const card1GroupIdx = DIVERSITY_GROUPS.findIndex((g) => g.includes(card1))

  const group2Idx = (card1GroupIdx + 1) % DIVERSITY_GROUPS.length
  const card2 = bestFromGroup(DIVERSITY_GROUPS[group2Idx], scores, [card1])

  const group3Idx = (card1GroupIdx + 2) % DIVERSITY_GROUPS.length
  const card3 = bestFromGroup(DIVERSITY_GROUPS[group3Idx], scores, [card1, card2])

  return [card1, card2, card3]
}

// ── Template Factories ────────────────────────────────────────────────────────
// 각 factory는 pagePlan을 먼저 구성한 뒤 buildReason에 전달

function makeExecution(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.reportContext ?? '현재 진행 중인 과제'
  const goal = input.reportGoal ?? '다음 단계 추진'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(), order: 1, role: 'hook',
      message: `이번 보고는 ${title}의 실행 결과를 공유하고 다음 판단 지점을 정리합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(), order: 2, role: 'problem',
      message: `실행 이전 ${situation}에서 어떤 구조적 문제가 있었는지 제시합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(), order: 3, role: 'execution',
      message: `실제로 무엇을 어떤 순서로 실행했는지 단계별로 보여줍니다.`,
      suggestedLayoutType: 'execution-plan',
    },
    {
      id: uid(), order: 4, role: 'effect',
      message: `실행 결과 확인된 직접 효과와 간접 효과를 분리해 제시합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(), order: 5, role: 'next-step',
      message: `남은 병목과 ${goal}에 필요한 다음 실행 항목을 정리합니다.`,
      suggestedLayoutType: 'timeline',
    },
  ]

  const base: Omit<Storyline, 'recommendedReason'> = {
    id: `mock-execution-${uid()}`,
    name: '실행한 결과가 다음 단계의 근거다',
    type: 'execution',
    oneLineSummary: '지금까지 실행한 것과 확인된 효과를 중심으로 다음 단계의 근거를 만든다',
    keyMessage: '우리가 실행한 것은 실험이 아닌 구조 검증이었고, 그 결과는 다음 단계를 정당화합니다.',
    narrativeFlow: [
      '지금까지 무엇을 실행했는가 (범위 확정)',
      '왜 이 실행이 의미 있는가 (문제-실행 연결)',
      '확인된 효과 (직접/간접 분리)',
      '남은 병목은 무엇인가',
      '다음 실행에 필요한 것',
    ],
    pagePlan,
  }
  return { ...base, recommendedReason: buildReason({ ...base, recommendedReason: '' }, input) }
}

function makeDecision(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.reportContext ?? '현재 상황'
  const goal = input.reportGoal ?? '추진 방향 결정'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(), order: 1, role: 'hook',
      message: `${goal}을 위해 오늘 결정이 필요한 항목과 이유를 먼저 제시합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(), order: 2, role: 'context',
      message: `${situation}이 지금 결정을 요구하는 배경과 선택 가능한 방향을 설명합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(), order: 3, role: 'decision',
      message: `${title} 추천안과 그 근거 지표를 제시합니다.`,
      suggestedLayoutType: 'overview-kpi',
    },
    {
      id: uid(), order: 4, role: 'risk',
      message: `추진 시 주의해야 할 리스크와 선제 대응 방안을 정리합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(), order: 5, role: 'next-step',
      message: `오늘 결정 요청 항목과 후속 일정을 명시합니다.`,
      suggestedLayoutType: 'discussion-cards',
    },
  ]

  const base: Omit<Storyline, 'recommendedReason'> = {
    id: `mock-decision-${uid()}`,
    name: '선택지를 정리해 오늘 결정을 이끌어내는 구조',
    type: 'decision',
    oneLineSummary: '선택 가능한 방향을 제시하고, 오늘 결정해야 할 항목을 명확히 요청한다',
    keyMessage: '지금 이 결정이 늦어지면 다음 단계 전체가 미뤄집니다. 오늘 확정이 필요한 항목은 하나입니다.',
    narrativeFlow: [
      '지금 결정이 필요한 이유 (타이밍 근거)',
      '선택 가능한 방향 (옵션 구조화)',
      '추천안과 그 근거',
      '리스크와 선제 대응',
      '요청 의사결정 명시',
    ],
    pagePlan,
  }
  return { ...base, recommendedReason: buildReason({ ...base, recommendedReason: '' }, input) }
}

function makeScopeClarification(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.reportContext ?? '보고 배경'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(), order: 1, role: 'scope',
      message: `${title}에서 다루는 것과 다루지 않는 것을 처음부터 명확히 합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(), order: 2, role: 'context',
      message: `${situation}에서 오해가 생기기 쉬운 배경과 전제를 설명합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(), order: 3, role: 'evidence',
      message: `확정된 사항을 기준으로 현재 상태 수치를 제시합니다.`,
      suggestedLayoutType: 'overview-kpi',
    },
    {
      id: uid(), order: 4, role: 'next-step',
      message: `후속 검토 대상과 논의가 필요한 항목을 분리해 정리합니다.`,
      suggestedLayoutType: 'discussion-cards',
    },
  ]

  const base: Omit<Storyline, 'recommendedReason'> = {
    id: `mock-scope-${uid()}`,
    name: '범위를 먼저 확정해 불필요한 오해를 차단하는 구조',
    type: 'scope-clarification',
    oneLineSummary: '이번 보고의 범위와 포함하지 않는 것을 먼저 정리해 불필요한 오해를 차단한다',
    keyMessage: '이번 보고는 X를 다룹니다. Y는 이번 범위가 아니며, Z는 후속 검토 대상입니다.',
    narrativeFlow: [
      '이번 보고 범위 확정',
      '다루지 않는 범위 명시',
      '확정된 것 vs 검토 중인 것 분리',
      '오해가 생기기 쉬운 배경 설명',
      '후속 논의 항목 정리',
    ],
    pagePlan,
  }
  return { ...base, recommendedReason: buildReason({ ...base, recommendedReason: '' }, input) }
}

function makeRoi(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.reportContext ?? '현재 업무 구조'
  const goal = input.reportGoal ?? '효과 입증'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(), order: 1, role: 'problem',
      message: `${situation}의 구조적 비효율을 정량 지표로 제시합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(), order: 2, role: 'scope',
      message: `${title}의 적용 범위와 효과 산정 기준을 명확히 합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(), order: 3, role: 'evidence',
      message: `${goal}의 핵심 수치를 산정 기준과 함께 제시합니다.`,
      suggestedLayoutType: 'overview-kpi',
    },
    {
      id: uid(), order: 4, role: 'effect',
      message: `직접 효과(즉시 측정 가능)와 간접 효과(조건부 실현)를 분리합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(), order: 5, role: 'next-step',
      message: `효과 실현을 위한 다음 단계와 확산 조건을 제시합니다.`,
      suggestedLayoutType: 'timeline',
    },
  ]

  const base: Omit<Storyline, 'recommendedReason'> = {
    id: `mock-roi-${uid()}`,
    name: '현재 비효율을 수치로 보여주고 효과로 납득시키는 구조',
    type: 'roi',
    oneLineSummary: '현재 비효율의 규모를 수치로 보여주고, 개선 후 직간접 효과로 납득시킨다',
    keyMessage: '지금 구조를 바꾸면 측정 가능한 효과가 생기고, 그 조건은 이미 확보되어 있습니다.',
    narrativeFlow: [
      '현재 비효율 구조의 규모 (정량화)',
      '개선 후 어떻게 달라지는가',
      '직접 효과 (즉시 측정 가능)',
      '간접 효과 (조건부 실현)',
      '효과 확산 조건과 다음 단계',
    ],
    pagePlan,
  }
  return { ...base, recommendedReason: buildReason({ ...base, recommendedReason: '' }, input) }
}

function makeDemo(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const goal = input.reportGoal ?? '기능 확인'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(), order: 1, role: 'hook',
      message: `오늘 데모에서 ${goal}을 위해 무엇을 확인할 것인지 먼저 제시합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(), order: 2, role: 'execution',
      message: `${title} 데모의 입력 조건과 진행 과정을 설명합니다.`,
      suggestedLayoutType: 'execution-plan',
    },
    {
      id: uid(), order: 3, role: 'evidence',
      message: `데모 결과물과 핵심 성능 지표를 보여줍니다.`,
      suggestedLayoutType: 'overview-kpi',
    },
    {
      id: uid(), order: 4, role: 'effect',
      message: `확인된 가능성(직접)과 현재 한계(간접)를 분리해 정리합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(), order: 5, role: 'next-step',
      message: `한계 개선 방향과 다음 검증 일정을 제시합니다.`,
      suggestedLayoutType: 'timeline',
    },
  ]

  const base: Omit<Storyline, 'recommendedReason'> = {
    id: `mock-demo-${uid()}`,
    name: '설명보다 데모로 검증 결과를 먼저 보여주는 구조',
    type: 'demo',
    oneLineSummary: '설명보다 먼저 "오늘 무엇을 확인할 것인가"를 제시하고, 결과로 납득시킨다',
    keyMessage: '이 기능이 실제로 동작합니다. 오늘 확인한 것은 가능성이 아니라 실증입니다.',
    narrativeFlow: [
      '무엇을 확인할 것인가 (확인 기준 먼저)',
      '입력과 조건 설명',
      '생성/실행 과정',
      '결과물과 핵심 지표',
      '한계와 다음 개선 방향',
    ],
    pagePlan,
  }
  return { ...base, recommendedReason: buildReason({ ...base, recommendedReason: '' }, input) }
}

function makeAlignment(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.reportContext ?? '전사 전략 맥락'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(), order: 1, role: 'context',
      message: `${situation}에서 상위 전략/로드맵과 현재 과제가 어떻게 연결되는지 설명합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(), order: 2, role: 'scope',
      message: `전사 관점에서 ${title}의 위치와 이 시점에 선행 실행하는 의미를 정의합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(), order: 3, role: 'execution',
      message: `선행 실행 결과와 전사 기여 가능성을 제시합니다.`,
      suggestedLayoutType: 'execution-plan',
    },
    {
      id: uid(), order: 4, role: 'effect',
      message: `전사 관점의 직접 기여와 간접 환류 가능성을 구분합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(), order: 5, role: 'next-step',
      message: `전사 확장 방향과 다음 단계 연결 조건을 제시합니다.`,
      suggestedLayoutType: 'timeline',
    },
  ]

  const base: Omit<Storyline, 'recommendedReason'> = {
    id: `mock-alignment-${uid()}`,
    name: '전사 전략 → 현재 실행 → 확장 가능성으로 이어지는 구조',
    type: 'alignment',
    oneLineSummary: '상위 전략과 현재 과제를 연결해 이 보고의 전사적 의미를 먼저 포지셔닝한다',
    keyMessage: '이 과제는 전사 방향과 독립적이지 않습니다. 선행 실행의 의미는 전사 확장 가능성에 있습니다.',
    narrativeFlow: [
      '상위 전략/로드맵 맥락 (포지셔닝)',
      '현재 과제의 위치와 역할',
      '선행 실행 결과',
      '전사 기여 및 환류 가능성',
      '다음 확장 방향',
    ],
    pagePlan,
  }
  return { ...base, recommendedReason: buildReason({ ...base, recommendedReason: '' }, input) }
}

// ── Template Registry ─────────────────────────────────────────────────────────

const FACTORIES: Record<StorylineType, (input: ProjectInput) => Storyline> = {
  execution:             makeExecution,
  decision:              makeDecision,
  'scope-clarification': makeScopeClarification,
  roi:                   makeRoi,
  demo:                  makeDemo,
  alignment:             makeAlignment,
  'problem-solution':    makeExecution,
  'risk-control':        makeDecision,
}

// ── Mock Agent ────────────────────────────────────────────────────────────────

export class MockStorylineAgent implements StorylineAgent {
  async generateStorylines(
    input: ProjectInput,
    _analysis?: AnalysisResult
  ): Promise<Storyline[]> {
    const selected = selectTopThree(input)
    return selected.map((type) => FACTORIES[type]!(input))
  }
}

// ── Dev helper ────────────────────────────────────────────────────────────────

export async function previewStorylines(
  input: Partial<ProjectInput> & Pick<ProjectInput, 'reportTitle'>
): Promise<Storyline[]> {
  const agent = new MockStorylineAgent()
  const full: ProjectInput = {
    reportTitle: input.reportTitle,
    reportContext: input.reportContext,
    reportGoal: input.reportGoal,
    referenceMaterial: input.referenceMaterial,
    avoidPoints: input.avoidPoints,
  }
  const result = await agent.generateStorylines(full)
  console.log('[MockStorylineAgent] candidates:')
  result.forEach((s, i) => {
    console.log(`  ${i + 1}. [${s.type}] ${s.name}`)
    console.log(`     action:  ${inferRequestedAction(full)}`)
    console.log(`     pages:   ${s.pagePlan.map((p) => `${p.role}`).join(' → ')}`)
    console.log(`     reason:  ${s.recommendedReason}`)
  })
  return result
}
