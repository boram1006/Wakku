// Report Archetypes — pre-built page sequences for common report types.
// Each archetype is a factory (createPages) so every application gets fresh UIDs.

import type { ReportPage } from '@/types/report'
import { renumberPages } from '@/lib/pageDefaults'

const uid = () => Math.random().toString(36).slice(2, 9)

export interface ArchetypePageMeta {
  layoutType: string
  label: string
}

export interface ReportArchetype {
  id: string
  name: string
  tagline: string
  description: string
  pageFlow: ArchetypePageMeta[]   // shown as pills in the card
  createPages: () => ReportPage[]
}

// ── AX Workflow Improvement Report ──────────────────────────────────────────

function createAXWorkflowPages(): ReportPage[] {
  const pages: ReportPage[] = [
    // 1. Cover
    {
      id: uid(),
      sectionNumber: '01',
      sectionLabel: 'Cover',
      title: 'UX 시나리오 검토 AX 개선',
      subtitle: 'Agent 기반 검토 도입으로 리드타임 75% 단축',
      layoutType: 'cover',
      blocks: [
        { id: uid(), type: 'text', body: '작성일: 2026.06  |  UX·Agent 파트' },
      ],
    },

    // 2. Executive Summary → overview-kpi
    {
      id: uid(),
      sectionNumber: '02',
      sectionLabel: '핵심 지표',
      title: 'Executive Summary',
      subtitle: '검토 리드타임 단축, 반복 활동 감소, 검토 품질 유지라는 세 가지 목표를 동시에 달성',
      layoutType: 'overview-kpi',
      blocks: [
        { id: uid(), type: 'kpi', value: '75', meta: '%', title: '리드타임 단축', body: '4일 → 1일 처리 달성' },
        { id: uid(), type: 'kpi', value: '4', meta: '건', title: '자동화 활동', body: '6개 항목 중 4개 자동화' },
        { id: uid(), type: 'kpi', value: '525', meta: '분', title: '주간 절감 시간', body: '팀당 8.7시간/주 확보' },
      ],
    },

    // 3. Problem Framing → problem-cards
    {
      id: uid(),
      sectionNumber: '03',
      sectionLabel: '문제 정의',
      title: '현황 및 문제 정의',
      subtitle: '수작업 중심 UX 검토의 세 가지 핵심 병목',
      layoutType: 'problem-cards',
      blocks: [
        {
          id: uid(), type: 'card', meta: 'Problem 01',
          title: '긴 검토 리드타임',
          body: '팀원 순차 검토로 평균 4일 소요. 팀 일정 의존으로 병목이 반복되고 스프린트 속도에 직접 영향.',
        },
        {
          id: uid(), type: 'card', meta: 'Problem 02',
          title: '반복 검토 활동의 과부하',
          body: 'GUI 오류 탐지·피드백 정리·체크리스트 작성 등 반복 활동이 전체 검토 업무의 60%를 차지.',
        },
        {
          id: uid(), type: 'card', meta: 'Problem 03',
          title: '의사결정 지연',
          body: '검토 결과가 구두 전달·Notion 메모로 산재. 우선순위 결정에 별도 회의가 필요해 피드백 반영 지연.',
        },
      ],
    },

    // 4. Activity Reduction — interactive pattern (ux-review variant)
    {
      id: uid(),
      sectionNumber: '04',
      sectionLabel: '업무 절감',
      title: '검토 활동 절감 현황',
      subtitle: 'AI 보조 리뷰 도입으로 UX 검토 사이클 4일 → 1일로 단축',
      layoutType: 'activity-reduction',
      patternVariantId: 'ux-review',
      blocks: [],
    },

    // 5. As-Is → To-Be — interactive pattern (ux-process variant)
    {
      id: uid(),
      sectionNumber: '05',
      sectionLabel: 'As-Is / To-Be',
      title: '검토 프로세스 전환',
      subtitle: '직렬 수동 검토에서 Agent 기반 병렬 검토로 전환, 리드타임 75% 단축',
      layoutType: 'asis-tobe-transformation',
      patternVariantId: 'ux-process',
      blocks: [],
    },

    // 6. Impact / Expected Benefit → effect-split
    {
      id: uid(),
      sectionNumber: '06',
      sectionLabel: '기대효과',
      title: '기대 효과',
      subtitle: '검토 효율 향상과 팀 역량 재배치라는 직간접 효과를 동시에 실현',
      layoutType: 'effect-split',
      blocks: [
        {
          id: uid(), type: 'card', meta: '직접 효과',
          title: '검토 리드타임 75% 단축',
          body: '4일 → 1일. Agent 비동기 검토로 팀 일정 의존성 제거. 주당 8.7시간 절감, 스프린트 속도 향상.',
        },
        {
          id: uid(), type: 'card', meta: '간접 효과',
          title: '팀 역량 고부가가치 전환',
          body: '반복 검토에서 해방된 팀원이 전략 기획·사용자 조사에 집중 가능. 장기적으로 검토 품질과 UX 성숙도 향상.',
        },
      ],
    },

    // 7. Roadmap → timeline
    {
      id: uid(),
      sectionNumber: '07',
      sectionLabel: '추진 일정',
      title: '추진 로드맵',
      subtitle: '3단계 점진적 전환으로 리스크 최소화하며 Agent 워크플로우 구축',
      layoutType: 'timeline',
      blocks: [
        {
          id: uid(), type: 'timeline', meta: '1단계 (M1–M2)',
          body: 'GUI 오류 탐지 Agent 파일럿. 탐지 정확도 검증, 예외 케이스 DB 초기 구축.',
        },
        {
          id: uid(), type: 'timeline', meta: '2단계 (M3–M4)',
          body: 'UX 시나리오 초안 생성 도입. 담당자 검수 프로세스 정립, 피드백 구조화 시스템 연동.',
        },
        {
          id: uid(), type: 'timeline', meta: '3단계 (M5–M6)',
          body: '통합 Agent 워크플로우 운영. Wakku 기반 단일 진입점 전환 완료. 전 팀 온보딩.',
        },
      ],
    },
  ]

  return renumberPages(pages)
}

export const REPORT_ARCHETYPES: ReportArchetype[] = [
  {
    id: 'ax-workflow-improvement',
    name: 'AX Workflow Improvement Report',
    tagline: 'UX 시나리오 검토 AX 개선',
    description: '수작업 중심 검토 프로세스에 Agent를 도입했을 때의 활동 절감·프로세스 전환·기대효과를 한 보고서에 담는 구조. Activity Reduction과 As-Is/To-Be 패턴이 핵심.',
    pageFlow: [
      { layoutType: 'cover', label: 'Cover' },
      { layoutType: 'overview-kpi', label: 'Executive Summary' },
      { layoutType: 'problem-cards', label: 'Problem Framing' },
      { layoutType: 'activity-reduction', label: 'Activity Reduction ✦' },
      { layoutType: 'asis-tobe-transformation', label: 'As-Is → To-Be ✦' },
      { layoutType: 'effect-split', label: 'Impact' },
      { layoutType: 'timeline', label: 'Roadmap' },
    ],
    createPages: createAXWorkflowPages,
  },
]

export const INTERACTIVE_LAYOUT_TYPES = new Set(['activity-reduction', 'asis-tobe-transformation'])
