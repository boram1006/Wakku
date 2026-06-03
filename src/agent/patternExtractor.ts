/**
 * Report Pattern Extractor — Skeleton
 *
 * 실제 보고서(PPT/PDF/이미지)를 분석해 설득 구조(ReportPattern)를 추출합니다.
 * 현재는 LLM 프롬프트 설계와 파싱 구조만 정의된 PoC 스켈레톤입니다.
 * 실제 파일 파싱은 각 Parser(pptxParser, pdfParser, visionParser)에서 담당합니다.
 */

import type {
  PatternExtractor,
  ExtractionInput,
  ExtractionResult,
  SlideContent,
  ReportPattern,
  ReportClassifier,
  ClassificationResult,
  NatureLibrary,
  NatureEntry,
} from '@/types/patternExtractor'

// ── Extraction Prompt ─────────────────────────────────────────────────────────

export function buildExtractionPrompt(slides: SlideContent[]): string {
  const slideText = slides
    .map(
      (s) =>
        `[슬라이드 ${s.pageNumber}]\n` +
        `제목: ${s.headings.join(' / ') || '(없음)'}\n` +
        `내용: ${s.text.slice(0, 400)}\n` +
        `시각 요소: ${[
          s.hasChart && '차트',
          s.hasDiagram && '다이어그램',
          s.hasTable && '표',
          s.imageDescription,
        ]
          .filter(Boolean)
          .join(', ') || '텍스트'}`
    )
    .join('\n\n')

  return `당신은 보고서 설득 구조 분석 전문가입니다.
아래 슬라이드 내용을 분석하여 이 보고서의 설득 구조를 JSON으로 추출하세요.

${slideText}

## 추출 기준

1. nature: 보고 성격을 한 단어로 (예: "PoC 진행현황 보고", "전략 방향 보고", "의사결정 보고")
2. audience: 보고 대상 (예: "임원진", "CEO", "팀장급", "전사")
3. persuasionFlow: 이 보고가 청중을 어떻게 설득하는지 3~6단계 흐름
4. pageRoles: 각 슬라이드의 역할
   - role: hook | context | problem | evidence | solution | decision | execution | effect | risk | next-step
   - purpose: 이 슬라이드에서 청중이 납득해야 하는 것 (한 문장)
   - isKeySlide: 이 보고의 핵심 설득 포인트인가
5. decisionPoints: 청중이 결정/동의해야 하는 항목
6. visualPatterns: 반복적으로 나타나는 시각 구조 (예: "3-column card", "before-after split", "numbered flow")
7. narrativeSummary: 이 보고의 설득 구조 전체를 한 문장으로 요약

## 출력 형식 (JSON만 반환)

{
  "nature": "string",
  "audience": "string",
  "persuasionFlow": ["string", ...],
  "pageRoles": [
    { "pageNumber": 1, "role": "hook", "title": "string", "purpose": "string", "visualType": "text|chart|table|diagram|mixed", "isKeySlide": false }
  ],
  "decisionPoints": ["string", ...],
  "visualPatterns": ["string", ...],
  "narrativeSummary": "string"
}`
}

// ── Mock Extractor (PoC용) ────────────────────────────────────────────────────

export class MockPatternExtractor implements PatternExtractor {
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    const pattern = input.fileType === 'pptx'
      ? SAMPLE_A_PATTERN
      : SAMPLE_B_PATTERN

    return {
      pattern,
      confidence: 0.88,
      rawSlides: [],
      metadata: {
        model: 'mock',
        durationMs: 0,
        slideCount: pattern.pageRoles.length,
      },
    }
  }
}

// ── Classifier ────────────────────────────────────────────────────────────────

export class EmbeddingClassifier implements ReportClassifier {
  classify(pattern: ReportPattern, library: NatureLibrary): ClassificationResult {
    // 실제 구현: narrativeSummary + persuasionFlow를 임베딩 후 코사인 유사도 계산
    // PoC: flow step 겹침 수로 단순 유사도 계산
    const scores = library.entries.map((entry) => {
      const overlap = pattern.persuasionFlow.filter((step) =>
        entry.canonicalFlow.some((cf) => stepSimilar(step, cf))
      ).length
      const confidence = overlap / Math.max(pattern.persuasionFlow.length, entry.canonicalFlow.length)
      return { entry, confidence }
    })

    scores.sort((a, b) => b.confidence - a.confidence)
    const top = scores[0]

    if (!top || top.confidence < 0.3) {
      return {
        confidence: 0,
        matchedNature: '(신규)',
        matchedPatternId: '',
        reason: '기존 Nature Library에서 유사한 패턴을 찾지 못했습니다.',
        isNewNature: true,
        alternatives: [],
      }
    }

    return {
      confidence: top.confidence,
      matchedNature: top.entry.nature,
      matchedPatternId: top.entry.id,
      reason: `설득 흐름 ${Math.round(top.confidence * 100)}% 일치 (${top.entry.canonicalFlow.slice(0, 2).join(' → ')})`,
      isNewNature: false,
      alternatives: scores.slice(1, 3).map((s) => ({
        nature: s.entry.nature,
        confidence: s.confidence,
      })),
    }
  }

  learn(pattern: ReportPattern, library: NatureLibrary): NatureLibrary {
    const existing = library.entries.find((e) => e.nature === pattern.nature)
    if (existing) {
      existing.frequency += 1
      existing.examplePatterns = [...existing.examplePatterns.slice(-4), pattern]
      return { ...library, updatedAt: new Date().toISOString() }
    }

    const newEntry: NatureEntry = {
      id: `nature-${Date.now()}`,
      nature: pattern.nature,
      description: pattern.narrativeSummary,
      audienceTypes: [pattern.audience],
      canonicalFlow: pattern.persuasionFlow,
      canonicalPageRoles: pattern.pageRoles.map((p) => p.role),
      examplePatterns: [pattern],
      frequency: 1,
      tags: [],
    }

    return {
      ...library,
      entries: [...library.entries, newEntry],
      updatedAt: new Date().toISOString(),
    }
  }
}

function stepSimilar(a: string, b: string): boolean {
  const keywords = (s: string) =>
    s.replace(/[^가-힣a-z\s]/gi, '').toLowerCase().split(/\s+/)
  const ka = new Set(keywords(a))
  const kb = keywords(b)
  return kb.some((k) => ka.has(k) && k.length > 1)
}

// ── Sample Patterns (PoC) ─────────────────────────────────────────────────────

export const SAMPLE_A_PATTERN: ReportPattern = {
  id: 'sample-a-prompt-to-design',
  nature: 'PoC 진행현황 보고',
  audience: '내부 검토진 / 의사결정자',
  persuasionFlow: [
    '기존 방식의 한계와 왜 지금 변해야 하는가',
    'Prompt to Design 접근법 소개',
    '현재 구현 현황',
    '데모 — 실제 작동 확인',
    '확인된 효과와 기대효과',
    '다음 단계 및 확장 조건',
  ],
  pageRoles: [
    { pageNumber: 1, role: 'hook', title: '보고 목적', purpose: '이 보고가 왜 지금 필요한지 먼저 납득시킨다', visualType: 'text', isKeySlide: false },
    { pageNumber: 2, role: 'problem', title: '기존 방식 한계', purpose: '현재 디자인 프로세스의 병목을 공감시킨다', visualType: 'diagram', isKeySlide: true },
    { pageNumber: 3, role: 'solution', title: 'Prompt to Design', purpose: 'AI 기반 접근법이 어떻게 다른지 보여준다', visualType: 'diagram', isKeySlide: false },
    { pageNumber: 4, role: 'execution', title: '현재 구현', purpose: '실제 어디까지 만들었는지 확인시킨다', visualType: 'mixed', isKeySlide: false },
    { pageNumber: 5, role: 'evidence', title: '데모', purpose: '작동 결과를 직접 보여줌으로써 가능성을 증명한다', visualType: 'diagram', isKeySlide: true },
    { pageNumber: 6, role: 'effect', title: '기대효과', purpose: '확인된 효과와 조건부 실현 효과를 분리 제시한다', visualType: 'chart', isKeySlide: false },
    { pageNumber: 7, role: 'next-step', title: '다음 단계', purpose: '확장을 위해 지금 결정해야 할 것을 요청한다', visualType: 'table', isKeySlide: true },
  ],
  decisionPoints: [
    '다음 단계 개발 범위 승인',
    '전사 확산 시 필요한 리소스 확보 여부',
  ],
  visualPatterns: [
    'before-after split (기존 방식 vs 새 방식)',
    'numbered flow (구현 단계)',
    'evidence screenshot (데모 결과)',
  ],
  narrativeSummary:
    '기존 디자인 프로세스의 병목을 공감시킨 뒤 AI 접근법을 소개하고, 구현 현황과 데모로 가능성을 증명한 후 다음 단계 확장을 요청하는 PoC 진행현황 보고',
}

export const SAMPLE_B_PATTERN: ReportPattern = {
  id: 'sample-b-ceo-ax',
  nature: '전략 방향 보고',
  audience: 'CEO / 경영진',
  persuasionFlow: [
    '외부 환경 변화와 현재 방식의 한계 진단',
    'AX 추진의 전략적 방향성 제시',
    '실행 체계와 조직 구조',
    '단계별 추진 계획',
  ],
  pageRoles: [
    { pageNumber: 1, role: 'context', title: 'AX 배경', purpose: '외부 환경 변화로 인해 지금 AX가 필요한 이유를 납득시킨다', visualType: 'text', isKeySlide: false },
    { pageNumber: 2, role: 'problem', title: '현재 방식 한계', purpose: '기존 접근법의 구조적 한계를 진단한다', visualType: 'diagram', isKeySlide: true },
    { pageNumber: 3, role: 'solution', title: '추진 방향', purpose: '전사 AX 방향성과 3대 전략 축을 제시한다', visualType: 'diagram', isKeySlide: true },
    { pageNumber: 4, role: 'execution', title: '실행 체계', purpose: '방향을 실행할 조직 구조와 거버넌스를 보여준다', visualType: 'diagram', isKeySlide: false },
    { pageNumber: 5, role: 'next-step', title: '추진 계획', purpose: '단계별 마일스톤과 CEO 결정 요청 항목을 제시한다', visualType: 'table', isKeySlide: true },
  ],
  decisionPoints: [
    '전사 AX 추진 방향 승인',
    '전담 조직 구성 여부',
    '1단계 예산 및 일정 확정',
  ],
  visualPatterns: [
    '3-axis strategy diagram (전략 축)',
    'governance org chart (실행 체계)',
    'phase roadmap table (추진 계획)',
  ],
  narrativeSummary:
    '외부 환경 변화와 현재 방식의 한계를 진단한 뒤 전사 AX 방향성을 제시하고, 실행 체계와 추진 계획을 통해 CEO의 전략 승인을 이끌어내는 전략 방향 보고',
}
