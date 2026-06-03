import type { StorylinePageRole } from './storyline'

// ── Audience ──────────────────────────────────────────────────────────────────

/**
 * ceo:       전략 방향, 조직 변화, 큰 의사결정 중심
 * executive: 센터장/임원 보고. 실행 구조, 과제 현황, 효과, 일정 중심
 * unknown:   입력만으로 판단이 어려운 경우
 */
export type ReportAudience = 'ceo' | 'executive' | 'unknown'

// ── Interaction Patterns ──────────────────────────────────────────────────────

/**
 * HTML 보고서에서 구현 가능한 인터랙션 패턴.
 * visualPatterns와 별도로 관리 — 시각 레이아웃이 아닌 사용자 행동 흐름.
 */
export type InteractionPattern =
  | 'asis-tobe-toggle'   // As-Is/To-Be 전환 토글
  | 'scope-tab'          // 포함/제외 범위 탭 전환
  | 'detail-accordion'   // 세부 내용 접기/펼치기
  | 'step-reveal'        // 단계별 순차 공개
  | 'evidence-expand'    // 근거 카드 확장
  | 'demo-flow'          // 데모 흐름 인터랙션
  | 'none'

// ── Evidence Types ────────────────────────────────────────────────────────────

export type EvidenceType =
  | 'metric'
  | 'demo'
  | 'roadmap'
  | 'workflow'
  | 'org'
  | 'screenshot'
  | 'none'

// ── Requested Action ─────────────────────────────────────────────────────────

/**
 * 보고서가 청중에게 기대하는 행동.
 * 진행현황 보고는 "approve/decide"가 아닌 "inform/support"일 수 있음.
 */
export type RequestedAction =
  | 'approve'   // 특정 안건 승인 요청
  | 'decide'    // 선택지 중 결정 요청
  | 'align'     // 방향성 정렬/동의 요청
  | 'review'    // 검토 의견 요청
  | 'support'   // 리소스/지원 요청
  | 'inform'    // 인지/공유 목적 (결정 불필요)
  | 'none'

// ── Page Role Entry ───────────────────────────────────────────────────────────

export interface PageRoleEntry {
  pageNumber: number
  role: StorylinePageRole
  title: string
  purpose: string
  keyMessage: string
  visualType: 'text' | 'chart' | 'table' | 'diagram' | 'mixed'
  evidenceType?: EvidenceType
  recommendedInteraction?: InteractionPattern
  isKeySlide?: boolean
}

// ── Nature Reference ──────────────────────────────────────────────────────────

export interface NatureRef {
  natureId?: string
  natureName: string
  natureAliases?: string[]
}

// ── Core Output ───────────────────────────────────────────────────────────────

export interface ReportPattern {
  id: string
  nature: NatureRef
  audience: ReportAudience
  persuasionFlow: string[]
  pageRoles: PageRoleEntry[]
  decisionPoints?: string[]
  requestedAction?: RequestedAction
  visualPatterns: string[]
  interactionPatterns: InteractionPattern[]
  narrativeSummary: string
}

// ── Extraction Pipeline ───────────────────────────────────────────────────────

export type InputFileType = 'pptx' | 'pdf' | 'image'

export interface ExtractionInput {
  fileType: InputFileType
  content: Buffer | string
  metadata?: {
    title?: string
    source?: string
  }
}

export interface SlideContent {
  pageNumber: number
  text: string
  headings: string[]
  hasChart: boolean
  hasDiagram: boolean
  hasTable: boolean
  imageDescription?: string
}

export interface ExtractionResult {
  pattern: ReportPattern
  confidence: number
  rawSlides: SlideContent[]
  metadata: {
    model: string
    durationMs: number
    slideCount: number
  }
}

// ── Nature Library ────────────────────────────────────────────────────────────

export interface NatureEntry {
  id: string
  nature: NatureRef
  description: string
  audienceTypes: ReportAudience[]
  canonicalFlow: string[]
  canonicalPageRoles: StorylinePageRole[]
  typicalRequestedAction: RequestedAction
  examplePatterns: ReportPattern[]
  frequency: number
  tags: string[]
  embedding?: number[]
}

export interface NatureLibrary {
  version: string
  updatedAt: string
  entries: NatureEntry[]
}

// ── Classifier ────────────────────────────────────────────────────────────────

export interface ClassificationResult {
  confidence: number
  matchedNature: NatureRef
  matchedPatternId: string
  reason: string
  isNewNature: boolean
  alternatives: {
    nature: NatureRef
    confidence: number
  }[]
}

// ── Extractor & Classifier Interfaces ────────────────────────────────────────

export interface PatternExtractor {
  extract(input: ExtractionInput): Promise<ExtractionResult>
}

export interface ReportClassifier {
  classify(pattern: ReportPattern, library: NatureLibrary): ClassificationResult
  learn(pattern: ReportPattern, library: NatureLibrary): NatureLibrary
}
