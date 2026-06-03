import type { ProjectInput, AnalysisResult } from '@/types/agent'
import { RULES_TEXT } from './storylineRules'

// JSON Schema for the expected LLM output shape
const OUTPUT_SCHEMA = `[
  {
    "id": "string",
    "name": "string  // 설득 논리를 한 문장으로. 예: '현재 병목을 먼저 공감시키는 구조'",
    "type": "string  // enum: decision | roi | problem-solution | execution | demo | alignment | risk-control | scope-clarification",
    "oneLineSummary": "string  // 이 스토리라인의 핵심을 한 문장으로",
    "recommendedReason": "string  // 왜 이 전략이 이 보고에 맞는지. 불확실한 추론이 있다면 명시",
    "keyMessage": "string  // 보고를 관통하는 하나의 핵심 메시지",
    "narrativeFlow": ["string", "..."],  // 설득 흐름 3-6단계
    "pagePlan": [
      {
        "id": "string",
        "order": "number",
        "role": "string  // enum: hook | context | scope | problem | evidence | decision | solution | effect | to-be | execution | risk | next-step | appendix",
        "message": "string  // 이 페이지에서 납득시킬 핵심 한 문장",
        "suggestedLayoutType": "string  // enum: cover | scope | overview-kpi | problem-cards | execution-plan | effect-split | to-be-flow | timeline | discussion-cards | rr"
      }
    ]
  }
]`

/**
 * LLM(OpenAI/Claude)에 직접 전달 가능한 Storyline 생성 프롬프트를 빌드합니다.
 * 나중에 /api/storyline route에서 사용합니다.
 */
export function buildStorylinePrompt(
  input: ProjectInput,
  analysis?: AnalysisResult
): string {
  const parts: string[] = []

  parts.push(`# Storyline 생성 지시

당신은 사내 보고자료 전략 전문가입니다.
아래 입력을 바탕으로, 서로 다른 설득 전략을 가진 Storyline 후보 3개를 생성하세요.`)

  // ── 입력 정보 ─────────────────────────────────────────────────────────────
  const inputLines = [
    `### 보고 제목`,
    input.reportTitle,
    ``,
    `### 현재 상황 / 배경 (핵심 맥락)`,
    `아래는 이 보고가 왜 지금 필요한지, 보고 대상이 먼저 납득해야 할 전제입니다.`,
    input.currentSituation ?? '(미입력)',
    ``,
    `### 보고 목표 / 얻고 싶은 것`,
    input.reportGoal ?? '(미입력)',
    ``,
    `### 참고 자료`,
    input.sourceText ? input.sourceText.slice(0, 2000) : '(없음)',
    ``,
    `### 피해야 할 표현 / 민감한 뉘앙스`,
    input.avoidPoints ?? '(없음)',
  ]
  parts.push(`## 입력 정보\n\n${inputLines.join('\n')}`)

  // ── 분석 결과 (있을 때만) ────────────────────────────────────────────────
  if (analysis) {
    const analysisLines = [
      `감지된 KPI: ${analysis.detectedKpis.length > 0 ? analysis.detectedKpis.join(', ') : '없음'}`,
      `감지된 문제 단서: ${analysis.detectedProblems.length > 0 ? analysis.detectedProblems.join(' / ') : '없음'}`,
      `감지된 레이아웃 힌트: ${analysis.detectedLayouts.join(', ')}`,
    ]
    parts.push(`## 자료 분석 결과\n\n${analysisLines.join('\n')}`)
  }

  // ── 보고자료 작성 원칙 ───────────────────────────────────────────────────
  parts.push(`## 보고자료 작성 원칙\n\n아래 원칙을 엄격히 따르세요.\n\n${RULES_TEXT}`)

  // ── 생성 규칙 ─────────────────────────────────────────────────────────────
  parts.push(`## 생성 규칙

1. 후보 3개를 반환하세요. 각 후보는 서로 다른 설득 전략이어야 합니다.
2. 고정 목차(개요 → As-Is → To-Be)를 그대로 사용하지 마세요.
3. currentSituation(현재 상황 / 배경)을 핵심 맥락으로 사용하여 다음을 판단하세요:
   - 이 보고가 왜 지금 필요한가
   - 보고 대상이 먼저 납득해야 할 전제는 무엇인가
   - 범위/오해 방지가 필요한가
   - 상위 전략이나 로드맵과 연결해야 하는가
   - 실행 성과를 강조해야 하는가
4. 자료에서 추론 가능한 것은 반영하되, 불확실한 것은 recommendedReason에 명시하세요.
5. 각 pagePlan의 message는 해당 페이지에서 납득시킬 핵심 한 문장이어야 합니다.
6. pagePlan은 3~6페이지로 구성하세요.
7. 불필요한 appendix 페이지를 만들지 마세요.`)

  // ── 출력 형식 ─────────────────────────────────────────────────────────────
  parts.push(`## 출력 형식

반드시 아래 JSON 배열만 반환하세요. 다른 텍스트는 절대 포함하지 마세요.

\`\`\`json
${OUTPUT_SCHEMA}
\`\`\``)

  return parts.join('\n\n')
}
