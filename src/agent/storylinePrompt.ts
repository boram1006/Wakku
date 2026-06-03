import type { ProjectInput, AnalysisResult } from '@/types/agent'
import { RULES_TEXT } from './storylineRules'

// JSON Schema for the expected LLM output shape
const OUTPUT_SCHEMA = `[
  {
    "id": "string",
    "name": "string  // 설득 논리를 한 문장으로. 예: '현재 병목을 먼저 공감시키는 구조'",
    "type": "string  // enum: decision | roi | problem-solution | execution | demo | alignment | risk-control | scope-clarification",
    "oneLineSummary": "string  // 이 스토리라인의 핵심을 한 문장으로",
    "recommendedReason": "string  // 입력의 [구체적 근거]를 바탕으로 [이 구조]를 선택했습니다. 불확실한 추론이 있다면 명시.",
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

export function buildStorylinePrompt(
  input: ProjectInput,
  analysis?: AnalysisResult
): string {
  const parts: string[] = []

  parts.push(`# Storyline 생성 지시

당신은 사내 보고자료 전략 전문가입니다.
아래 입력을 바탕으로, 서로 다른 설득 전략을 가진 Storyline 후보 3개를 생성하세요.`)

  // ── 반영 우선순위 ──────────────────────────────────────────────────────────
  parts.push(`## 입력 반영 우선순위

아래 순서로 입력값을 반영하세요. 우선순위가 높을수록 Storyline 구조 결정에 더 직접적으로 영향을 줍니다.

1. **핵심 목표** (최우선): 보고를 통해 얻으려는 것. 여기에 포함된 액션 요청(승인/결정/정렬/공유 등)과 구조적 요구(비교 제시, 데모 포함, 효과 수치 등)는 pagePlan에 반드시 반영하세요.
2. **피해야 할 내용** (엄격한 제외 조건): 이 항목에 해당하는 내용은 pagePlan message, narrativeFlow, keyMessage 어디에도 포함하지 마세요.
3. **보고 맥락**: 배경과 시점 이해에만 활용하세요.
4. **참고 자료**: 페이지 내용 보강에만 사용하세요. 참고 자료의 특정 키워드(예: "병렬 Workflow", "AI 에이전트")가 3개 카드 모두에 반복 등장하지 않도록 주의하세요.
5. **도메인 키워드**: 특정 기술·업무 용어 하나가 전체 Storyline 흐름을 지배하지 않도록 처리하세요.`)

  // ── 입력 정보 (우선순위 순서로 배치) ──────────────────────────────────────
  const goalText = input.reportGoal?.trim()
    ? input.reportGoal.trim()
    : '(미입력 — 입력이 없으면 currentSituation과 reportTitle에서 의도를 추론하되, 구조는 보수적으로 잡으세요)'

  const avoidText = input.avoidPoints?.trim()
    ? input.avoidPoints.trim()
    : '(없음)'

  const inputLines = [
    `### ① 핵심 목표 ★ (최우선 반영)`,
    goalText,
    ``,
    `### ② 피해야 할 내용 ★★ (엄격한 제외 조건)`,
    avoidText,
    ``,
    `### ③ 보고 제목`,
    input.reportTitle,
    ``,
    `### ④ 보고 맥락 (현재 상황 / 배경)`,
    input.currentSituation?.trim() || '(미입력)',
    ``,
    `### ⑤ 참고 자료 (구조 보강용)`,
    input.sourceText?.trim() ? input.sourceText.slice(0, 2000) : '(없음)',
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

1. **후보 3개를 반환하세요.**

2. **3개 카드는 아래 기준으로 반드시 구조적으로 달라야 합니다.**
   - narrativeFlow의 **시작점**이 달라야 합니다. 3개 카드 중 2개 이상이 "문제/현황 제시"로 시작하면 안 됩니다.
     - 가능한 시작점 예시: 문제 먼저 / 효과·결과 먼저 / 결정 요청 먼저 / 전략 맥락 먼저 / 검증 결과 먼저 / 범위 확정 먼저
   - 보고를 통해 기대하는 **requestedAction이 달라야 합니다** (decide / approve / align / inform / support 중 서로 다른 것).
   - 같은 **type**을 2개 이상 사용하지 마세요.

3. **첫 번째 카드는 핵심 목표에 가장 직접적으로 응답하는 구조**여야 합니다.
   - 핵심 목표가 미입력인 경우: reportTitle과 currentSituation에서 의도를 추론해 가장 자연스러운 구조를 첫 번째로 배치하세요.

4. **피해야 할 내용은 모든 카드에서 완전히 제외하세요.**
   - pagePlan message, narrativeFlow, keyMessage, name 어디에도 포함되면 안 됩니다.

5. **참고 자료의 도메인 키워드는 내용 보강에만 활용하세요.**
   - 같은 기술·업무 키워드가 3개 카드 모두의 name/keyMessage에 반복되면 안 됩니다.
   - 참고 자료 없이도 논리 구조는 완결되어야 합니다.

6. **recommendedReason은 반드시 이 형식으로 작성하세요.**
   - "핵심 목표의 [구체 내용]을 근거로 [이 구조]를 선택했습니다. [추론이 있다면 명시]"
   - 모호하게 쓰지 마세요. 왜 이 구조가 이 보고에 맞는지 입력 근거를 명시해야 합니다.

7. 각 pagePlan의 message는 해당 페이지에서 납득시킬 핵심 한 문장이어야 합니다.

8. pagePlan은 3~6페이지로 구성하세요. 불필요한 appendix 페이지는 만들지 마세요.

9. 고정 목차(개요 → As-Is → To-Be)를 그대로 쓰지 마세요.`)

  // ── 출력 형식 ─────────────────────────────────────────────────────────────
  parts.push(`## 출력 형식

반드시 아래 JSON 배열만 반환하세요. 다른 텍스트는 절대 포함하지 마세요.

\`\`\`json
${OUTPUT_SCHEMA}
\`\`\``)

  return parts.join('\n\n')
}
