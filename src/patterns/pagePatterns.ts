import type { LayoutType } from '@/types/report'
import { createDefaultPage } from '@/lib/pageDefaults'
import type { ReportPage } from '@/types/report'
import { ACTIVITY_VARIANTS, ASIS_TOBE_VARIANTS } from '@/data/patternData'

export interface PatternVariantMeta {
  id: string
  label: string
  headline: string
}

export interface PagePattern {
  id: string
  name: string
  description: string
  category: '개요' | '문제/현황' | '실행/계획' | '효과/결과' | '기타'
  layoutType: LayoutType
  /** Short hint lines shown in the preview card */
  previewLines: string[]
  /** Available data variants — if present, Explorer shows variant picker */
  variants?: PatternVariantMeta[]
  createPage: (existingPages: ReportPage[], variantId?: string) => ReportPage
}

export const PAGE_PATTERNS: PagePattern[] = [
  {
    id: 'pat-overview-kpi',
    name: 'Overview KPI',
    description: '핵심 수치 3개를 나란히 보여주는 개요 페이지',
    category: '개요',
    layoutType: 'overview-kpi',
    previewLines: ['[ 00% ]  [ 00h ]  [ 00% ]', '지표 설명  지표 설명  지표 설명'],
    createPage: (pages) => createDefaultPage('overview-kpi', pages),
  },
  {
    id: 'pat-scope',
    name: 'Scope',
    description: '보고 범위나 항목을 카드 3장으로 정의',
    category: '개요',
    layoutType: 'scope',
    previewLines: ['[ 항목 01 ]  [ 항목 02 ]  [ 항목 03 ]', '범위·대상·목적 등 나열'],
    createPage: (pages) => createDefaultPage('scope', pages),
  },
  {
    id: 'pat-problem-cards',
    name: 'Problem Cards',
    description: '문제 또는 현황을 카드 형태로 나열',
    category: '문제/현황',
    layoutType: 'problem-cards',
    previewLines: ['[ Problem 01 ]  [ Problem 02 ]  [ Problem 03 ]', '문제 제목 / 내용 기술'],
    createPage: (pages) => createDefaultPage('problem-cards', pages),
  },
  {
    id: 'pat-execution-plan',
    name: 'Execution Plan',
    description: '실행 단계를 Step 카드로 나열',
    category: '실행/계획',
    layoutType: 'execution-plan',
    previewLines: ['[ Step 01 ]  [ Step 02 ]  [ Step 03 ]', '단계별 실행 내용 기술'],
    createPage: (pages) => createDefaultPage('execution-plan', pages),
  },
  {
    id: 'pat-to-be-flow',
    name: 'To-Be Flow',
    description: '개선 방향을 플로우 박스로 순서대로 표현',
    category: '실행/계획',
    layoutType: 'to-be-flow',
    previewLines: ['[ 01 ] → [ 02 ] → [ 03 ]', '단계 설명 / 전환 조건'],
    createPage: (pages) => createDefaultPage('to-be-flow', pages),
  },
  {
    id: 'pat-timeline',
    name: 'Timeline',
    description: '추진 일정을 타임라인으로 표시',
    category: '실행/계획',
    layoutType: 'timeline',
    previewLines: ['1단계 ──── 2단계 ──── 3단계', '각 단계별 시기와 내용'],
    createPage: (pages) => createDefaultPage('timeline', pages),
  },
  {
    id: 'pat-effect-split',
    name: 'Effect Split',
    description: '직접/간접 효과를 좌우로 나눠 표현',
    category: '효과/결과',
    layoutType: 'effect-split',
    previewLines: ['[ 직접 효과 ]    [ 간접 효과 ]', '기대 효과 내용 기술'],
    createPage: (pages) => createDefaultPage('effect-split', pages),
  },
  {
    id: 'pat-discussion-cards',
    name: 'Discussion Cards',
    description: '논의 항목을 카드로 나열하는 Q&A/토론 페이지',
    category: '기타',
    layoutType: 'discussion-cards',
    previewLines: ['[ 논의 01 ]  [ 논의 02 ]  [ 논의 03 ]', '논의 주제와 내용 기술'],
    createPage: (pages) => createDefaultPage('discussion-cards', pages),
  },
  {
    id: 'pat-rr',
    name: 'R&R',
    description: '역할과 책임을 카드로 정의',
    category: '기타',
    layoutType: 'rr',
    previewLines: ['[ 역할 01 ]    [ 역할 02 ]', '역할·책임 내용 기술'],
    createPage: (pages) => createDefaultPage('rr', pages),
  },
  {
    id: 'pat-activity-reduction',
    name: 'Activity Reduction',
    description: 'AI 적용 후 업무 활동이 얼마나 줄었는지 보여줄 때 — 절감률·자동화 가능 여부를 바로 확인. hover 시 개선 전/후가 전환됨.',
    category: '효과/결과',
    layoutType: 'activity-reduction',
    previewLines: ['절감 효과  -68%  · 525분 → 167분', '수동입력 ████▌  -92%  자동화 가능'],
    variants: ACTIVITY_VARIANTS.map((v) => ({ id: v.id, label: v.label, headline: v.headline })),
    createPage: (pages, variantId) => {
      const variant = ACTIVITY_VARIANTS.find((v) => v.id === variantId) ?? ACTIVITY_VARIANTS[0]
      const page = createDefaultPage('activity-reduction', pages)
      return { ...page, patternVariantId: variant.id, subtitle: variant.headline }
    },
  },
  {
    id: 'pat-asis-tobe',
    name: 'As-Is → To-Be',
    description: '기존 업무 흐름과 AI 개선 후 흐름을 비교할 때 — 처리속도·오류율·업무량 등 차원별 변화를 좌우 대비로 제시.',
    category: '효과/결과',
    layoutType: 'asis-tobe-transformation',
    previewLines: ['AS-IS  ⚡AI⚡  TO-BE', '3일 처리 → 당일 완료  ·  오류 95% 감소'],
    variants: ASIS_TOBE_VARIANTS.map((v) => ({ id: v.id, label: v.label, headline: v.headline })),
    createPage: (pages, variantId) => {
      const variant = ASIS_TOBE_VARIANTS.find((v) => v.id === variantId) ?? ASIS_TOBE_VARIANTS[0]
      const page = createDefaultPage('asis-tobe-transformation', pages)
      return { ...page, patternVariantId: variant.id, subtitle: variant.headline }
    },
  },
]

export const PATTERN_CATEGORIES = ['개요', '문제/현황', '실행/계획', '효과/결과', '기타'] as const
export type PatternCategory = typeof PATTERN_CATEGORIES[number]
