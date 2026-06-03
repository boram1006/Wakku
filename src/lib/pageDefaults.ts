import type { LayoutType, ReportPage, ReportBlock } from '@/types/report'

const uid = () => Math.random().toString(36).slice(2, 9)

export function defaultBlocks(layoutType: LayoutType): ReportBlock[] {
  switch (layoutType) {
    case 'cover':
      return [
        { id: uid(), type: 'text', body: '보고서 부제목 또는 날짜를 입력하세요.' },
      ]
    case 'scope':
      return [
        { id: uid(), type: 'card', meta: '항목 01', title: '첫 번째 항목', body: '내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: '항목 02', title: '두 번째 항목', body: '내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: '항목 03', title: '세 번째 항목', body: '내용을 입력하세요.' },
      ]
    case 'overview-kpi':
      return [
        { id: uid(), type: 'kpi', value: '00', meta: '%', title: 'KPI 제목 1', body: '설명을 입력하세요.' },
        { id: uid(), type: 'kpi', value: '00', meta: 'h', title: 'KPI 제목 2', body: '설명을 입력하세요.' },
        { id: uid(), type: 'kpi', value: '00', meta: '%', title: 'KPI 제목 3', body: '설명을 입력하세요.' },
      ]
    case 'problem-cards':
      return [
        { id: uid(), type: 'card', meta: 'Problem 01', title: '문제 제목 1', body: '문제 내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: 'Problem 02', title: '문제 제목 2', body: '문제 내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: 'Problem 03', title: '문제 제목 3', body: '문제 내용을 입력하세요.' },
      ]
    case 'execution-plan':
      return [
        { id: uid(), type: 'card', meta: 'Step 01', title: '실행 단계 1', body: '내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: 'Step 02', title: '실행 단계 2', body: '내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: 'Step 03', title: '실행 단계 3', body: '내용을 입력하세요.' },
      ]
    case 'effect-split':
      return [
        { id: uid(), type: 'card', meta: '직접 효과', title: '직접 효과 제목', body: '효과 내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: '간접 효과', title: '간접 효과 제목', body: '효과 내용을 입력하세요.' },
      ]
    case 'to-be-flow':
      return [
        { id: uid(), type: 'flow', meta: '01', title: '첫 번째 단계', body: '내용을 입력하세요.' },
        { id: uid(), type: 'flow', meta: '02', title: '두 번째 단계', body: '내용을 입력하세요.' },
        { id: uid(), type: 'flow', meta: '03', title: '세 번째 단계', body: '내용을 입력하세요.' },
        { id: uid(), type: 'text', body: '전환 조건 또는 부연 설명을 입력하세요.' },
      ]
    case 'timeline':
      return [
        { id: uid(), type: 'timeline', meta: '1단계', body: '내용을 입력하세요.' },
        { id: uid(), type: 'timeline', meta: '2단계', body: '내용을 입력하세요.' },
        { id: uid(), type: 'timeline', meta: '3단계', body: '내용을 입력하세요.' },
      ]
    case 'discussion-cards':
      return [
        { id: uid(), type: 'card', meta: '논의 01', title: '논의 항목 1', body: '내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: '논의 02', title: '논의 항목 2', body: '내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: '논의 03', title: '논의 항목 3', body: '내용을 입력하세요.' },
      ]
    case 'rr':
      return [
        { id: uid(), type: 'card', meta: '역할 01', title: '역할/책임 항목 1', body: '내용을 입력하세요.' },
        { id: uid(), type: 'card', meta: '역할 02', title: '역할/책임 항목 2', body: '내용을 입력하세요.' },
      ]
  }
}

export function renumberPages(pages: ReportPage[]): ReportPage[] {
  return pages.map((p, i) => ({
    ...p,
    sectionNumber: String(i + 1).padStart(2, '0'),
  }))
}

const SECTION_LABEL_MAP: Record<LayoutType, string> = {
  cover: 'Cover',
  scope: '보고 범위',
  'overview-kpi': '개요',
  'problem-cards': '문제 정의',
  'execution-plan': '실행 계획',
  'effect-split': '기대효과',
  'to-be-flow': '개선 방향',
  timeline: '추진 일정',
  'discussion-cards': '논의 사항',
  rr: '역할/책임',
}

export const LAYOUT_LABELS: Record<LayoutType, string> = {
  cover: 'Cover',
  scope: 'Scope',
  'overview-kpi': 'Overview KPI',
  'problem-cards': 'Problem Cards',
  'execution-plan': 'Execution Plan',
  'effect-split': 'Effect Split',
  'to-be-flow': 'To-Be Flow',
  timeline: 'Timeline',
  'discussion-cards': 'Discussion Cards',
  rr: 'R&R',
}

export const ADDABLE_LAYOUTS: LayoutType[] = [
  'scope',
  'overview-kpi',
  'problem-cards',
  'execution-plan',
  'effect-split',
  'to-be-flow',
  'timeline',
  'discussion-cards',
  'rr',
]

export const ALL_LAYOUTS: LayoutType[] = [
  'cover',
  ...ADDABLE_LAYOUTS,
]

export function createDefaultPage(
  layoutType: LayoutType,
  existingPages: ReportPage[]
): ReportPage {
  return {
    id: uid(),
    sectionNumber: String(existingPages.length + 1).padStart(2, '0'),
    sectionLabel: SECTION_LABEL_MAP[layoutType],
    title: '새 페이지 제목',
    subtitle: '이 페이지의 핵심 메시지를 입력하세요.',
    layoutType,
    blocks: defaultBlocks(layoutType),
  }
}
