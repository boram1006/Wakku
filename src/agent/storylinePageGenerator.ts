import type { ProjectInput, AgentAnswers } from '@/types/agent'
import type { Storyline, StorylinePageRole } from '@/types/storyline'
import type { LayoutType, ReportBlock, ReportPage } from '@/types/report'
import { defaultBlocks } from '@/lib/pageDefaults'
import { buildNarrativePlan } from './narrativePlan'

const uid = () => Math.random().toString(36).slice(2, 9)
const pad = (n: number) => String(n).padStart(2, '0')

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractLines(text: string): string[] {
  return text.split(/[\n.!?。]/).map((s) => s.trim()).filter((s) => s.length > 8)
}

function pickBy(lines: string[], pattern: RegExp): string[] {
  return lines.filter((l) => pattern.test(l)).slice(0, 4)
}

const RE_PROBLEM  = /문제|이슈|현황|병목|불편|한계|비효율|지연|어려움/
const RE_EFFECT   = /효과|기대|절감|단축|향상|개선|%|시간\s*절감/i
const RE_SOLUTION = /개선|방향|전환|도입|자동화|해결|접근/i
const RE_TIMELINE = /단계|일정|로드맵|\d+월|\d+분기|phase|sprint/i
const RE_KPI      = /(\d+\.?\d*)\s*(%|h|시간|건|개|명|만원|억)/g

function extractKpis(text: string) {
  const out: { raw: string; value: string; unit: string }[] = []
  const re = new RegExp(RE_KPI.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const raw = m[0].trim()
    out.push({
      raw,
      value: raw.match(/(\d+\.?\d*)/)?.[1] ?? '00',
      unit: raw.match(/[\d.]+\s*(.*)/)?.[1]?.trim() ?? '%',
    })
  }
  return [...new Map(out.map((k) => [k.raw, k])).values()].slice(0, 6)
}


// ── Title templates ────────────────────────────────────────────────────────────

const ROLE_TITLE: Record<StorylinePageRole, string> = {
  hook:        '보고 범위와\n판단 지점을 먼저 정리합니다',
  context:     '배경과 전제를\n먼저 납득시킵니다',
  scope:       '이번 보고의 범위와\n다루지 않는 것을 구분합니다',
  problem:     '개선이 필요한 구조적 문제를\n정리합니다',
  evidence:    '핵심 수치와 근거를\n먼저 확인합니다',
  decision:    '오늘 결정해야 할 항목과\n추천 방향을 제시합니다',
  solution:    '해결 방향을\n구체적으로 정리합니다',
  effect:      '직접 효과와 간접 효과를\n분리해 설명합니다',
  'to-be':     '변화 후 달라지는 것을\n구체적으로 보여줍니다',
  execution:   '실행한 것과\n확인된 결과를 정리합니다',
  risk:        '주요 리스크와\n선제 대응 방안을 정리합니다',
  'next-step': '다음 단계와\n추진 일정을 정리합니다',
  appendix:    '참고 자료',
}

function makeTitle(role: StorylinePageRole, input: ProjectInput): string {
  if (role === 'hook') {
    return `${input.reportTitle}\n보고 범위와 판단 지점을 정리합니다`
  }
  if (role === 'solution' && input.reportGoal) {
    const goal = input.reportGoal.length > 18
      ? `${input.reportGoal.slice(0, 17)}…`
      : input.reportGoal
    return `${goal}\n구체적으로 정리합니다`
  }
  return ROLE_TITLE[role] ?? '페이지 제목을 입력하세요'
}

// ── Block builders ─────────────────────────────────────────────────────────────

function buildHookBlocks(input: ProjectInput, answers: AgentAnswers): ReportBlock[] {
  return [
    {
      id: uid(), type: 'card', meta: '오늘 보고',
      title: (input.reportGoal ?? '진행 현황 및 주요 결과').slice(0, 22),
      body: input.reportGoal
        ?? `${input.reportTitle}의 주요 진행 결과와 다음 단계 근거를 공유합니다.`,
    },
    {
      id: uid(), type: 'card', meta: '배경',
      title: '이 보고가 지금 필요한 이유',
      body: input.currentSituation ?? `${input.reportTitle}에 대한 의사결정이 필요한 시점입니다.`,
    },
    {
      id: uid(), type: 'card', meta: '판단 지점',
      title: '오늘 확정할 항목',
      body: answers.decision_item
        || `${input.reportTitle} 다음 단계 추진 여부를 결정합니다.`,
    },
  ]
}

function buildScopeBlocks(input: ProjectInput, answers: AgentAnswers): ReportBlock[] {
  return [
    {
      id: uid(), type: 'card', meta: '포함',
      title: '이번 보고에서 다루는 것',
      body: input.reportGoal
        ?? `${input.reportTitle} 진행 결과 및 주요 의사결정 항목을 다룹니다.`,
    },
    {
      id: uid(), type: 'card', meta: '제외',
      title: '이번 범위에 포함하지 않는 것',
      body: answers.scope_excluded
        || '예산 집행, 조직 개편, 후속 확산 범위는 이번 보고 범위 외입니다.',
    },
    {
      id: uid(), type: 'card', meta: '후속 검토',
      title: '별도 논의 대상',
      body: '확정된 범위 이외 항목은 별도 검토를 거쳐 결정합니다.',
    },
  ]
}

function buildContextBlocks(input: ProjectInput, storyline: Storyline): ReportBlock[] {
  const situation = input.currentSituation ?? ''
  const lines = extractLines([input.sourceText, situation].filter(Boolean).join('\n'))

  return [
    {
      id: uid(), type: 'card', meta: '현재 상황',
      title: situation.length > 0 ? situation.slice(0, 20) + (situation.length > 20 ? '…' : '') : '현재 배경과 맥락',
      body: situation || `${storyline.name} 보고를 위한 배경 맥락을 정리합니다.`,
    },
    {
      id: uid(), type: 'card', meta: '왜 지금인가',
      title: '이 보고가 지금 필요한 이유',
      body: lines[0] ?? `${input.reportTitle} 관련 의사결정이 다음 단계 추진을 위해 필요한 시점입니다.`,
    },
    {
      id: uid(), type: 'card', meta: '납득해야 할 전제',
      title: '보고 대상이 먼저 동의해야 할 것',
      body: storyline.narrativeFlow[0] ?? '이 보고의 출발점이 되는 핵심 전제를 설명합니다.',
    },
  ]
}

function buildProblemBlocks(input: ProjectInput): ReportBlock[] {
  const text = [input.sourceText, input.currentSituation].filter(Boolean).join('\n')
  const lines = extractLines(text)
  const problemLines = pickBy(lines, RE_PROBLEM)

  if (problemLines.length >= 2) {
    return problemLines.slice(0, 3).map((line, i) => ({
      id: uid(),
      type: 'card' as const,
      meta: `Problem ${pad(i + 1)}`,
      title: line.length > 22 ? `${line.slice(0, 20)}…` : line,
      body: line,
    }))
  }

  const situation = input.currentSituation ?? ''
  return [
    {
      id: uid(), type: 'card', meta: 'Problem 01',
      title: '현재 구조의 핵심 제약',
      body: situation
        ? `${situation.slice(0, 60)}에서 반복적인 재해석 과정이 발생하고 있습니다.`
        : '현재 프로세스에서 중간 산출물 재해석 과정이 반복되어 착수 시점이 지연됩니다.',
    },
    {
      id: uid(), type: 'card', meta: 'Problem 02',
      title: '기준과 판단의 분산',
      body: '판단 기준이 여러 문서에 흩어져 있어 일관성이 낮고 반복 확인이 필요합니다.',
    },
    {
      id: uid(), type: 'card', meta: 'Problem 03',
      title: '후행 단계의 재작업 비용',
      body: '후행 단계에서 오류가 발견되어 수정 비용이 커지고 전체 일정이 지연됩니다.',
    },
  ]
}

function buildEvidenceBlocks(input: ProjectInput): ReportBlock[] {
  const text = [input.sourceText, input.currentSituation, input.reportGoal].filter(Boolean).join('\n')
  const kpis = extractKpis(text)

  if (kpis.length >= 3) {
    return kpis.slice(0, 3).map((kpi, i) => ({
      id: uid(),
      type: 'kpi' as const,
      value: kpi.value,
      meta: kpi.unit,
      title: (['주요 성과 지표', '개선 대상 기준', '전체 환산 효과'] as const)[i] ?? `지표 ${pad(i + 1)}`,
      body: `${kpi.raw} 기준으로 측정한 값입니다.`,
    }))
  }

  return [
    { id: uid(), type: 'kpi', value: '–', meta: '', title: '주요 성과 지표', body: '측정 기준 확정 후 수치를 입력하세요.' },
    { id: uid(), type: 'kpi', value: '–', meta: '', title: '개선 대상 규모', body: '적용 범위와 측정 단위를 기준으로 입력하세요.' },
    { id: uid(), type: 'kpi', value: '–', meta: '', title: '기대 효과 환산', body: '직접 효과 기준으로 보수적으로 산정한 값을 입력하세요.' },
  ]
}

function buildExecutionBlocks(input: ProjectInput, storyline: Storyline): ReportBlock[] {
  const text = [input.sourceText, input.currentSituation].filter(Boolean).join('\n')
  const lines = extractLines(text)
  const solutionLines = pickBy(lines, RE_SOLUTION)
  const steps = solutionLines.length >= 2 ? solutionLines : storyline.narrativeFlow.slice(0, 3)

  return [
    {
      id: uid(), type: 'card', meta: 'Step 01',
      title: (steps[0] ?? '준비 및 기준 정의').slice(0, 20),
      body: steps[0] ?? '실행 착수를 위한 기준과 범위를 정의합니다.',
    },
    {
      id: uid(), type: 'card', meta: 'Step 02',
      title: (steps[1] ?? '핵심 기능 구현').slice(0, 20),
      body: steps[1] ?? '우선순위 높은 기능을 순서대로 실행합니다.',
    },
    {
      id: uid(), type: 'card', meta: 'Step 03',
      title: (steps[2] ?? '검증 및 결과 확인').slice(0, 20),
      body: steps[2] ?? '실행 결과를 검증하고 효과를 측정합니다.',
    },
  ]
}

function buildEffectBlocks(input: ProjectInput): ReportBlock[] {
  const text = [input.sourceText, input.currentSituation, input.reportGoal].filter(Boolean).join('\n')
  const lines = extractLines(text)
  const effectLines = pickBy(lines, RE_EFFECT)

  return [
    {
      id: uid(), type: 'card', meta: '직접 효과',
      title: (effectLines[0] ?? '즉시 측정 가능한 효과').slice(0, 22),
      body: effectLines[0]
        ?? (input.currentSituation
          ? `${input.reportTitle} 적용으로 반복 업무와 리드타임 단축이 직접 확인됩니다.`
          : '현재 적용 범위 기준의 직접 절감 효과입니다.'),
    },
    {
      id: uid(), type: 'card', meta: '간접 효과',
      title: (effectLines[1] ?? '조건부 실현 가능 효과').slice(0, 22),
      body: effectLines[1]
        ?? '운영 기준과 데이터 구조 확보로 다음 단계 의사결정을 위한 조건이 마련됩니다.',
    },
  ]
}

function buildToBeBlocks(input: ProjectInput, answers: AgentAnswers, storyline: Storyline): ReportBlock[] {
  const text = [input.sourceText, input.currentSituation].filter(Boolean).join('\n')
  const lines = extractLines(text)
  const solutionLines = pickBy(lines, RE_SOLUTION)
  const core = answers.core_improvement ?? input.reportGoal ?? ''

  const s1 = solutionLines[0] ?? storyline.narrativeFlow[1] ?? '입력 구조와 판단 기준을 정리합니다.'
  const s2 = solutionLines[1] ?? storyline.narrativeFlow[2] ?? '핵심 기능을 단계적으로 실행합니다.'
  const s3 = solutionLines[2] ?? '검증과 수정을 통해 구조를 안정화합니다.'

  return [
    { id: uid(), type: 'flow', meta: '01', title: s1.slice(0, 18), body: s1 },
    { id: uid(), type: 'flow', meta: '02', title: s2.slice(0, 18), body: s2 },
    { id: uid(), type: 'flow', meta: '03', title: s3.slice(0, 18), body: s3 },
    {
      id: uid(), type: 'text',
      body: core
        || '이 구조가 작동하려면 기능 구현, 효과 기준, 데이터 운영 방식이 함께 준비되어야 합니다.',
    },
  ]
}

function buildTimelineBlocks(input: ProjectInput, storyline: Storyline): ReportBlock[] {
  const text = [input.sourceText, input.currentSituation].filter(Boolean).join('\n')
  const lines = extractLines(text)
  const timelineLines = pickBy(lines, RE_TIMELINE)

  if (timelineLines.length >= 2) {
    return timelineLines.slice(0, 4).map((line, i) => ({
      id: uid(),
      type: 'timeline' as const,
      meta: line.match(/(\d+단계|[A-Z]단계|\d+월|\d+분기|phase\s*\d+|sprint\s*\d+)/i)?.[0]
        ?? `${pad(i + 1)}단계`,
      body: line,
    }))
  }

  const lastFlow = storyline.narrativeFlow.at(-1) ?? '다음 단계 추진'
  return [
    { id: uid(), type: 'timeline', meta: '1단계', body: `${input.reportTitle} 결과 기반 범위 확정 및 기준 정의` },
    { id: uid(), type: 'timeline', meta: '2단계', body: '핵심 기능 적용 및 내부 검증' },
    { id: uid(), type: 'timeline', meta: '3단계', body: '효과 측정 및 운영 기준 문서화' },
    { id: uid(), type: 'timeline', meta: '후속 검토', body: `${lastFlow} — 확대 적용 범위는 별도 검토합니다.` },
  ]
}

function buildDiscussionBlocks(
  input: ProjectInput,
  answers: AgentAnswers,
  role: StorylinePageRole
): ReportBlock[] {
  if (role === 'risk') {
    return [
      {
        id: uid(), type: 'card', meta: '논의 01',
        title: '주요 실행 리스크',
        body: `${input.reportTitle} 추진 시 담당자 부재, 데이터 미확보 가능성에 주의가 필요합니다.`,
      },
      {
        id: uid(), type: 'card', meta: '논의 02',
        title: '선제 대응 방안',
        body: '리스크 발생 전 조기 감지 기준과 에스컬레이션 경로를 사전 정의합니다.',
      },
      {
        id: uid(), type: 'card', meta: '논의 03',
        title: '이해관계자 관리',
        body: '변경 범위와 영향 대상을 명확히 하여 불필요한 반발을 방지합니다.',
      },
    ]
  }

  // next-step as discussion cards
  return [
    {
      id: uid(), type: 'card', meta: '논의 01',
      title: '다음 단계 추진 항목',
      body: `${input.reportGoal ?? `${input.reportTitle} 다음 단계 실행 항목`}을 확정합니다.`,
    },
    {
      id: uid(), type: 'card', meta: '논의 02',
      title: '후속 검토 대상',
      body: '추가 검토가 필요한 항목은 별도 일정을 잡아 진행합니다.',
    },
    {
      id: uid(), type: 'card', meta: '논의 03',
      title: '결정 요청 사항',
      body: answers.decision_item || '오늘 결정을 기준으로 다음 실행 일정을 확정합니다.',
    },
  ]
}

// ── Block dispatcher ──────────────────────────────────────────────────────────

function buildBlocks(
  role: StorylinePageRole,
  layoutType: LayoutType,
  input: ProjectInput,
  answers: AgentAnswers,
  storyline: Storyline
): ReportBlock[] {
  switch (role) {
    case 'hook':
      return buildHookBlocks(input, answers)
    case 'scope':
      return buildScopeBlocks(input, answers)
    case 'context':
      return buildContextBlocks(input, storyline)
    case 'problem':
      return buildProblemBlocks(input)
    case 'evidence':
      return buildEvidenceBlocks(input)
    case 'decision':
      return layoutType === 'overview-kpi'
        ? buildEvidenceBlocks(input)
        : buildDiscussionBlocks(input, answers, role)
    case 'execution':
      return buildExecutionBlocks(input, storyline)
    case 'effect':
      return buildEffectBlocks(input)
    case 'solution':
    case 'to-be':
      return buildToBeBlocks(input, answers, storyline)
    case 'risk':
      return layoutType === 'timeline'
        ? buildTimelineBlocks(input, storyline)
        : buildDiscussionBlocks(input, answers, role)
    case 'next-step':
      return layoutType === 'timeline'
        ? buildTimelineBlocks(input, storyline)
        : buildDiscussionBlocks(input, answers, role)
    case 'appendix':
      return [
        { id: uid(), type: 'card', meta: '참고', title: '추가 자료', body: '보충 자료는 이 페이지에 추가합니다.' },
      ]
    default:
      return defaultBlocks(layoutType)
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Storyline → NarrativePlan → ReportPage[] 두 단계로 생성합니다.
 *
 * NarrativePlan: 보고 성격 / 설득 흐름 / 필요 페이지 / 제외 주제
 * ReportPage:    NarrativePlan의 sectionLabel + 블록 콘텐츠
 */
export function generatePagesFromStoryline(
  storyline: Storyline,
  input: ProjectInput,
  answers: AgentAnswers
): ReportPage[] {
  const plan = buildNarrativePlan(storyline)

  return plan.pages.map((page, index) => ({
    id: uid(),
    sectionNumber: pad(index + 1),
    sectionLabel: page.sectionLabel,
    title: makeTitle(page.role, input),
    subtitle: page.purpose,
    layoutType: page.layoutType,
    blocks: buildBlocks(page.role, page.layoutType, input, answers, storyline),
  }))
}
