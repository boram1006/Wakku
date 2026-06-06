import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const EXTRACT_PROMPT = (html: string) => `아래 HTML 보고서에서 내용을 분석하여 JSON으로 반환하세요.

## 섹션 type 종류
- "cover"      : 표지·제목 전용 첫 화면
- "agenda"     : 금일 보고 범위·목차
- "hero"       : 과제 개요·배경 (KPI 지표 포함 가능)
- "comparison" : As-Is / To-Be 비교 (두 상태를 나란히 보여줌)
- "cards"      : 카드 나열형 (배경·현황·개선방안 등)
- "kpi"        : 핵심 수치·지표 강조
- "flow"       : 프로세스·업무 흐름 단계
- "timeline"   : 일정·로드맵·마일스톤
- "table"      : 표 형태 데이터
- "org"        : 조직·R&R·역할 분담
- "discussion" : 추가 논의·결론·다음 단계

## 출력 형식 (JSON only, 설명 없이)
{
  "title": "보고서 전체 제목",
  "org": "조직·팀명",
  "date": "보고 날짜",
  "navItems": [{"label": "섹션명", "href": "#section-id"}],
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "eyebrow": "조직명 · 연도",
      "title": "섹션 제목",
      "subtitle": "한 문단 설명",
      "kpis": [
        {"label": "지표명", "value": "54.5", "unit": "h 절감", "sub": "116h → 61.5h"}
      ],
      "items": ["불릿 포인트 1", "불릿 포인트 2"],
      "meta": [{"label": "항목명", "value": "값"}]
    },
    {
      "id": "asis",
      "type": "comparison",
      "secNum": "02",
      "title": "섹션 제목",
      "subtitle": "설명",
      "asis": {
        "title": "As-Is · 현재",
        "label": "현재 상태 레이블",
        "items": ["현재 문제점 1", "현재 문제점 2"],
        "steps": [{"idx": "01", "title": "단계명", "hours": "27h", "highlight": false}]
      },
      "tobe": {
        "title": "To-Be · 개선",
        "label": "개선 상태 레이블",
        "items": ["개선 방향 1", "개선 방향 2"],
        "steps": [{"idx": "01", "title": "단계명", "hours": "10h", "highlight": true}]
      }
    },
    {
      "id": "cards-1",
      "type": "cards",
      "secNum": "03",
      "title": "섹션 제목",
      "subtitle": "설명",
      "cards": [
        {
          "tag": "태그명",
          "tagStyle": "brand",
          "title": "카드 제목",
          "body": "카드 설명",
          "items": ["항목 1"],
          "takeaway": "핵심 요약 한 줄"
        }
      ]
    },
    {
      "id": "timeline",
      "type": "timeline",
      "secNum": "05",
      "title": "추진 일정",
      "subtitle": "설명",
      "milestones": [
        {"period": "Q1 2026", "title": "마일스톤명", "items": ["세부 항목 1"]}
      ]
    },
    {
      "id": "org",
      "type": "org",
      "secNum": "06",
      "title": "조직 및 R&R",
      "subtitle": "설명",
      "teams": [
        {"role": "ROLE", "name": "팀명", "items": ["담당 업무 1"]}
      ]
    },
    {
      "id": "discussion",
      "type": "discussion",
      "secNum": "07",
      "title": "추가 논의",
      "subtitle": "설명",
      "cards": [
        {"tag": "확인필요", "tagStyle": "warning", "title": "논의 주제", "body": "논의 내용", "items": []}
      ]
    }
  ]
}

원본 HTML:
${html}`

export async function POST(req: NextRequest) {
  const { html }: { html: string } = await req.json()

  if (!html?.trim()) {
    return new Response(JSON.stringify({ error: '입력 HTML이 없습니다.' }), { status: 400 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }), { status: 500 })
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: EXTRACT_PROMPT(html) }],
    temperature: 0.1,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  })

  const json = completion.choices[0]?.message?.content ?? '{}'
  return new Response(json, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
