import type { AgentAnswers, AnalysisResult, ProjectInput } from '@/types/agent'
import type { LayoutType, ReportBlock, ReportData, ReportPage } from '@/types/report'

const HAS_PROBLEM = /문제|이슈|현황|병목|불편|한계|어려움|개선\s*필요|비효율/
const HAS_SOLUTION = /개선|방향|to.?be|tobe|전환|도입|구조|자동화|해결|접근/i
const HAS_TIMELINE = /단계|일정|로드맵|\d+월|\d+분기|q[1-4]|sprint|phase/i
const HAS_EFFECT = /효과|기대|절감|단축|향상|개선|roi|%|시간\s*절감/i
const HAS_KPI = /(\d+\.?\d*)\s*(%|h|시간|건|개|명|만원|억)/g

function extractLines(text: string): string[] {
  return text
    .split(/\n|[.!?]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 4)
}

function extractKpis(text: string): string[] {
  const matches: string[] = []
  let match: RegExpExecArray | null
  const regexp = new RegExp(HAS_KPI.source, 'g')

  while ((match = regexp.exec(text)) !== null) {
    matches.push(match[0].trim())
  }

  return [...new Set(matches)].slice(0, 6)
}

function extractByPattern(lines: string[], pattern: RegExp): string[] {
  return lines.filter((line) => pattern.test(line)).slice(0, 4)
}

function detectLayouts(input: ProjectInput): LayoutType[] {
  const text = [input.sourceText, input.reportContext, input.reportGoal].join('\n')
  const layouts: LayoutType[] = ['scope', 'overview-kpi']

  if (HAS_PROBLEM.test(text)) layouts.push('problem-cards')
  if (HAS_SOLUTION.test(text)) layouts.push('to-be-flow')
  if (HAS_TIMELINE.test(text)) layouts.push('timeline')
  layouts.push('effect-split')

  return layouts
}

function buildQuestions(input: ProjectInput, kpis: string[]) {
  const text = input.sourceText ?? ''
  const questions = []

  if (kpis.length > 0 && !/기준|산정|측정|기반/.test(text)) {
    questions.push({
      id: 'kpi_basis',
      question: `"${kpis[0]}" 수치의 산정 기준을 간단히 알려주세요.`,
      hint: '예: 프로젝트 1건 평균 기준, A 업무 구간 기준으로 측정',
      multiline: false,
    })
  }

  if (!/결정|판단|공유|검토\s*대상|오늘/.test(text)) {
    questions.push({
      id: 'scope_decision',
      question: '오늘 결정할 항목과 후속 검토 항목을 구분해 주세요.',
      hint: '오늘 결정: ...\n후속 검토: ...',
      multiline: true,
    })
  }

  if (HAS_SOLUTION.test(text) && !input.reportGoal) {
    questions.push({
      id: 'core_improvement',
      question: '이 보고서의 핵심 개선 방향을 한 문장으로 정리해 주세요.',
      hint: '예: A를 B 방식으로 전환해 C가 가능하도록 구조를 바꿉니다.',
      multiline: false,
    })
  }

  return questions.slice(0, 3)
}

export function analyzeInput(input: ProjectInput): AnalysisResult {
  const text = [input.sourceText, input.reportContext, input.reportGoal].join('\n')
  const lines = extractLines(text)
  const kpis = extractKpis(text)

  return {
    detectedLayouts: detectLayouts(input),
    detectedKpis: kpis,
    detectedProblems: extractByPattern(lines, HAS_PROBLEM),
    questions: buildQuestions(input, kpis),
  }
}

export function generateReport(
  input: ProjectInput,
  analysis: AnalysisResult,
  answers: AgentAnswers
): ReportData {
  const text = input.sourceText ?? ''
  const lines = extractLines(text)
  const { detectedLayouts, detectedKpis } = analysis
  const pages: ReportPage[] = []
  let pageNumber = 1

  const pad = (value: number) => String(value).padStart(2, '0')
  const nextSectionNumber = () => pad(pageNumber++)
  const parseNum = (raw: string) => raw.match(/(\d+\.?\d*)/)?.[1] ?? '00'
  const parseUnit = (raw: string) => raw.match(/[\d.]+\s*(.*)/)?.[1]?.trim() ?? '%'

  if (detectedLayouts.includes('scope')) {
    const scopeAnswer = answers.scope_decision ?? ''
    const [todayPart, followPart] = scopeAnswer.includes('\n')
      ? scopeAnswer.split('\n')
      : [scopeAnswer, '']
    const blocks: ReportBlock[] = [
      {
        id: 'scope-b0',
        type: 'card',
        meta: '오늘 보고',
        title: todayPart.replace(/오늘\s*결정\s*[:：]?\s*/i, '') || '진행 현황 및 주요 결과',
        body: input.reportGoal ?? '현재까지의 실행 결과와 확인된 내용을 공유합니다.',
      },
      {
        id: 'scope-b1',
        type: 'card',
        meta: '후속 검토',
        title: followPart.replace(/후속\s*검토\s*[:：]?\s*/i, '') || '확대 적용 및 추가 범위',
        body: '추가 요청 사항은 범위, 일정, 책임 기준을 분리해 별도 검토합니다.',
      },
      {
        id: 'scope-b2',
        type: 'card',
        meta: '판단 지점',
        title: '다음 단계 추진 방향',
        body: '오늘 공유한 결과를 기준으로 후속 추진 여부를 결정합니다.',
      },
    ]

    pages.push({
      id: 'scope',
      sectionNumber: nextSectionNumber(),
      sectionLabel: '보고 범위',
      title: `${input.reportTitle}\n보고 범위와 판단 지점을 정리합니다`,
      subtitle: input.reportContext ?? '오늘 보고할 내용과 후속 검토 대상을 먼저 구분합니다.',
      layoutType: 'scope',
      blocks,
    })
  }

  if (detectedLayouts.includes('overview-kpi')) {
    const basis = answers.kpi_basis ?? ''
    const basisNote = basis ? `(${basis} 기준)` : '(산정 기준 추가 필요)'
    const [k1, k2, k3] = detectedKpis.length >= 3 ? detectedKpis : ['00', '00', '00']
    const blocks: ReportBlock[] = [
      {
        id: 'overview-b0',
        type: 'kpi',
        value: parseNum(k1),
        meta: parseUnit(k1),
        title: '주요 효과 지표',
        body: '적용 구간 기준의 직접 개선 효과입니다.',
      },
      {
        id: 'overview-b1',
        type: 'kpi',
        value: parseNum(k2),
        meta: parseUnit(k2),
        title: '개선 대상 기준',
        body: '개선 대상 업무 기준으로 환산한 값입니다.',
      },
      {
        id: 'overview-b2',
        type: 'kpi',
        value: parseNum(k3),
        meta: parseUnit(k3),
        title: '전체 기준 환산',
        body: '전체 업무를 기준으로 보수적으로 환산한 값입니다.',
      },
    ]

    pages.push({
      id: 'overview',
      sectionNumber: nextSectionNumber(),
      sectionLabel: '개요',
      title: '세부 설명에 앞서,\n핵심 수치와 방향만 먼저 확인합니다',
      subtitle: `아래 수치는 ${basisNote} 산정한 값입니다.`,
      layoutType: 'overview-kpi',
      blocks,
    })
  }

  if (detectedLayouts.includes('problem-cards')) {
    const problems = extractByPattern(lines, HAS_PROBLEM)
    const blocks: ReportBlock[] =
      problems.length > 0
        ? problems.slice(0, 3).map((problem, index) => ({
            id: `problem-b${index}`,
            type: 'card',
            meta: `Problem ${pad(index + 1)}`,
            title: problem.length > 20 ? `${problem.slice(0, 20)}...` : problem,
            body: problem,
          }))
        : [
            {
              id: 'problem-b0',
              type: 'card',
              meta: 'Problem 01',
              title: '재해석이 필요한 중간 산출물',
              body: '중간 결과가 후속 입력값으로 이어지지 않아 사람이 다시 해석합니다.',
            },
            {
              id: 'problem-b1',
              type: 'card',
              meta: 'Problem 02',
              title: '기준과 데이터의 분산',
              body: '판단 기준이 여러 문서에 흩어져 있어 일관성이 낮습니다.',
            },
            {
              id: 'problem-b2',
              type: 'card',
              meta: 'Problem 03',
              title: '검증 지연으로 인한 재작업',
              body: '후행 단계에서 오류가 발견되어 수정 비용이 커집니다.',
            },
          ]

    pages.push({
      id: 'problem',
      sectionNumber: nextSectionNumber(),
      sectionLabel: '문제 정의',
      title: '개선이 필요한 구조적 문제를\n3가지로 압축합니다',
      subtitle: '단순 현황 나열이 아니라, 왜 바꿔야 하는지 설명합니다.',
      layoutType: 'problem-cards',
      blocks,
    })
  }

  if (detectedLayouts.includes('to-be-flow')) {
    const core = answers.core_improvement ?? input.reportGoal ?? ''
    const solutions = extractByPattern(lines, HAS_SOLUTION)
    const blocks: ReportBlock[] = [
      {
        id: 'tobe-b0',
        type: 'flow',
        meta: '01',
        title: solutions[0]?.slice(0, 18) || '입력 구조 정리',
        body: solutions[0] ?? '업무 요청과 기준을 시스템이 읽을 수 있게 분리합니다.',
      },
      {
        id: 'tobe-b1',
        type: 'flow',
        meta: '02',
        title: solutions[1]?.slice(0, 18) || '중간 산출물 생성',
        body: solutions[1] ?? '검토 가능한 초안을 빠르게 확보합니다.',
      },
      {
        id: 'tobe-b2',
        type: 'flow',
        meta: '03',
        title: solutions[2]?.slice(0, 18) || '검토·수정·확정',
        body: solutions[2] ?? '전문 판단이 필요한 영역은 사람이 검증합니다.',
      },
      {
        id: 'tobe-callout',
        type: 'text',
        body: '이 구조가 작동하려면 기능 구현과 효과 기준, 데이터 운영 방식이 함께 준비되어야 합니다.',
      },
    ]

    pages.push({
      id: 'tobe',
      sectionNumber: nextSectionNumber(),
      sectionLabel: '개선 방향',
      title: core || '단순 자동화가 아니라,\nWorkflow가 이어지는 구조로 바꿉니다',
      subtitle: '입력과 산출물이 연결되고, 사람의 판단과 시스템 실행 범위가 분리되도록 구성합니다.',
      layoutType: 'to-be-flow',
      blocks,
    })
  }

  if (detectedLayouts.includes('timeline')) {
    const timeLines = lines.filter((line) => HAS_TIMELINE.test(line)).slice(0, 4)
    const blocks: ReportBlock[] =
      timeLines.length >= 2
        ? timeLines.map((line, index) => ({
            id: `timeline-b${index}`,
            type: 'timeline',
            meta: line.match(/(\d+단계|[A-Z]단계|\d+월|\d+분기|phase\s*\d+|sprint\s*\d+)/i)?.[0] ?? `${index + 1}단계`,
            body: line,
          }))
        : [
            {
              id: 'timeline-b0',
              type: 'timeline',
              meta: '1단계 · 6월',
              body: '현황 분석 및 입력 구조 정의. 기존 데이터 수집 범위 확정.',
            },
            {
              id: 'timeline-b1',
              type: 'timeline',
              meta: '2단계 · 7월',
              body: 'MVP 구현 및 내부 검증. 핵심 기능 적용.',
            },
            {
              id: 'timeline-b2',
              type: 'timeline',
              meta: '3단계 · 8월',
              body: '운영 적용 및 효과 측정. 산정 기준 문서화.',
            },
            {
              id: 'timeline-b3',
              type: 'timeline',
              meta: '후속 검토',
              body: '확대 적용 범위와 조직 R&R은 별도 검토합니다.',
            },
          ]

    pages.push({
      id: 'timeline',
      sectionNumber: nextSectionNumber(),
      sectionLabel: '추진 일정',
      title: '확정 일정과 검토 예정 일정을\n분리해 정리합니다',
      subtitle: '단계별 범위는 확정 후 즉시 업데이트합니다.',
      layoutType: 'timeline',
      blocks,
    })
  }

  if (detectedLayouts.includes('effect-split')) {
    const effectLines = extractByPattern(lines, HAS_EFFECT)
    const blocks: ReportBlock[] = [
      {
        id: 'effect-b0',
        type: 'card',
        meta: '직접 효과',
        title: effectLines[0]?.slice(0, 22) || '시간·리드타임·반복 업무 절감',
        body:
          effectLines[0] ??
          `현재 적용 범위 기준 ${detectedKpis[0] ?? '측정 예정'}의 직접 절감 효과입니다.`,
      },
      {
        id: 'effect-b1',
        type: 'card',
        meta: '간접 효과',
        title: effectLines[1]?.slice(0, 22) || '후속 전개 조건 확보',
        body:
          effectLines[1] ??
          '운영 기준, 데이터 구조, 승인 방식을 다음 단계 의사결정에 필요한 조건으로 확보합니다.',
      },
    ]

    pages.push({
      id: 'effect',
      sectionNumber: nextSectionNumber(),
      sectionLabel: '기대효과',
      title: '직접 효과와 간접 효과를 분리해 설명합니다',
      subtitle: '단순 절감률뿐 아니라 후속 적용을 위한 조건과 판단 근거도 함께 제시합니다.',
      layoutType: 'effect-split',
      blocks,
    })
  }

  return { brand: input.reportTitle, pages }
}
