import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const SECTION_TYPE_RULES = `## 섹션 타입 — 반드시 내용 구조로 판단 (제목 무시)

⚠️ 슬라이드 제목/섹션명이 '과정', '진행', '단계'라도 내용이 번호 항목이면 cards다.

판단 우선순위 (위에서부터 체크):
1. 박스+화살표 단방향 파이프라인 (As-Is/To-Be 아님) → "flow"
2. 시기(날짜/월)·버전(v0,v1…) 컬럼이 있는 히스토리 표 + 최종 결과 박스 → "process"
   ⚠️ process 조건: ①시기 컬럼 ②버전 컬럼 ③결과 박스 — 셋 다 있어야만 process
3. 번호(1. 2. 3. …) 또는 굵은 소제목으로 구분된 항목들 → "cards"
   ⚠️ 제목에 '과정','진행','개발'이 있어도 내용이 번호 항목이면 반드시 cards
4. As-Is/To-Be 비교 구조 → "comparison"
5. 행·열 표 (시기/버전 없는 일반 표) → "table"
6. 일정·로드맵 → "timeline"
7. 조직도·R&R → "org"
8. 목차·안건 → "agenda"
9. 큰 제목·KPI 수치 → "hero"
10. 논의·Q&A → "discussion"`

const PROCESS_SPEC = `## process 추출 (조건: 시기+버전+결과 박스 모두 있어야 함)
- intro: 배경·목표 텍스트 원문
- steps: [{period, version, label, metric}]
- result: {title, items[]}

예시:
\`\`\`json
{"id":"dev-process","type":"process","secNum":"02","title":"개발 과정",
 "intro":"목표: '경쟁사의 PR 활동 모니터링'...",
 "steps":[
   {"period":"25.07","version":"v0","label":"BERTopic 기반 초기 프로토타입","metric":"~60%"},
   {"period":"25.08","version":"v1~v5","label":"BGE-M3 전환, 기본 파이프라인 구축","metric":"~50%"}
 ],
 "result":{"title":"최종 모델: BGE-M3 + PRISM 자체 파이프라인 구축",
   "items":["Multi-Signal Embedding: Title(60%) + Keyword(30%) + Summary(10%)"]}}
\`\`\``

const FLOW_SPEC = `## flow 추출 (박스+화살표 단방향 처리 파이프라인)
- steps: [{idx, title, detail}]

예시:
\`\`\`json
{"id":"pr-trend-flow","type":"flow","secNum":"02","title":"PR Trend 도출 과정",
 "steps":[
   {"idx":"01","title":"수집/전처리","detail":"글로벌 PR 뉴스"},
   {"idx":"02","title":"Multi-Signal Embedding","detail":"Combined Vector (1,024차원)"},
   {"idx":"03","title":"HDBSCAN","detail":"원본 벡터 클러스터링"},
   {"idx":"04","title":"노이즈 복구","detail":"Keyword→Embedding→Merge"}
 ]}
\`\`\``

const CARDS_SPEC = `## cards 추출
각 카드: title(원문), body(원문 전체), items(bullet 전체), tag(뱃지), takeaway, callout(코드·규칙 블록 원문), subCard({title, items?, left?, right?})
⚠️ 카드 안 들여쓴 설명·규칙 텍스트 절대 생략 금지 — callout 또는 items에 원문 전체.
⚠️ 번호 붙은 항목(1. 제목 + 설명)은 카드 하나하나로 추출. 줄글로 합치지 말 것.`

const TABLE_SPEC = `## table 추출
- 표 위 그룹 레이블(예: "PRISM 1.0") → headerGroups[0]에 colspan으로 포함 (표 밖이라도 생략 금지)
- headerGroups[0]: [{label, colspan?}, ...]  headerGroups[1]: [{label}, ...]
- rows: [{label, values: [string | {text,colspan}]}]
- note: 표 아래 주석`

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

${SECTION_TYPE_RULES}

${PROCESS_SPEC}

${FLOW_SPEC}

${CARDS_SPEC}

${TABLE_SPEC}

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

${SECTION_TYPE_RULES}

${PROCESS_SPEC}

${FLOW_SPEC}

${CARDS_SPEC}

${TABLE_SPEC}

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
  const merged: { title?: string; org?: string; date?: string; sections: unknown[] } = { sections: [] }
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
    for (const sec of sections) {
      const s = sec as Record<string, unknown>
      if (!s.id || String(s.id) === s.type) {
        s.id = `${s.type}-${++sectionIdx}`
      }
      merged.sections.push(s)
    }
  }

  // Claude validator: review and correct the merged JSON
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const validation = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        messages: [{
          role: 'user',
          content: `GPT-4o가 슬라이드 이미지에서 추출한 JSON을 검토하고 수정하세요.

## 핵심 규칙: 섹션 타입은 제목이 아니라 내용 구조로 판단

### process 조건 (셋 다 있어야만 process)
1. 시기(날짜/월) 컬럼
2. 버전(v0, v1… 또는 단계명) 컬럼
3. 최종 결과·선정 박스
→ 위 조건 미충족이면 cards로 변환

### cards 조건
- 번호(1. 2. 3. …) 또는 굵은 소제목으로 구분된 항목들
- 섹션 제목이 '과정', '진행', '개발'이어도 내용이 번호 항목이면 cards
- process로 분류됐지만 시기/버전 컬럼 없으면 → cards로 변환
  변환 시 각 항목을 cards[].title + cards[].body + cards[].items 로 분리

### flow 조건
- 박스+화살표 단방향 파이프라인 (As-Is/To-Be 비교 아님)

## 추가 검토 항목
- 슬라이드 간 내용 혼재 금지 — 각 섹션은 한 슬라이드의 내용만
- 빈 문자열, 빈 배열, null 필드 삭제
- 중복 id 수정

## 원본 JSON
${JSON.stringify(merged)}

## 응답 규칙
수정된 완전한 JSON만 반환 (설명, 마크다운 코드블록 없이 순수 JSON)`,
        }],
      })

      const raw = validation.content[0].type === 'text' ? validation.content[0].text : ''
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
      try {
        const validated = JSON.parse(cleaned)
        return new Response(JSON.stringify(validated), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        })
      } catch {
        // Claude returned invalid JSON — fall through to return unvalidated
      }
    } catch {
      // Validation failed — return unvalidated merged result
    }
  }

  return new Response(JSON.stringify(merged), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
