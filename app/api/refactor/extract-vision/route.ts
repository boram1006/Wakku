import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const EXTRACT_VISION_PROMPT = `아래 보고서 슬라이드 이미지들을 순서대로 분석하여 JSON으로 반환하세요.

⚠️ 절대 원칙 — 위반 시 틀린 답
1. 모든 텍스트를 원문 그대로 읽으세요. 절대 요약·생략·바꿔쓰기 금지.
2. 수치·퍼센트·시간값·모델명·영문 그대로 포함. 임의 변경 금지.
3. 원본에 없는 내용 추가 금지.
4. 한 슬라이드에 여러 내용 블록이 있으면 → 하나의 섹션에 모두 담으세요. 슬라이드 하나 = 섹션 하나가 원칙. (단, 슬라이드 내용이 명백히 두 개의 독립 주제면 분리 가능)
5. 슬라이드 상단의 큰 레이블/제목("개발 진행 과정", "PRISM 활용 모델" 등)은 반드시 섹션의 title로 추출. 카드 tag로 넣지 마세요.
6. 카드/항목의 tag 필드는 카드 본문 안에 명시적으로 표시된 작은 라벨(예: "PRISM 1.0", "개발 과정" 뱃지)에만 사용.

## 슬라이드 → 섹션 타입 매핑
- 첫 슬라이드, 큰 제목, 조직명, KPI 수치 → "hero"
- 목차, 오늘 보고 범위, 안건 → "agenda"
- As-Is / To-Be, 현재/개선, 박스 플로우, 워크플로우 비교 → "comparison"
- 카드/박스 나열, 배경/현황/문제/방안/적용범위 → "cards"
- 행·열로 구성된 표(격자형 데이터, 비교 테이블, 모델 비교표 등) → "table"
- 일정, 로드맵, 마일스톤, 분기별 계획 → "timeline"
- 조직도, R&R, 역할 분담 → "org"
- 논의, 결론, 다음 단계, Q&A → "discussion"

## comparison 슬라이드 추출
As-Is(현재) / To-Be(개선) 비교 슬라이드에서:
- 각 단계 박스: idx(순번 01 02...), title(단계명), hours(시간값h), detail(설명 텍스트 원문 전체)
- 병목/빨간 강조 박스 → isBottleneck: true
- AI/자동화/파란 강조 박스 → isAI: true
- 제거/흐릿/취소선 박스 → isRemoved: true
- savedHours: 해당 단계의 절감 시간
- 총 시간합계(totalHours), 병목합계(bottleneckHours), 절감량(savedHours), 절감률(savedPct)
- problems: As-Is 문제점 텍스트 목록 (원문 그대로), improvements: To-Be 개선효과 텍스트 목록 (원문 그대로)

## table 슬라이드 추출 (행·열 표 데이터)
행과 열로 구성된 모든 표:
- headers: 열 제목 배열 (첫 열이 행 레이블이면 첫 원소는 "" 또는 "구분")
- subHeaders: 헤더가 2단계인 경우 두 번째 행 헤더 배열 (없으면 생략)
- rows: 각 행 → { label: "행 이름", values: ["셀1", "셀2", ...] }
- groupLabel: 행 그룹이 있으면 그룹명 (없으면 생략)
- note: 표 아래 주석/설명 (있으면)

## cards 슬라이드 추출
각 카드/박스마다:
- title: 카드 제목 (원문 그대로)
- body: 본문 설명 원문 전체 (절대 요약하지 마세요, 여러 문장 모두)
- items: 해당 카드의 bullet point 전체 (원문 그대로, 비우지 마세요)
- tag: 카드 안에 명시된 작은 뱃지 레이블만 (섹션 제목은 여기 넣지 마세요)
- takeaway: 핵심 요약 박스 텍스트 (있으면)

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
      "subtitle": "배경·개요 (원문)",
      "kpis": [{"label": "지표명", "value": "54.5", "unit": "h 절감", "sub": "116h → 61.5h"}],
      "items": ["항목 1", "항목 2"],
      "meta": [{"label": "항목명", "value": "값"}]
    },
    {
      "id": "asis", "type": "comparison",
      "secNum": "02", "title": "As-Is / To-Be 비교", "subtitle": "설명",
      "asis": {
        "flowTitle": "현재 업무 흐름",
        "steps": [
          {"idx": "01", "title": "단계명", "hours": "27h", "isBottleneck": false, "detail": "설명 원문"},
          {"idx": "02", "title": "병목 단계", "hours": "130h", "isBottleneck": true, "detail": "병목 원인 원문"}
        ],
        "totalHours": "431h", "bottleneckHours": "290h",
        "problems": ["문제점 1 (원문)", "문제점 2 (원문)"],
        "takeaway": "핵심 요약"
      },
      "tobe": {
        "flowTitle": "개선된 업무 흐름",
        "steps": [
          {"idx": "01", "title": "단계명", "hours": "27h"},
          {"idx": "02", "title": "AI 처리", "hours": "20h", "isAI": true, "savedHours": "110h", "detail": "AI 처리 내용 원문"}
        ],
        "totalHours": "160h", "savedHours": "271h", "savedPct": "63%",
        "improvements": ["개선 효과 1 (원문)", "개선 효과 2 (원문)"],
        "takeaway": "핵심 개선 요약"
      }
    },
    {
      "id": "prism-table", "type": "table",
      "secNum": "02", "title": "PRISM 활용 모델",
      "subtitle": "표 설명 (있으면)",
      "headers": ["특성", "PRISM 1.0 β", "PRISM 1.0 정식", "PRISM 2.0 5-mini", "PRISM 2.0 5.2"],
      "subHeaders": [],
      "rows": [
        {"label": "분류 정확도", "values": ["65%", "94%", "96% ↑", "31%"]},
        {"label": "비용/시간", "values": ["2,445/5분", "", "4,743원/25분", "18,614원/1시간"]}
      ],
      "note": "표 아래 주석 원문 (있으면)"
    },
    {
      "id": "cards-1", "type": "cards", "secNum": "03",
      "title": "섹션 제목 (슬라이드 상단 큰 레이블)", "subtitle": "설명",
      "cards": [
        {
          "tag": "카드 안 뱃지만",
          "title": "카드 제목 (원문)",
          "body": "본문 설명 — 원문 전체 문장 (절대 요약 금지)",
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
      "cards": [{"tag": "확인필요", "tagStyle": "warning", "title": "주제", "body": "내용 (원문)", "items": []}]
    }
  ]
}`

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }, { status: 500 })
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const formData = await req.formData()

  const imageContents: OpenAI.Chat.ChatCompletionContentPartImage[] = []
  for (let i = 0; i < 20; i++) {
    const file = formData.get(`slide_${i}`) as File | null
    if (!file) break
    const buffer = await file.arrayBuffer()
    const b64 = Buffer.from(buffer).toString('base64')
    const mimeType = file.type || 'image/jpeg'
    imageContents.push({
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${b64}`, detail: 'high' },
    })
  }

  if (imageContents.length === 0) {
    return Response.json({ error: '슬라이드 이미지가 없습니다.' }, { status: 400 })
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: EXTRACT_VISION_PROMPT },
        ...imageContents,
      ],
    }],
    temperature: 0.1,
    max_tokens: 12000,
    response_format: { type: 'json_object' },
  })

  const json = completion.choices[0]?.message?.content ?? '{}'
  return new Response(json, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
