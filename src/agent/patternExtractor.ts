/**
 * Report Pattern Extractor — PoC Skeleton
 *
 * 실제 보고서(PPT/PDF/이미지)를 분석해 설득 구조(ReportPattern)를 추출합니다.
 * 현재는 LLM 프롬프트 설계와 파싱 구조만 정의된 PoC 스켈레톤입니다.
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

1. nature.natureName: 보고 성격 (예: "PoC 진행현황 보고", "전략 방향 보고", "의사결정 보고")
2. audience: "ceo" | "executive" | "unknown"
   - ceo: 전략 방향, 조직 변화, 큰 의사결정 중심
   - executive: 센터장/임원 보고. 실행 구조, 과제 현황, 효과, 일정 중심
3. persuasionFlow: 설득 흐름 3~6단계
4. pageRoles: 각 슬라이드의 역할
   - role: hook|context|problem|evidence|solution|decision|execution|effect|risk|next-step
   - keyMessage: 이 슬라이드에서 청중이 납득해야 하는 것 (한 문장)
   - evidenceType: metric|demo|roadmap|workflow|org|screenshot|none
   - recommendedInteraction: asis-tobe-toggle|scope-tab|detail-accordion|step-reveal|evidence-expand|demo-flow|none
   - isKeySlide: 이 보고의 핵심 설득 포인트인가
5. requestedAction: approve|decide|align|review|support|inform|none
   - 진행현황/공유 목적이면 "inform" 또는 "support"
   - 승인이 필요하면 "approve"
6. decisionPoints: 청중이 결정/동의해야 하는 항목 (없으면 생략)
7. visualPatterns: 반복적으로 나타나는 시각 레이아웃 패턴
8. interactionPatterns: HTML 구현에 적합한 인터랙션 패턴 목록
9. narrativeSummary: 이 보고의 설득 구조 전체를 한 문장으로 요약

## 출력 형식 (JSON만 반환)

{
  "nature": { "natureName": "string", "natureAliases": ["string"] },
  "audience": "ceo|executive|unknown",
  "persuasionFlow": ["string"],
  "pageRoles": [
    {
      "pageNumber": 1,
      "role": "hook",
      "title": "string",
      "purpose": "string",
      "keyMessage": "string",
      "visualType": "text|chart|table|diagram|mixed",
      "evidenceType": "none",
      "recommendedInteraction": "none",
      "isKeySlide": false
    }
  ],
  "requestedAction": "inform",
  "decisionPoints": ["string"],
  "visualPatterns": ["string"],
  "interactionPatterns": ["string"],
  "narrativeSummary": "string"
}`
}

// ── Mock Extractor (PoC용) ────────────────────────────────────────────────────

export class MockPatternExtractor implements PatternExtractor {
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    const pattern = input.fileType === 'pptx' ? SAMPLE_A_PATTERN : SAMPLE_B_PATTERN
    return {
      pattern,
      confidence: 0.88,
      rawSlides: [],
      metadata: { model: 'mock', durationMs: 0, slideCount: pattern.pageRoles.length },
    }
  }
}

// ── Classifier ────────────────────────────────────────────────────────────────
// MVP: persuasionFlow 단어 겹침(overlap)으로 유사도를 계산하는 규칙 기반 분류기.
// Beta 단계에서 실제 임베딩 코사인 유사도(EmbeddingClassifier)로 교체 예정.

export class FlowSimilarityClassifier implements ReportClassifier {
  classify(pattern: ReportPattern, library: NatureLibrary): ClassificationResult {
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
        matchedNature: { natureName: '(신규)' },
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
    const existing = library.entries.find(
      (e) => e.nature.natureName === pattern.nature.natureName
    )
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
      typicalRequestedAction: pattern.requestedAction ?? 'none',
      commonEvidenceTypes: [...new Set(pattern.pageRoles.map((p) => p.evidenceType ?? 'none'))],
      commonInteractionPatterns: pattern.interactionPatterns,
      whenToUse: [],
      whenNotToUse: [],
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
  return keywords(b).some((k) => ka.has(k) && k.length > 1)
}

// ── Sample A — Prompt to Design PoC ──────────────────────────────────────────

export const SAMPLE_A_PATTERN: ReportPattern = {
  id: 'sample-a-prompt-to-design',
  nature: {
    natureName: 'PoC 진행현황 보고',
    natureAliases: ['PoC 보고', '진행현황 보고', '실행 성과 보고'],
  },
  audience: 'executive',
  persuasionFlow: [
    '기존 방식의 한계와 왜 지금 변해야 하는가',
    'Prompt to Design 접근법 소개',
    '현재 구현 현황',
    '데모 — 실제 작동 확인',
    '확인된 효과와 기대효과',
    '다음 단계 및 확장 조건',
  ],
  pageRoles: [
    {
      pageNumber: 1,
      role: 'hook',
      title: '보고 목적',
      purpose: '이 보고가 왜 지금 필요한지 먼저 납득시킨다',
      keyMessage: 'PoC 결과를 공유하고 다음 단계 추진 여부를 논의합니다.',
      visualType: 'text',
      evidenceType: 'none',
      recommendedInteraction: 'none',
      isKeySlide: false,
    },
    {
      pageNumber: 2,
      role: 'problem',
      title: '기존 방식 한계',
      purpose: '현재 디자인 프로세스의 병목을 공감시킨다',
      keyMessage: '수작업 반복으로 인한 리드타임 지연과 품질 편차가 구조적 문제입니다.',
      visualType: 'diagram',
      evidenceType: 'workflow',
      recommendedInteraction: 'asis-tobe-toggle',
      isKeySlide: true,
    },
    {
      pageNumber: 3,
      role: 'solution',
      title: 'Prompt to Design 접근법',
      purpose: 'AI 기반 접근법이 어떻게 기존 방식과 다른지 보여준다',
      keyMessage: '프롬프트 하나로 디자인 산출물을 즉시 생성하는 구조입니다.',
      visualType: 'diagram',
      evidenceType: 'workflow',
      recommendedInteraction: 'step-reveal',
      isKeySlide: false,
    },
    {
      pageNumber: 4,
      role: 'execution',
      title: '현재 구현',
      purpose: '실제 어디까지 만들었는지 확인시킨다',
      keyMessage: '핵심 기능 3개가 구현 완료, 2개가 진행 중입니다.',
      visualType: 'mixed',
      evidenceType: 'screenshot',
      recommendedInteraction: 'detail-accordion',
      isKeySlide: false,
    },
    {
      pageNumber: 5,
      role: 'evidence',
      title: '데모',
      purpose: '작동 결과를 직접 보여줌으로써 가능성을 증명한다',
      keyMessage: '프롬프트 입력 → 컴포넌트 자동 생성 → 디자인 시스템 연동까지 작동합니다.',
      visualType: 'diagram',
      evidenceType: 'demo',
      recommendedInteraction: 'demo-flow',
      isKeySlide: true,
    },
    {
      pageNumber: 6,
      role: 'effect',
      title: '기대효과',
      purpose: '확인된 효과와 조건부 실현 효과를 분리 제시한다',
      keyMessage: '리드타임 40% 단축은 직접 확인, 전사 확산 시 연 800h 절감 가능합니다.',
      visualType: 'chart',
      evidenceType: 'metric',
      recommendedInteraction: 'evidence-expand',
      isKeySlide: false,
    },
    {
      pageNumber: 7,
      role: 'next-step',
      title: '다음 단계',
      purpose: '확장을 위해 지금 결정해야 할 것을 요청한다',
      keyMessage: '다음 단계 개발 범위와 팀 구성을 이번 주 내 확정해 주세요.',
      visualType: 'table',
      evidenceType: 'roadmap',
      recommendedInteraction: 'none',
      isKeySlide: true,
    },
  ],
  requestedAction: 'support',
  decisionPoints: [
    '다음 단계 개발 범위 승인',
    '전사 확산 시 필요한 리소스 확보 여부',
  ],
  visualPatterns: [
    'before-after split (기존 방식 vs 새 방식)',
    'numbered flow (구현 단계)',
    'evidence screenshot (데모 결과)',
    'metric card (효과 수치)',
  ],
  interactionPatterns: ['asis-tobe-toggle', 'step-reveal', 'demo-flow', 'evidence-expand'],
  narrativeSummary:
    '기존 디자인 프로세스의 병목을 공감시킨 뒤 AI 접근법과 구현 현황, 데모로 가능성을 증명하고 다음 단계 지원을 요청하는 PoC 진행현황 보고',
}

// ── Sample B — CEO AX 추진방향 ────────────────────────────────────────────────

export const SAMPLE_B_PATTERN: ReportPattern = {
  id: 'sample-b-ceo-ax',
  nature: {
    natureName: '전략 방향 보고',
    natureAliases: ['방향성 보고', 'AX 추진 보고', '전략 보고'],
  },
  audience: 'ceo',
  persuasionFlow: [
    '외부 환경 변화와 현재 방식의 한계 진단',
    'AX 추진의 전략적 방향성 제시',
    '실행 체계와 조직 구조',
    '단계별 추진 계획과 마일스톤',
  ],
  pageRoles: [
    {
      pageNumber: 1,
      role: 'context',
      title: 'AX 배경',
      purpose: '외부 환경 변화로 인해 지금 AX가 필요한 이유를 납득시킨다',
      keyMessage: 'AI 전환이 선택이 아닌 생존 조건이 된 시점입니다.',
      visualType: 'text',
      evidenceType: 'none',
      recommendedInteraction: 'none',
      isKeySlide: false,
    },
    {
      pageNumber: 2,
      role: 'problem',
      title: '현재 방식 한계',
      purpose: '기존 접근법의 구조적 한계를 진단한다',
      keyMessage: '부문별 개별 도입으로는 학습 효과도, 확산도 이뤄지지 않습니다.',
      visualType: 'diagram',
      evidenceType: 'org',
      recommendedInteraction: 'detail-accordion',
      isKeySlide: true,
    },
    {
      pageNumber: 3,
      role: 'solution',
      title: '추진 방향',
      purpose: '전사 AX 방향성과 3대 전략 축을 제시한다',
      keyMessage: '학습 → 검증 → 확산의 3단계 전략 축으로 전사 AX를 추진합니다.',
      visualType: 'diagram',
      evidenceType: 'workflow',
      recommendedInteraction: 'scope-tab',
      isKeySlide: true,
    },
    {
      pageNumber: 4,
      role: 'execution',
      title: '실행 체계',
      purpose: '방향을 실행할 조직 구조와 거버넌스를 보여준다',
      keyMessage: '전담 조직과 사업부 협업 구조를 통해 실행력을 확보합니다.',
      visualType: 'diagram',
      evidenceType: 'org',
      recommendedInteraction: 'none',
      isKeySlide: false,
    },
    {
      pageNumber: 5,
      role: 'next-step',
      title: '추진 계획',
      purpose: '단계별 마일스톤과 CEO 결정 요청 항목을 제시한다',
      keyMessage: '1단계 6개월 내 5개 과제 선정 및 전담팀 구성을 요청합니다.',
      visualType: 'table',
      evidenceType: 'roadmap',
      recommendedInteraction: 'step-reveal',
      isKeySlide: true,
    },
  ],
  requestedAction: 'approve',
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
  interactionPatterns: ['scope-tab', 'step-reveal', 'detail-accordion'],
  narrativeSummary:
    '외부 환경 변화와 현재 방식의 한계를 진단한 뒤 전사 AX 방향성을 제시하고, 실행 체계와 추진 계획을 통해 CEO의 전략 승인을 이끌어내는 전략 방향 보고',
}
