import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const EXTRACT_PROMPT = (html: string) => `아래 HTML 보고서의 텍스트 내용을 빠짐없이 추출하여 JSON으로 반환하세요.

⚠️ 스캔 원칙 — 이것이 가장 중요합니다
HTML의 모든 텍스트 노드를 빠짐없이 읽으세요:
- 모든 h1 ~ h4 제목
- 모든 p, li, td, th, span, div의 텍스트 내용
- 숫자 + 단위 (h, %, 개, 건, 월), 비율, 절감량, 업무 시간
- 보고서의 모든 섹션 (하나도 빠뜨리지 마세요)
원본에 없는 내용 추가 금지.

## comparison 섹션 추출 — 가장 중요합니다. 아래 방법으로 찾으세요.

### 1단계: 비교 섹션 위치 파악
다음 키워드가 포함된 섹션을 찾으세요:
- As-Is, To-Be, 현재, 개선, 기존, 신규, Before, After
- 워크플로우, 업무 흐름, 프로세스, 절차

### 2단계: 업무 단계(step) 인식
HTML에서 다음 패턴을 업무 단계로 인식하세요:
- "01", "02", "03" 등 순서 번호 + 단계명 텍스트 조합
- 숫자h (예: 27h, 130h, 160h) 형태의 소요시간 표시
- 화살표(→) 사이에 있는 박스형 요소
- proc-step, step, flow-step, process-step 등의 class를 가진 반복 요소
- 각 단계를 순서대로 steps 배열에 넣으세요

### 3단계: 특수 단계 식별
- 병목/bottleneck/지연/오래걸리는 단계: isBottleneck: true
- AI/자동화/시스템 처리 단계: isAI: true
- 제거/삭제/없어지는 단계: isRemoved: true

### 4단계: 수치 수집
- As-Is 총 시간, 병목 구간 시간
- To-Be 총 시간, 절감량, 절감률(%)
- 문제점 목록 (problems), 개선 효과 목록 (improvements)

## 섹션 타입 (원본에 있는 것만 사용)
- "hero"       : 첫 화면 — 과제 개요, KPI, 배경 설명
- "agenda"     : 목차 / 금일 보고 범위
- "comparison" : As-Is / To-Be 업무 흐름 비교
- "cards"      : 카드 나열 — 배경·현황·문제·개선방안 등
- "kpi"        : 핵심 수치·지표
- "timeline"   : 추진 일정 / 로드맵
- "org"        : 조직·R&R
- "discussion" : 추가 논의·결론

## JSON 출력 형식 (JSON only, 설명 없이)
{
  "title": "보고서 전체 제목",
  "org": "조직·팀명",
  "date": "날짜",
  "sections": [
    {
      "id": "hero", "type": "hero",
      "eyebrow": "조직명 · 연도",
      "title": "과제 제목",
      "subtitle": "배경·개요 설명 (원문 그대로)",
      "kpis": [{"label": "지표명", "value": "54.5", "unit": "h 절감", "sub": "116h → 61.5h"}],
      "items": ["원본 텍스트 항목 1", "항목 2"],
      "meta": [{"label": "항목명", "value": "값"}]
    },
    {
      "id": "asis", "type": "comparison",
      "secNum": "02", "title": "As-Is / To-Be 비교", "subtitle": "설명",
      "asis": {
        "flowTitle": "현재 업무 흐름",
        "steps": [
          {"idx": "01", "title": "단계명", "hours": "27h", "isBottleneck": false, "detail": "설명"},
          {"idx": "02", "title": "병목 단계", "hours": "130h", "isBottleneck": true, "detail": "병목 원인"}
        ],
        "totalHours": "431h",
        "bottleneckHours": "290h",
        "problems": ["문제점 1 (원문)", "문제점 2"],
        "takeaway": "핵심 문제 한 줄 요약"
      },
      "tobe": {
        "flowTitle": "개선된 업무 흐름",
        "steps": [
          {"idx": "01", "title": "단계명", "hours": "27h", "isAI": false, "savedHours": null},
          {"idx": "02", "title": "AI 처리 단계", "hours": "20h", "isAI": true, "savedHours": "110h", "detail": "AI 처리 내용"},
          {"idx": "03", "title": "제거된 단계", "hours": "0h", "isRemoved": true, "savedHours": "60h"}
        ],
        "totalHours": "160h",
        "savedHours": "271h",
        "savedPct": "63%",
        "improvements": ["개선 효과 1 (원문)", "개선 효과 2"],
        "takeaway": "핵심 개선 한 줄 요약"
      }
    },
    {
      "id": "cards-1", "type": "cards", "secNum": "03",
      "title": "섹션 제목", "subtitle": "설명",
      "cards": [
        {"tag": "태그", "tagStyle": "brand", "title": "카드 제목", "body": "설명", "items": ["항목"], "takeaway": "요약"}
      ]
    },
    {
      "id": "timeline", "type": "timeline", "secNum": "05",
      "title": "추진 일정", "subtitle": "설명",
      "milestones": [{"period": "Q1 2026", "title": "마일스톤", "items": ["세부 항목"]}]
    },
    {
      "id": "org", "type": "org", "secNum": "06",
      "title": "조직 및 R&R", "subtitle": "설명",
      "teams": [{"role": "LEAD", "name": "팀명", "items": ["담당 업무"]}]
    },
    {
      "id": "discussion", "type": "discussion", "secNum": "07",
      "title": "추가 논의", "subtitle": "설명",
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
    max_tokens: 8000,
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
