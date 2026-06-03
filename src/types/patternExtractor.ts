import type { StorylinePageRole } from './storyline'

// ── Core Output ───────────────────────────────────────────────────────────────

export interface ReportPattern {
  id: string
  nature: string
  audience: string
  persuasionFlow: string[]
  pageRoles: PageRoleEntry[]
  decisionPoints: string[]
  visualPatterns: string[]
  narrativeSummary: string
}

export interface PageRoleEntry {
  pageNumber: number
  role: StorylinePageRole
  title: string
  purpose: string
  visualType: 'text' | 'chart' | 'table' | 'diagram' | 'mixed'
  isKeySlide: boolean
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
  nature: string
  description: string
  audienceTypes: string[]
  canonicalFlow: string[]
  canonicalPageRoles: StorylinePageRole[]
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
  matchedNature: string
  matchedPatternId: string
  reason: string
  isNewNature: boolean
  alternatives: {
    nature: string
    confidence: number
  }[]
}

// ── Extractor Interface ───────────────────────────────────────────────────────

export interface PatternExtractor {
  extract(input: ExtractionInput): Promise<ExtractionResult>
}

export interface ReportClassifier {
  classify(pattern: ReportPattern, library: NatureLibrary): ClassificationResult
  learn(pattern: ReportPattern, library: NatureLibrary): NatureLibrary
}
