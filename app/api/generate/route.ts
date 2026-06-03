import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ProjectInput, AnalysisResult, AgentAnswers } from '@/types/agent'
import type { Report } from '@/types/report'

const client = new Anthropic()

const SECTION_GUIDE: Record<string, string> = {
  scope: `type: "scope" — 보고 배경/목적/범위
  - kicker: "01 · 보고 범위"
  - cards: 2~4개. 각 카드는 보고 배경, 목적, 범위, 핵심 전달 메시지 등으로 구성
  - cards[0]: emphasis: true (가장 핵심 메시지)
  - callout 없음`,

  overview: `type: "overview" — KPI/핵심 지표
  - kicker: "02 · 개요/KPI"
  - cards: 3~4개. KPI 카드 형태 (kpiNum + kpiUnit 필수)
  - 예: { kpiNum: "42", kpiUnit: "h", title: "반복업무 절감", desc: "..." }
  - cards[0]: emphasis: true`,

  problem: `type: "problem" — 현황/문제점
  - kicker: "03 · 현황/문제"
  - cards: 3~4개. 각 카드는 구체적 문제 하나씩
  - callout: 문제를 한 문장으로 요약하는 핵심 인사이트`,

  tobe: `type: "tobe" — 개선 방향
  - kicker: "04 · 개선 방향"
  - steps: 3~4개. 단계별 개선 액션
  - 예: { num: "01", title: "구조 재설계", desc: "..." }
  - callout: 개선 후 기대되는 핵심 변화`,

  timeline: `type: "timeline" — 추진 일정
  - kicker: "05 · 추진 일정"
  - rows: 3~5개. 각 row는 기간 + 내용
  - 예: { label: "6월", text: "현황 분석 및 구조 정의" }`,

  effect: `type: "effect" — 기대효과
  - kicker: "06 · 기대효과"
  - cards: 3~4개. 기대효과 카드
  - cards[0]: emphasis: true, kpiNum + kpiUnit 포함
  - callout: 최종 임팩트 한 문장`,
}

export async function POST(req: NextRequest) {
  const {
    input,
    analysis,
    answers,
  }: { input: ProjectInput; analysis: AnalysisResult; answers: AgentAnswers } = await req.json()

  const answersText = Object.entries(answers)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join('\n')

  const sectionsGuide = analysis.detectedSections
    .map((s, i) => `${i + 1}. ${s}:\n${SECTION_GUIDE[s] ?? ''}`)
    .join('\n\n')

  const prompt = `당신은 사내 보고자료 작성 전문가입니다. 아래 정보를 바탕으로 실제 보고자료 JSON을 생성합니다.

## 입력 정보
- 보고 제목: ${input.reportTitle}
${input.reportContext ? `- 보고 맥락: ${input.reportContext}` : ''}
${input.reportGoal ? `- 핵심 목표: ${input.reportGoal}` : ''}
${input.avoidPoints ? `- 피해야 할 내용: ${input.avoidPoints}` : ''}
- 원본 자료:
${input.sourceText ?? '(없음)'}

## 추가 답변
${answersText || '(없음)'}

## 생성할 섹션 구조
${sectionsGuide}

## 작성 원칙
- 모든 텍스트는 원본 자료와 답변에서 실제 내용을 뽑아 작성 (지어내지 말 것)
- title은 간결하게 (20자 이내)
- desc는 구체적으로 (50~100자)
- subtitle은 섹션 핵심을 한 줄로
- kicker 형식: "01 · 섹션명" (번호는 순서대로)
- 각 섹션 isMuted: 짝수 인덱스 false, 홀수 인덱스 true

## 응답 형식 (JSON만, 다른 텍스트 없음)
{
  "brand": "${input.reportTitle}",
  "sections": [
    {
      "id": "sec-scope",
      "type": "scope",
      "kicker": "01 · 보고 범위",
      "title": "...",
      "subtitle": "...",
      "isMuted": false,
      "cards": [
        { "title": "...", "desc": "...", "emphasis": true },
        ...
      ]
    },
    ...
  ]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    // JSON 블록만 추출 (마크다운 코드블록 대응)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON not found in response')
    const report: Report = JSON.parse(jsonMatch[0])
    return NextResponse.json(report)
  } catch (e) {
    console.error('generate error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
