import type { LayoutType } from '@/types/report'
import { createDefaultPage } from '@/lib/pageDefaults'
import type { ReportPage } from '@/types/report'

export interface PagePattern {
  id: string
  name: string
  description: string
  category: '개요' | '문제/현황' | '실행/계획' | '효과/결과' | '기타'
  layoutType: LayoutType
  /** Short hint lines shown in the preview card */
  previewLines: string[]
  createPage: (existingPages: ReportPage[]) => ReportPage
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
]

export const PATTERN_CATEGORIES = ['개요', '문제/현황', '실행/계획', '효과/결과', '기타'] as const
export type PatternCategory = typeof PATTERN_CATEGORIES[number]
