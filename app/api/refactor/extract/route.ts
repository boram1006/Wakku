import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const EXTRACT_PROMPT = (html: string) => `아래 HTML 보고서의 텍스트 내용을 빠짐없이 추출하여 JSON으로 반환하세요.

⚠️ 핵심 원칙
1. HTML의 모든 섹션을 순서대로 처리하세요 — comparison 이후 섹션도 동등하게 추출
2. 각 섹션의 본문(body)·항목(items)은 원문 텍스트를 그대로 넣으세요
3. 원본에 없는 내용 추가 금지

## A. comparison 섹션 (As-Is / To-Be 워크플로우)

비교 섹션 찾기: As-Is, To-Be, 현재, 개선, Before, After, 워크플로우, 프로세스 키워드
업무 단계 인식: 순서 번호(01 02 03...) + 단계명 + 시간값(27h, 130h...) 조합
특수 단계: 병목/지연 → isBottleneck:true, AI/자동화 → isAI:true, 제거/삭제 → isRemoved:true
수치: totalHours, bottleneckHours, savedHours, savedPct(%)

## B. cards 섹션 (카드 나열형)

카드 섹션 찾기: 배경, 현황, 문제, 개선방안, 적용 범위 등 카드나 박스가 나열된 섹션
각 카드에서 반드시 추출:
- title: 카드 제목 (h3, h4 등)
- body: 카드 본문 설명 (p 태그, div 텍스트 — 원문 그대로, 최소 1문장)
- items: 해당 카드의 모든 bullet point (li 항목 전체)
- tag: 태그/라벨 텍스트 (있으면)
- takeaway: 핵심 요약 한 줄 (있으면)

## C. timeline 섹션

일정, 로드맵, 마일스톤, 추진 계획 섹션
각 milestone: period(Q1 2026 등), title, items(세부 항목 전체)

## D. org 섹션

조직, R&R, 역할, 담당 섹션
각 team: role(역할명), name(팀/조직명), items(담당 업무 전체)

## 섹션 타입 (원본에 있는 것만 사용)
"hero" | "agenda" | "comparison" | "cards" | "kpi" | "timeline" | "org" | "discussion"

## JSON 출력 형식
{
  "title": "보고서 전체 제목",
  "org": "조직·팀명",
  "date": "날짜",
  "sections": [
    {
      "id": "hero", "type": "hero",
      "eyebrow": "조직명 · 연도",
      "title": "과제 제목",
      "subtitle": "배경·개요 (원문 그대로)",
      "kpis": [{"label": "지표명", "value": "54.5", "unit": "h 절감", "sub": "116h → 61.5h"}],
      "items": ["항목 1", "항목 2"],
      "meta": [{"label": "항목명", "value": "값"}]
    },
    {
      "id": "asis", "type": "comparison",
      "secNum": "02", "title": "제목", "subtitle": "설명",
      "asis": {
        "flowTitle": "현재 업무 흐름",
        "steps": [
          {"idx": "01", "title": "단계명", "hours": "27h", "isBottleneck": false, "detail": "설명"},
          {"idx": "02", "title": "병목 단계", "hours": "130h", "isBottleneck": true, "detail": "병목 원인"}
        ],
        "totalHours": "431h", "bottleneckHours": "290h",
        "problems": ["문제점 (원문)"],
        "takeaway": "핵심 요약"
      },
      "tobe": {
        "flowTitle": "개선된 업무 흐름",
        "steps": [
          {"idx": "01", "title": "단계명", "hours": "27h"},
          {"idx": "02", "title": "AI 처리", "hours": "20h", "isAI": true, "savedHours": "110h"}
        ],
        "totalHours": "160h", "savedHours": "271h", "savedPct": "63%",
        "improvements": ["개선 효과 (원문)"],
        "takeaway": "핵심 요약"
      }
    },
    {
      "id": "cards-1", "type": "cards", "secNum": "03",
      "title": "섹션 제목", "subtitle": "설명",
      "cards": [
        {
          "tag": "태그", "tagStyle": "brand",
          "title": "카드 제목",
          "body": "카드 본문 설명 — 원문 그대로 1~2문장",
          "items": ["bullet 항목 1 (원문)", "항목 2", "항목 3"],
          "takeaway": "핵심 요약"
        }
      ]
    },
    {
      "id": "timeline", "type": "timeline", "secNum": "05",
      "title": "추진 일정",
      "milestones": [{"period": "Q1 2026", "title": "마일스톤", "items": ["세부 항목 (원문)"]}]
    },
    {
      "id": "org", "type": "org", "secNum": "06",
      "title": "조직 및 R&R",
      "teams": [{"role": "LEAD", "name": "팀명", "items": ["담당 업무 (원문)"]}]
    },
    {
      "id": "discussion", "type": "discussion", "secNum": "07",
      "title": "추가 논의",
      "cards": [{"tag": "확인필요", "tagStyle": "warning", "title": "주제", "body": "내용", "items": []}]
    }
  ]
}

원본 HTML:
${html}`

function stripStylesAndScripts(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function POST(req: NextRequest) {
  const { html }: { html: string } = await req.json()

  if (!html?.trim()) {
    return new Response(JSON.stringify({ error: '입력 HTML이 없습니다.' }), { status: 400 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }), { status: 500 })
  }

  const strippedHtml = stripStylesAndScripts(html)

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: EXTRACT_PROMPT(strippedHtml) }],
    temperature: 0.1,
    max_tokens: 12000,
    response_format: { type: 'json_object' },
  })

  const json = completion.choices[0]?.message?.content ?? '{}'

  // Return JSON + stripped source so the caller can pass it to generate as fallback
  const parsed = JSON.parse(json)
  const responsePayload = JSON.stringify({
    ...parsed,
    _sourceHtml: strippedHtml.slice(0, 25000),
  })

  return new Response(responsePayload, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
