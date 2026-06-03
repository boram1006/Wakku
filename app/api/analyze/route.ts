import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ProjectInput, AnalysisResult } from '@/types/agent'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const input: ProjectInput = await req.json()

  const prompt = `당신은 사내 보고자료 전문가입니다. 사용자가 제공한 원본 자료를 분석해 보고자료 구성을 파악합니다.

입력 정보:
- 보고 제목: ${input.reportTitle}
${input.reportContext ? `- 보고 맥락: ${input.reportContext}` : ''}
${input.reportGoal ? `- 핵심 목표: ${input.reportGoal}` : ''}
${input.sourceText ? `- 원본 자료:\n${input.sourceText}` : ''}
${input.avoidPoints ? `- 피해야 할 내용: ${input.avoidPoints}` : ''}

다음을 분석해 JSON으로 응답하세요. JSON 외에 다른 텍스트는 절대 출력하지 마세요.

분석 기준:
1. detectedLayouts: 원본 자료에서 감지된 보고서 레이아웃. 아래 중 해당하는 것만 포함 (순서 유지):
   - "scope": 보고 배경, 목적, 범위, 개요
   - "overview-kpi": KPI, 핵심 성과지표, 수치 중심 현황
   - "problem-cards": 현황, 문제점, 이슈, 병목
   - "to-be-flow": 개선 방향, 해결책, To-Be
   - "timeline": 추진 일정, 로드맵, 단계별 계획
   - "effect-split": 기대효과, 예상 성과, ROI

2. detectedKpis: 원본 자료에서 발견된 구체적 수치/지표 (예: "42h", "38%", "매출 12억"). 최대 5개.

3. questions: 보고자료를 더 잘 만들기 위해 꼭 필요한 추가 정보 질문. 최대 3개. 이미 원본에 있는 내용은 묻지 말 것.
   각 질문: { "id": "q1", "question": "질문 내용", "hint": "입력 예시", "multiline": false }
   - multiline: 길게 서술해야 하는 경우 true

응답 형식:
{
  "detectedLayouts": ["scope", "problem-cards", ...],
  "detectedKpis": ["42h", "38%"],
  "detectedProblems": [],
  "questions": [
    { "id": "q1", "question": "...", "hint": "...", "multiline": false }
  ]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON not found')
    const result: AnalysisResult = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (e) {
    console.error('analyze error:', e)
    const fallback: AnalysisResult = {
      detectedLayouts: ['scope', 'problem-cards', 'to-be-flow'],
      detectedKpis: [],
      detectedProblems: [],
      questions: [],
    }
    return NextResponse.json(fallback)
  }
}
