import { NextRequest } from 'next/server'
import OpenAI from 'openai'

// Prompt for slide 0 (first slide) — extracts global metadata + sections
const PROMPT_FIRST = `이 슬라이드 이미지를 분석하여 JSON으로 반환하세요. 첫 번째 슬라이드이므로 보고서 전체 제목·조직명·날짜도 추출하세요.

⚠️ 절대 원칙
1. 모든 텍스트를 원문 그대로. 요약·생략·바꿔쓰기 금지.
2. 수치·퍼센트·시간값·모델명·영문 그대로. 임의 변경 금지.
3. 원본에 없는 내용 추가 금지.
4. 값이 없는 필드는 생략 (빈 문자열·빈 배열·null 금지).

## 슬라이드 읽기 규칙
- 맨 상단 작은 텍스트 = 섹션 번호/주제 → sections[].title (secNum)
- 하단 큰 굵은 텍스트 = 헤드라인 → hero.subtitle
- 좌우 2열 블록이 있으면 N자 순서: 왼쪽 상단 → 왼쪽 하단 → 오른쪽 상단 → 오른쪽 하단

## 섹션 타입
- 큰 제목 · KPI 수치 → "hero"
- 목차 · 안건 → "agenda"
- As-Is/To-Be · 플로우 비교 → "comparison"
- 카드/박스 나열 → "cards"
- 행·열 표 → "table"
- 일정 · 로드맵 → "timeline"
- 조직도 · R&R → "org"
- 논의 · Q&A → "discussion"

## cards 추출
각 카드: title(원문), body(원문 전체), items(bullet 전체), tag(뱃지), takeaway, callout(코드·규칙 블록 원문), subCard({title, items?, left?, right?})
⚠️ 카드 안 들여쓴 설명·규칙 텍스트 절대 생략 금지 — callout 또는 items에 원문 전체.

## table 추출
- 표 위 그룹 레이블(예: "PRISM 1.0") → headerGroups[0]에 colspan으로 포함 (표 밖이라도 생략 금지)
- headerGroups[0]: [{label, colspan?}, ...]  headerGroups[1]: [{label}, ...]
- rows: [{label, values: [string | {text,colspan}]}]
- note: 표 아래 주석

## JSON 형식 (JSON only)
{
  "title": "보고서 전체 제목",
  "org": "조직명",
  "date": "날짜",
  "sections": [
    {"id":"hero","type":"hero","eyebrow":"","title":"","subtitle":"","kpis":[{"label":"","value":"","unit":"","sub":""}],"meta":[{"label":"","value":""}]},
    {"id":"cards-1","type":"cards","secNum":"02","title":"섹션제목","cards":[{"title":"","body":"","items":[],"callout":"","subCard":{"title":"","left":{"label":"","items":[]},"right":{"label":"","items":[]}}}]},
    {"id":"tbl-1","type":"table","secNum":"02","title":"","headerGroups":[[]],"rows":[{"label":"","values":[]}],"note":""}
  ]
}`

// Prompt for slides 1+ — sections only, no global metadata
const PROMPT_SLIDE = (slideNum: number) => `이 슬라이드(${slideNum + 1}번째)를 분석하여 sections 배열만 JSON으로 반환하세요.

⚠️ 절대 원칙
1. 모든 텍스트를 원문 그대로. 요약·생략·바꿔쓰기 금지.
2. 수치·퍼센트·시간값·모델명·영문 그대로. 임의 변경 금지.
3. 원본에 없는 내용 추가 금지.
4. 값이 없는 필드는 생략 (빈 문자열·빈 배열·null 금지).

## 슬라이드 읽기 규칙
- 맨 상단 작은 텍스트 = 섹션 번호/주제 → sections[].title (secNum)
- 하단 큰 굵은 텍스트 = 헤드라인 → hero.subtitle
- 좌우 2열 블록이 있으면 N자 순서: 왼쪽 상단 → 왼쪽 하단 → 오른쪽 상단 → 오른쪽 하단

## 섹션 타입
- 큰 제목 · KPI 수치 → "hero"
- 목차 · 안건 → "agenda"
- As-Is/To-Be · 플로우 비교 → "comparison"
- 카드/박스 나열 → "cards"
- 행·열 표 → "table"
- 일정 · 로드맵 → "timeline"
- 조직도 · R&R → "org"
- 논의 · Q&A → "discussion"

## cards 추출
각 카드: title(원문), body(원문 전체), items(bullet 전체), tag(뱃지), takeaway, callout(코드·규칙 블록 원문), subCard({title, items?, left?, right?})
⚠️ 카드 안 들여쓴 설명·규칙 텍스트 절대 생략 금지 — callout 또는 items에 원문 전체.

## table 추출
- 표 위 그룹 레이블 → headerGroups[0]에 colspan으로 포함
- rows: [{label, values: [string | {text,colspan}]}]

## JSON 형식 (JSON only)
{"sections": [{"id":"...","type":"cards","secNum":"","title":"","cards":[...]}]}`

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }, { status: 500 })
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const formData = await req.formData()

  // Collect slide images
  const slides: { b64: string; mimeType: string }[] = []
  for (let i = 0; i < 20; i++) {
    const file = formData.get(`slide_${i}`) as File | null
    if (!file) break
    const buffer = await file.arrayBuffer()
    slides.push({ b64: Buffer.from(buffer).toString('base64'), mimeType: file.type || 'image/jpeg' })
  }

  if (slides.length === 0) {
    return Response.json({ error: '슬라이드 이미지가 없습니다.' }, { status: 400 })
  }

  // Call GPT in parallel — one call per slide
  const calls = slides.map((slide, i) => {
    const prompt = i === 0 ? PROMPT_FIRST : PROMPT_SLIDE(i)
    return client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${slide.mimeType};base64,${slide.b64}`, detail: 'high' } },
        ],
      }],
      temperature: 0.1,
      max_tokens: 16384,
      response_format: { type: 'json_object' },
    })
  })

  let results: Awaited<typeof calls[0]>[]
  try {
    results = await Promise.all(calls)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: `슬라이드 분석 중 오류: ${msg}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  // Parse and merge results
  let merged: { title?: string; org?: string; date?: string; sections: unknown[] } = { sections: [] }
  let sectionIdx = 0

  for (let i = 0; i < results.length; i++) {
    const raw = results[i].choices[0]?.message?.content ?? '{}'
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(raw)
    } catch {
      return new Response(
        JSON.stringify({ error: `${i + 1}번째 슬라이드 분석 결과가 너무 큽니다. 내용이 매우 많은 슬라이드입니다.` }),
        { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      )
    }

    if (i === 0) {
      merged.title = (parsed.title as string) || ''
      merged.org = (parsed.org as string) || ''
      merged.date = (parsed.date as string) || ''
    }

    const sections = (parsed.sections as unknown[]) ?? []
    // Ensure unique section ids across slides
    for (const sec of sections) {
      const s = sec as Record<string, unknown>
      if (!s.id || String(s.id) === s.type) {
        s.id = `${s.type}-${++sectionIdx}`
      }
      merged.sections.push(s)
    }
  }

  return new Response(JSON.stringify(merged), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
