import type { ProjectInput, AnalysisResult, AgentQuestion, AgentAnswers } from '@/types/agent'
import type { Report, ReportSection, SectionType } from '@/types/report'

// ─── 텍스트 분석 헬퍼 ────────────────────────────────────────────────────────

const HAS_PROBLEM = /문제|이슈|현황|병목|불편|한계|어려움|개선이\s*필요|비효율/
const HAS_SOLUTION = /개선|방향|to.?be|tobe|전환|도입|구축|자동화|해결|대안|접근/i
const HAS_TIMELINE = /단계|일정|로드맵|\d+월|\d+분기|q[1-4]|sprint|phase/i
const HAS_EFFECT = /효과|기대|절감|단축|향상|개선율|roi|%|시간\s*절감/
const HAS_KPI = /(\d+\.?\d*)\s*(%|h|시간|건|개|명|억|만원|일)/g

function extractLines(text: string): string[] {
  return text
    .split(/\n|[。.!?]/)
    .map((l) => l.trim())
    .filter((l) => l.length > 4)
}

function extractKpis(text: string): string[] {
  const matches: string[] = []
  let m: RegExpExecArray | null
  const re = new RegExp(HAS_KPI.source, 'g')
  while ((m = re.exec(text)) !== null) {
    matches.push(m[0].trim())
  }
  return [...new Set(matches)].slice(0, 6)
}

function extractByPattern(lines: string[], pattern: RegExp): string[] {
  return lines.filter((l) => pattern.test(l)).slice(0, 4)
}

function pickLines(lines: string[], n: number): string[] {
  return lines.slice(0, n)
}

// ─── 섹션 감지 ───────────────────────────────────────────────────────────────

function detectSections(input: ProjectInput): SectionType[] {
  const text = [input.sourceText, input.reportContext, input.reportGoal].join('\n')
  const sections: SectionType[] = ['scope', 'overview']

  if (HAS_PROBLEM.test(text)) sections.push('problem')
  if (HAS_SOLUTION.test(text)) sections.push('tobe')
  if (HAS_TIMELINE.test(text)) sections.push('timeline')
  sections.push('effect')

  return sections
}

// ─── 질문 생성 (최대 3개) ────────────────────────────────────────────────────

function buildQuestions(input: ProjectInput, kpis: string[]): AgentQuestion[] {
  const text = input.sourceText ?? ''
  const questions: AgentQuestion[] = []

  // Q1: 수치 기준 — KPI가 있지만 산정 기준 언급 없을 때
  if (kpis.length > 0 && !/기준|산정|측정|기반/.test(text)) {
    questions.push({
      id: 'kpi_basis',
      question: `"${kpis[0]}" 등 수치의 산정 기준을 간단히 알려주세요.`,
      hint: '예: 프로젝트 1건 평균 기준, A 업무 구간 기준으로 측정',
      multiline: false,
    })
  }

  // Q2: 보고 범위 — 오늘 결정/공유 구분이 없을 때
  if (!/결정|판단|공유|검토\s*대상|오늘/.test(text)) {
    questions.push({
      id: 'scope_decision',
      question: '오늘 결정이 필요한 항목과 후속 검토 항목을 구분해 주세요.',
      hint: '오늘 결정: ...\n후속 검토: ...',
      multiline: true,
    })
  }

  // Q3: 개선 방향 한 줄 요약 — 개선 언급은 있지만 명확한 한 줄 목표가 없을 때
  if (HAS_SOLUTION.test(text) && !input.reportGoal) {
    questions.push({
      id: 'core_improvement',
      question: '이 보고의 핵심 개선 방향을 한 문장으로 정리해 주세요.',
      hint: '예: A를 B 방식으로 전환해 C가 가능하도록 구조를 바꿉니다.',
      multiline: false,
    })
  }

  return questions.slice(0, 3)
}

// ─── 섹션별 콘텐츠 생성 ──────────────────────────────────────────────────────

function buildScope(input: ProjectInput, answers: AgentAnswers, idx: number): ReportSection {
  const scopeAnswer = answers['scope_decision'] ?? ''
  const [todayPart, followPart] = scopeAnswer.includes('\n')
    ? scopeAnswer.split('\n')
    : [scopeAnswer, '']

  return {
    id: 'scope',
    type: 'scope',
    kicker: `${String(idx).padStart(2, '0')} · 보고 범위`,
    title: `${input.reportTitle}\n보고 범위와 판단 지점을 정리합니다`,
    subtitle: input.reportContext ?? '오늘 보고할 내용과 후속 검토 대상을 먼저 구분합니다.',
    isMuted: true,
    cards: [
      {
        label: '오늘 보고',
        labelAccent: true,
        title: todayPart ? todayPart.replace(/오늘\s*결정\s*[:：]?\s*/i, '') : '진행 현황 및 주요 결과',
        desc: input.reportGoal ?? '현재까지의 실행 결과와 확인된 내용을 공유합니다.',
        emphasis: true,
      },
      {
        label: '후속 검토',
        title: followPart ? followPart.replace(/후속\s*검토\s*[:：]?\s*/i, '') : '확대 적용 및 추가 범위',
        desc: '추가 요청 사항은 범위·일정·책임 기준을 분리해 별도 검토합니다.',
      },
      {
        label: '판단 지점',
        title: '다음 단계 추진 방향',
        desc: '오늘 공유된 결과를 기준으로 후속 추진 여부를 결정합니다.',
      },
    ],
  }
}

function buildOverview(input: ProjectInput, answers: AgentAnswers, kpis: string[], idx: number): ReportSection {
  const basis = answers['kpi_basis'] ?? ''
  const basisNote = basis ? `(${basis} 기준)` : '(산정 기준 추가 필요)'

  const [k1, k2, k3] = kpis.length >= 3
    ? kpis
    : ['00.0', '00.0', '00.0']

  const parseNum = (raw: string) => {
    const m = raw.match(/(\d+\.?\d*)/)
    return m ? m[1] : raw
  }
  const parseUnit = (raw: string) => {
    const m = raw.match(/[\d.]+\s*(.+)/)
    return m ? m[1].trim() : '%'
  }

  return {
    id: 'overview',
    type: 'overview',
    kicker: `${String(idx).padStart(2, '0')} · 개요`,
    title: '세부 설명에 앞서,\n핵심 수치와 방향만 먼저 확인합니다',
    subtitle: `아래 수치는 ${basisNote} 산정한 값입니다.`,
    isMuted: false,
    cards: [
      {
        kpiNum: parseNum(k1),
        kpiUnit: parseUnit(k1),
        title: '주요 효과 지표',
        desc: '적용 구간 기준의 직접 개선 효과입니다.',
      },
      {
        kpiNum: parseNum(k2),
        kpiUnit: parseUnit(k2),
        title: '개선 대상 기준',
        desc: '개선 대상 업무 기준으로 환산한 값입니다.',
        emphasis: true,
      },
      {
        kpiNum: parseNum(k3),
        kpiUnit: parseUnit(k3),
        title: '전체 기준 환산',
        desc: '전체 업무량 기준의 보수적 환산값입니다.',
      },
    ],
  }
}

function buildProblem(lines: string[], idx: number, sectionId = 'problem'): ReportSection {
  const problems = extractByPattern(lines, HAS_PROBLEM)

  const makeCard = (text: string, n: number) => ({
    label: `Problem ${String(n).padStart(2, '0')}`,
    title: text.length > 20 ? text.slice(0, 20) + '…' : text,
    desc: text,
  })

  return {
    id: sectionId,
    type: 'problem',
    kicker: `${String(idx).padStart(2, '0')} · 현재 상태`,
    title: '개선이 필요한 구조적 문제를\n3가지로 압축합니다',
    subtitle: '단순 현황 나열이 아니라, 왜 바꿔야 하는지 설득합니다.',
    isMuted: true,
    cards:
      problems.length >= 1
        ? problems.slice(0, 3).map((p, i) => makeCard(p, i + 1))
        : [
            { label: 'Problem 01', title: '재해석이 필요한 중간 산출물', desc: '중간 결과가 후속 입력값으로 이어지지 않아 사람이 다시 해석합니다.' },
            { label: 'Problem 02', title: '기준과 데이터의 분산', desc: '판단 기준이 여러 문서에 흩어져 있어 일관성이 낮습니다.' },
            { label: 'Problem 03', title: '검증 지연으로 인한 재작업', desc: '후행 단계에서 오류가 발견되어 수정 비용이 커집니다.' },
          ],
  }
}

function buildToBe(input: ProjectInput, answers: AgentAnswers, lines: string[], idx: number): ReportSection {
  const core = answers['core_improvement'] ?? input.reportGoal ?? ''
  const solutions = extractByPattern(lines, HAS_SOLUTION)

  return {
    id: 'tobe',
    type: 'tobe',
    kicker: `${String(idx).padStart(2, '0')} · 개선 방향`,
    title: core || '단순 자동화가 아니라,\nWorkflow가 이어지는 구조로 바꿉니다',
    subtitle: '입력과 산출물이 연결되고, 사람의 판단과 시스템 실행 범위가 분리되도록 구성합니다.',
    isMuted: false,
    steps: [
      {
        num: '01',
        title: solutions[0] ? solutions[0].slice(0, 18) : '입력 구조 정리',
        desc: solutions[0] ?? '업무 요청과 기준을 시스템이 읽을 수 있게 분리합니다.',
      },
      {
        num: '02',
        title: solutions[1] ? solutions[1].slice(0, 18) : '중간 산출물 생성',
        desc: solutions[1] ?? '검토 가능한 초안을 빠르게 확보합니다.',
      },
      {
        num: '03',
        title: solutions[2] ? solutions[2].slice(0, 18) : '검토·수정·확정',
        desc: solutions[2] ?? '현업 판단이 필요한 영역은 사람이 검증합니다.',
      },
    ],
    callout: '이 구조가 작동하려면 기능 구현과 함께 기준, 데이터, 운영 방식이 함께 준비되어야 합니다.',
  }
}

function buildTimeline(lines: string[], idx: number): ReportSection {
  const timeLines = lines
    .filter((l) => HAS_TIMELINE.test(l))
    .slice(0, 4)

  const parseRow = (line: string, fallbackLabel: string) => {
    const labelMatch = line.match(/(\d+단계|[A-Z]단계|\d+월|\d+분기|phase\s*\d+|sprint\s*\d+)/i)
    return {
      label: labelMatch ? labelMatch[0] : fallbackLabel,
      text: line,
    }
  }

  return {
    id: 'timeline',
    type: 'timeline',
    kicker: `${String(idx).padStart(2, '0')} · 추진 일정`,
    title: '확정 일정과 검토 예정 일정을\n분리해 정리합니다',
    subtitle: '단계별 범위는 확정 후 즉시 업데이트합니다.',
    isMuted: false,
    rows:
      timeLines.length >= 2
        ? timeLines.map((l, i) => parseRow(l, `${i + 1}단계`))
        : [
            { label: '1단계', text: '현황 분석 및 입력 구조 정의. 기준 데이터 수집 범위 확정.' },
            { label: '2단계', text: 'MVP 구현 및 내부 검증. 핵심 기능 적용.' },
            { label: '3단계', text: '운영 적용 및 효과 측정. 산정 기준 문서화.' },
            { label: '후속 검토', text: '확대 적용 범위 및 조직 R&R은 3단계 완료 후 별도 검토합니다.' },
          ],
  }
}

function buildEffect(lines: string[], kpis: string[], idx: number): ReportSection {
  const effectLines = extractByPattern(lines, HAS_EFFECT)

  return {
    id: 'effect',
    type: 'effect',
    kicker: `${String(idx).padStart(2, '0')} · 기대효과`,
    title: '직접 효과와 간접 효과를 분리해 설명합니다',
    subtitle: '단순 절감률뿐 아니라 후속 적용을 위한 조건과 판단 근거도 함께 제시합니다.',
    isMuted: true,
    cards: [
      {
        label: '직접 효과',
        labelAccent: true,
        title: effectLines[0] ? effectLines[0].slice(0, 22) : '시간·리드타임·반복 업무 절감',
        desc: effectLines[0] ?? `현재 적용 범위 기준 ${kpis[0] ?? '측정 예정'}의 직접 절감 효과입니다.`,
        emphasis: true,
      },
      {
        label: '간접 효과',
        title: effectLines[1] ? effectLines[1].slice(0, 22) : '후속 전개 조건 확보',
        desc: effectLines[1] ?? '운영 기준, 데이터 구조, 표준화 방식 등 다음 단계 의사결정에 필요한 조건을 확보합니다.',
      },
    ],
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function analyzeInput(input: ProjectInput): AnalysisResult {
  const text = [input.sourceText, input.reportContext, input.reportGoal].join('\n')
  const lines = extractLines(text)
  const kpis = extractKpis(text)
  const problems = extractByPattern(lines, HAS_PROBLEM)

  return {
    detectedSections: detectSections(input),
    detectedKpis: kpis,
    detectedProblems: problems,
    questions: buildQuestions(input, kpis),
  }
}

export function generateReport(
  input: ProjectInput,
  analysis: AnalysisResult,
  answers: AgentAnswers
): Report {
  const text = input.sourceText ?? ''
  const lines = extractLines(text)
  const { detectedSections, detectedKpis } = analysis

  const sections: ReportSection[] = []
  let idx = 1

  if (detectedSections.includes('scope')) {
    sections.push(buildScope(input, answers, idx++))
  }
  if (detectedSections.includes('overview')) {
    sections.push(buildOverview(input, answers, detectedKpis, idx++))
  }
  if (detectedSections.includes('problem')) {
    sections.push(buildProblem(lines, idx++))
  }
  if (detectedSections.includes('tobe')) {
    sections.push(buildToBe(input, answers, lines, idx++))
  }
  if (detectedSections.includes('timeline')) {
    sections.push(buildTimeline(lines, idx++))
  }
  if (detectedSections.includes('effect')) {
    sections.push(buildEffect(lines, detectedKpis, idx++))
  }

  return {
    brand: input.reportTitle,
    sections,
  }
}
