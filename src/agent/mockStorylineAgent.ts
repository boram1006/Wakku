import type { ProjectInput, AnalysisResult } from '@/types/agent'
import type { Storyline, StorylinePagePlan, StorylineType } from '@/types/storyline'
import type { StorylineAgent } from './storylineAgent'

const uid = () => Math.random().toString(36).slice(2, 9)

// ── Keyword Scoring ───────────────────────────────────────────────────────────

const KEYWORD_PATTERNS: Record<string, RegExp> = {
  demo:                  /데모|시연|시뮬|prototype|프로토타입/i,
  roi:                   /roi|효과|시간\s*절감|비용\s*절감|kpi|수치|향상|절감/i,
  decision:              /의사결정|승인\s*요청|결정\s*필요|선택지|판단\s*요청/i,
  'scope-clarification': /범위|오해|역할|r&r|분리|구분|포함하지\s*않|제외|명확/i,
  alignment:             /전사|로드맵|전략\s*연계|확산|상위\s*전략|방향성\s*정렬/i,
  execution:             /실행\s*성과|진행\s*현황|poc\s*결과|중간\s*성과|완료|단계별\s*결과/i,
}

const DEFAULT_PRIORITY: StorylineType[] = [
  'execution',
  'roi',
  'decision',
  'scope-clarification',
  'alignment',
  'demo',
]

function selectTopThree(inputText: string): StorylineType[] {
  const scores: Record<string, number> = {}
  for (const [type, pattern] of Object.entries(KEYWORD_PATTERNS)) {
    const matches = inputText.match(new RegExp(pattern.source, 'gi'))
    scores[type] = matches?.length ?? 0
  }
  return [...DEFAULT_PRIORITY]
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
    .slice(0, 3)
}

// ── Template Factories ────────────────────────────────────────────────────────

function makeExecution(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.currentSituation ?? '현재 진행 중인 과제'
  const goal = input.reportGoal ?? '다음 단계 추진'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(),
      order: 1,
      role: 'hook',
      message: `이번 보고는 ${title}의 실행 결과를 공유하고 다음 판단 지점을 정리합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(),
      order: 2,
      role: 'problem',
      message: `실행 이전 ${situation}에서 어떤 구조적 문제가 있었는지 제시합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(),
      order: 3,
      role: 'execution',
      message: `실제로 무엇을 어떤 순서로 실행했는지 단계별로 보여줍니다.`,
      suggestedLayoutType: 'execution-plan',
    },
    {
      id: uid(),
      order: 4,
      role: 'effect',
      message: `실행 결과 확인된 직접 효과와 간접 효과를 분리해 제시합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(),
      order: 5,
      role: 'next-step',
      message: `남은 병목과 ${goal}에 필요한 다음 실행 항목을 정리합니다.`,
      suggestedLayoutType: 'timeline',
    },
  ]

  return {
    id: `mock-execution-${uid()}`,
    name: '실행한 결과가 다음 단계의 근거다',
    type: 'execution',
    oneLineSummary: `지금까지 실행한 것과 확인된 효과를 중심으로 다음 단계의 근거를 만든다`,
    recommendedReason: `currentSituation에 진행 경과가 포함되어 있어 실행 결과 기반 설득 구조가 적합합니다. KPI 수치가 없다면 effect 페이지 내용을 정성적으로 보완하세요.`,
    keyMessage: `우리가 실행한 것은 실험이 아닌 구조 검증이었고, 그 결과는 다음 단계를 정당화합니다.`,
    narrativeFlow: [
      '지금까지 무엇을 실행했는가 (범위 확정)',
      '왜 이 실행이 의미 있는가 (문제-실행 연결)',
      '확인된 효과 (직접/간접 분리)',
      '남은 병목은 무엇인가',
      '다음 실행에 필요한 것',
    ],
    pagePlan,
  }
}

function makeDecision(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.currentSituation ?? '현재 상황'
  const goal = input.reportGoal ?? '추진 방향 결정'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(),
      order: 1,
      role: 'hook',
      message: `${goal}을 위해 오늘 결정이 필요한 항목과 이유를 먼저 제시합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(),
      order: 2,
      role: 'context',
      message: `${situation}이 지금 결정을 요구하는 배경과 선택 가능한 방향을 설명합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(),
      order: 3,
      role: 'decision',
      message: `${title} 추천안과 그 근거 지표를 제시합니다.`,
      suggestedLayoutType: 'overview-kpi',
    },
    {
      id: uid(),
      order: 4,
      role: 'risk',
      message: `추진 시 주의해야 할 리스크와 선제 대응 방안을 정리합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(),
      order: 5,
      role: 'next-step',
      message: `오늘 결정 요청 항목과 후속 일정을 명시합니다.`,
      suggestedLayoutType: 'discussion-cards',
    },
  ]

  return {
    id: `mock-decision-${uid()}`,
    name: '선택지를 정리해 오늘 결정을 이끌어내는 구조',
    type: 'decision',
    oneLineSummary: `선택 가능한 방향을 제시하고, 오늘 결정해야 할 항목을 명확히 요청한다`,
    recommendedReason: `reportGoal에 승인/결정 관련 표현이 포함되어 있어 의사결정 구조가 적합합니다. 선택지가 2개 이상 없다면 decision 페이지를 추천안 단일 설명으로 조정하세요.`,
    keyMessage: `지금 이 결정이 늦어지면 다음 단계 전체가 미뤄집니다. 오늘 확정이 필요한 항목은 하나입니다.`,
    narrativeFlow: [
      '지금 결정이 필요한 이유 (타이밍 근거)',
      '선택 가능한 방향 (옵션 구조화)',
      '추천안과 그 근거',
      '리스크와 선제 대응',
      '요청 의사결정 명시',
    ],
    pagePlan,
  }
}

function makeScopeClarification(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.currentSituation ?? '보고 배경'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(),
      order: 1,
      role: 'scope',
      message: `${title}에서 다루는 것과 다루지 않는 것을 처음부터 명확히 합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(),
      order: 2,
      role: 'context',
      message: `${situation}에서 오해가 생기기 쉬운 배경과 전제를 설명합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(),
      order: 3,
      role: 'evidence',
      message: `확정된 사항을 기준으로 현재 상태 수치를 제시합니다.`,
      suggestedLayoutType: 'overview-kpi',
    },
    {
      id: uid(),
      order: 4,
      role: 'next-step',
      message: `후속 검토 대상과 논의가 필요한 항목을 분리해 정리합니다.`,
      suggestedLayoutType: 'discussion-cards',
    },
  ]

  return {
    id: `mock-scope-${uid()}`,
    name: '범위를 먼저 확정해 불필요한 오해를 차단하는 구조',
    type: 'scope-clarification',
    oneLineSummary: `이번 보고의 범위와 포함하지 않는 것을 먼저 정리해 불필요한 오해를 차단한다`,
    recommendedReason: `currentSituation에 범위 논의나 역할 분리 필요성이 감지됩니다. 보고 전에 상대방이 범위를 오해할 가능성이 높을 때 효과적입니다.`,
    keyMessage: `이번 보고는 X를 다룹니다. Y는 이번 범위가 아니며, Z는 후속 검토 대상입니다.`,
    narrativeFlow: [
      '이번 보고 범위 확정',
      '다루지 않는 범위 명시',
      '확정된 것 vs 검토 중인 것 분리',
      '오해가 생기기 쉬운 배경 설명',
      '후속 논의 항목 정리',
    ],
    pagePlan,
  }
}

function makeRoi(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.currentSituation ?? '현재 업무 구조'
  const goal = input.reportGoal ?? '효과 입증'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(),
      order: 1,
      role: 'problem',
      message: `${situation}의 구조적 비효율을 정량 지표로 제시합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(),
      order: 2,
      role: 'scope',
      message: `${title}의 적용 범위와 효과 산정 기준을 명확히 합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(),
      order: 3,
      role: 'evidence',
      message: `${goal}의 핵심 수치를 산정 기준과 함께 제시합니다.`,
      suggestedLayoutType: 'overview-kpi',
    },
    {
      id: uid(),
      order: 4,
      role: 'effect',
      message: `직접 효과(즉시 측정 가능)와 간접 효과(조건부 실현)를 분리합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(),
      order: 5,
      role: 'next-step',
      message: `효과 실현을 위한 다음 단계와 확산 조건을 제시합니다.`,
      suggestedLayoutType: 'timeline',
    },
  ]

  return {
    id: `mock-roi-${uid()}`,
    name: '현재 비효율을 수치로 보여주고 효과로 납득시키는 구조',
    type: 'roi',
    oneLineSummary: `현재 비효율의 규모를 수치로 보여주고, 개선 후 직간접 효과로 납득시킨다`,
    recommendedReason: `입력에 절감/향상 관련 수치가 포함되어 있어 ROI 구조가 효과적입니다. 숫자 기준이 없다면 overview-kpi 페이지에 "산정 기준 추가 필요" 명시를 권장합니다.`,
    keyMessage: `지금 구조를 바꾸면 측정 가능한 효과가 생기고, 그 조건은 이미 확보되어 있습니다.`,
    narrativeFlow: [
      '현재 비효율 구조의 규모 (정량화)',
      '개선 후 어떻게 달라지는가',
      '직접 효과 (즉시 측정 가능)',
      '간접 효과 (조건부 실현)',
      '효과 확산 조건과 다음 단계',
    ],
    pagePlan,
  }
}

function makeDemo(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const goal = input.reportGoal ?? '기능 확인'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(),
      order: 1,
      role: 'hook',
      message: `오늘 데모에서 ${goal}을 위해 무엇을 확인할 것인지 먼저 제시합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(),
      order: 2,
      role: 'execution',
      message: `${title} 데모의 입력 조건과 진행 과정을 설명합니다.`,
      suggestedLayoutType: 'execution-plan',
    },
    {
      id: uid(),
      order: 3,
      role: 'evidence',
      message: `데모 결과물과 핵심 성능 지표를 보여줍니다.`,
      suggestedLayoutType: 'overview-kpi',
    },
    {
      id: uid(),
      order: 4,
      role: 'effect',
      message: `확인된 가능성(직접)과 현재 한계(간접)를 분리해 정리합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(),
      order: 5,
      role: 'next-step',
      message: `한계 개선 방향과 다음 검증 일정을 제시합니다.`,
      suggestedLayoutType: 'timeline',
    },
  ]

  return {
    id: `mock-demo-${uid()}`,
    name: '설명보다 데모로 검증 결과를 먼저 보여주는 구조',
    type: 'demo',
    oneLineSummary: `설명보다 먼저 "오늘 무엇을 확인할 것인가"를 제시하고, 결과로 납득시킨다`,
    recommendedReason: `reportGoal에 데모/시연이 포함되어 있어 확인 중심 구조가 적합합니다. 결과물 스크린샷이나 수치가 없으면 evidence 페이지를 질적 설명으로 대체하세요.`,
    keyMessage: `이 기능이 실제로 동작합니다. 오늘 확인한 것은 가능성이 아니라 실증입니다.`,
    narrativeFlow: [
      '무엇을 확인할 것인가 (확인 기준 먼저)',
      '입력과 조건 설명',
      '생성/실행 과정',
      '결과물과 핵심 지표',
      '한계와 다음 개선 방향',
    ],
    pagePlan,
  }
}

function makeAlignment(input: ProjectInput): Storyline {
  const title = input.reportTitle
  const situation = input.currentSituation ?? '전사 전략 맥락'

  const pagePlan: StorylinePagePlan[] = [
    {
      id: uid(),
      order: 1,
      role: 'context',
      message: `${situation}에서 상위 전략/로드맵과 현재 과제가 어떻게 연결되는지 설명합니다.`,
      suggestedLayoutType: 'scope',
    },
    {
      id: uid(),
      order: 2,
      role: 'scope',
      message: `전사 관점에서 ${title}의 위치와 이 시점에 선행 실행하는 의미를 정의합니다.`,
      suggestedLayoutType: 'problem-cards',
    },
    {
      id: uid(),
      order: 3,
      role: 'execution',
      message: `선행 실행 결과와 전사 기여 가능성을 제시합니다.`,
      suggestedLayoutType: 'execution-plan',
    },
    {
      id: uid(),
      order: 4,
      role: 'effect',
      message: `전사 관점의 직접 기여와 간접 환류 가능성을 구분합니다.`,
      suggestedLayoutType: 'effect-split',
    },
    {
      id: uid(),
      order: 5,
      role: 'next-step',
      message: `전사 확장 방향과 다음 단계 연결 조건을 제시합니다.`,
      suggestedLayoutType: 'timeline',
    },
  ]

  return {
    id: `mock-alignment-${uid()}`,
    name: '전사 전략 → 현재 실행 → 확장 가능성으로 이어지는 구조',
    type: 'alignment',
    oneLineSummary: `상위 전략과 현재 과제를 연결해 이 보고의 전사적 의미를 먼저 포지셔닝한다`,
    recommendedReason: `currentSituation에 전사 전략 또는 상위 로드맵 맥락이 포함되어 있어 정렬형 구조가 적합합니다. 연결 근거가 추론이라면 recommendedReason에 명시하세요.`,
    keyMessage: `이 과제는 전사 방향과 독립적이지 않습니다. 선행 실행의 의미는 전사 확장 가능성에 있습니다.`,
    narrativeFlow: [
      '상위 전략/로드맵 맥락 (포지셔닝)',
      '현재 과제의 위치와 역할',
      '선행 실행 결과',
      '전사 기여 및 환류 가능성',
      '다음 확장 방향',
    ],
    pagePlan,
  }
}

// ── Template Registry ─────────────────────────────────────────────────────────

const FACTORIES: Record<string, (input: ProjectInput) => Storyline> = {
  execution:             makeExecution,
  decision:              makeDecision,
  'scope-clarification': makeScopeClarification,
  roi:                   makeRoi,
  demo:                  makeDemo,
  alignment:             makeAlignment,
}

// ── Mock Agent ────────────────────────────────────────────────────────────────

export class MockStorylineAgent implements StorylineAgent {
  async generateStorylines(
    input: ProjectInput,
    _analysis?: AnalysisResult
  ): Promise<Storyline[]> {
    const combined = [
      input.reportTitle,
      input.currentSituation,
      input.reportGoal,
      input.sourceText,
    ].join(' ')

    const selected = selectTopThree(combined)
    return selected.map((type) => FACTORIES[type]!(input))
  }
}

// ── Dev helper: 콘솔에서 Storyline 후보 확인 ─────────────────────────────────

/**
 * 개발/디버그용 헬퍼. 브라우저 콘솔 또는 Node.js에서 바로 실행 가능.
 *
 * @example
 * import { previewStorylines } from '@/agent/mockStorylineAgent'
 * previewStorylines({ reportTitle: 'AI 자동화 중간 보고', currentSituation: '임원 승인 요청' })
 */
export async function previewStorylines(
  input: Partial<ProjectInput> & Pick<ProjectInput, 'reportTitle'>
): Promise<Storyline[]> {
  const agent = new MockStorylineAgent()
  const full: ProjectInput = {
    reportTitle: input.reportTitle,
    currentSituation: input.currentSituation,
    reportGoal: input.reportGoal,
    sourceText: input.sourceText,
    avoidPoints: input.avoidPoints,
  }
  const result = await agent.generateStorylines(full)
  console.log('[MockStorylineAgent] candidates:')
  result.forEach((s, i) => {
    console.log(`  ${i + 1}. [${s.type}] ${s.name}`)
    console.log(`     summary: ${s.oneLineSummary}`)
    console.log(`     keyMessage: ${s.keyMessage}`)
    console.log(`     pages: ${s.pagePlan.map((p) => `${p.role}(${p.suggestedLayoutType})`).join(' → ')}`)
  })
  return result
}
