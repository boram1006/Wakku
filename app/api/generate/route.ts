import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ProjectInput, AnalysisResult, AgentAnswers } from '@/types/agent'
import type { ReportData } from '@/types/report'

const client = new Anthropic()

const LAYOUT_GUIDE: Record<string, string> = {
  scope: `layoutType: "scope" — 보고 배경/목적/범위
  blocks: 2~4개, type: "card"
  각 block: { id, type:"card", meta:"레이블", title:"...", body:"..." }`,

  'overview-kpi': `layoutType: "overview-kpi" — KPI/핵심 지표
  blocks: 3개, type: "kpi"
  각 block: { id, type:"kpi", value:"42", meta:"h", title:"제목", body:"설명" }`,

  'problem-cards': `layoutType: "problem-cards" — 현황/문제점
  blocks: 3개, type: "card"
  각 block: { id, type:"card", meta:"Problem 01", title:"...", body:"..." }`,

  'to-be-flow': `layoutType: "to-be-flow" — 개선 방향
  blocks: 3개 flow + 1개 text(callout)
  flow block: { id, type:"flow", meta:"01", title:"...", body:"..." }
  callout block: { id, type:"text", body:"결론 문구" }`,

  timeline: `layoutType: "timeline" — 추진 일정
  blocks: 3~5개, type: "timeline"
  각 block: { id, type:"timeline", meta:"1단계 · 6월", body:"내용" }`,

  'effect-split': `layoutType: "effect-split" — 기대효과
  blocks: 2개, type: "card"
  block[0]: { id, type:"card", meta:"직접 효과", title:"...", body:"..." }
  block[1]: { id, type:"card", meta:"간접 효과", title:"...", body:"..." }`,
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

  const layoutsGuide = analysis.detectedLayouts
    .map((l, i) => `${i + 1}. ${l}:\n${LAYOUT_GUIDE[l] ?? ''}`)
    .join('\n\n')

  const prompt = `당신은 사내 보고자료 작성 전문가입니다. 아래 정보를 바탕으로 ReportData JSON을 생성합니다.

## 입력 정보
- 보고 제목: ${input.reportTitle}
${input.reportContext ? `- 보고 맥락: ${input.reportContext}` : ''}
${input.reportGoal ? `- 핵심 목표: ${input.reportGoal}` : ''}
${input.avoidPoints ? `- 피해야 할 내용: ${input.avoidPoints}` : ''}
- 원본 자료:
${input.referenceMaterial ?? '(없음)'}

## 추가 답변
${answersText || '(없음)'}

## 생성할 페이지 구조
${layoutsGuide}

## 작성 원칙
- 모든 텍스트는 원본 자료와 답변에서 실제 내용을 뽑아 작성 (지어내지 말 것)
- title은 간결하게 (20자 이내), body는 구체적으로 (50~100자)
- subtitle은 페이지 핵심을 한 줄로
- sectionNumber: "01", "02", ... (순서대로)

## 응답 형식 (JSON만, 다른 텍스트 없음)
{
  "brand": "${input.reportTitle}",
  "pages": [
    {
      "id": "scope",
      "sectionNumber": "01",
      "sectionLabel": "보고 범위",
      "title": "...",
      "subtitle": "...",
      "layoutType": "scope",
      "blocks": [...]
    }
  ]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON not found in response')
    const report: ReportData = JSON.parse(jsonMatch[0])
    return NextResponse.json(report)
  } catch (e) {
    console.error('generate error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
