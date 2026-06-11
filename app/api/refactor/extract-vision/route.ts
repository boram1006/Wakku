import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const EXTRACT_VISION_PROMPT = `아래 보고서 슬라이드 이미지들을 순서대로 분석하여 JSON으로 반환하세요.

⚠️ 핵심 원칙
1. 모든 슬라이드의 텍스트를 원문 그대로 읽으세요 (한국어 포함)
2. 각 슬라이드를 순서대로 적절한 섹션 타입으로 변환하세요
3. 수치, 시간값(h), 백분율(%)은 반드시 포함
4. 원본에 없는 내용 추가 금지

## 슬라이드 → 섹션 타입 매핑
- 첫 슬라이드, 큰 제목, 조직명, KPI 수치 → "hero"
- 목차, 오늘 보고 범위, 안건 → "agenda"
- As-Is / To-Be, 현재/개선, 박스 플로우, 워크플로우 비교 → "comparison"
- 카드/박스 나열, 배경/현황/문제/방안/적용범위 → "cards"
- 일정, 로드맵, 마일스톤, 분기별 계획 → "timeline"
- 조직도, R&R, 역할 분담 → "org"
- 논의, 결론, 다음 단계, Q&A → "discussion"

## comparison 슬라이드 추출 (핵심)
As-Is(현재) / To-Be(개선) 비교 슬라이드에서:
- 각 단계 박스: idx(순번 01 02...), title(단계명), hours(시간값h), detail(설명 텍스트)
- 병목/빨간 강조 박스 → isBottleneck: true
- AI/자동화/파란 강조 박스 → isAI: true
- 제거/흐릿/취소선 박스 → isRemoved: true
- savedHours: 해당 단계의 절감 시간
- 총 시간합계(totalHours), 병목합계(bottleneckHours), 절감량(savedHours), 절감률(savedPct)
- problems: As-Is 문제점 텍스트 목록, improvements: To-Be 개선효과 텍스트 목록

## cards 슬라이드 추출
각 카드/박스마다:
- title: 카드 제목
- body: 본문 설명 원문 (최소 1문장, 비우지 마세요)
- items: 해당 카드의 bullet point 전체 (비우지 마세요)
- tag: 태그/라벨 텍스트 (있으면)
- takeaway: 핵심 요약 (있으면)

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
          {"idx": "01", "title": "단계명", "hours": "27h", "isBottleneck": false, "detail": "설명"},
          {"idx": "02", "title": "병목 단계", "hours": "130h", "isBottleneck": true, "detail": "병목 원인"}
        ],
        "totalHours": "431h", "bottleneckHours": "290h",
        "problems": ["문제점 1 (원문)", "문제점 2"],
        "takeaway": "핵심 요약"
      },
      "tobe": {
        "flowTitle": "개선된 업무 흐름",
        "steps": [
          {"idx": "01", "title": "단계명", "hours": "27h"},
          {"idx": "02", "title": "AI 처리", "hours": "20h", "isAI": true, "savedHours": "110h", "detail": "AI 처리 내용"}
        ],
        "totalHours": "160h", "savedHours": "271h", "savedPct": "63%",
        "improvements": ["개선 효과 1 (원문)", "개선 효과 2"],
        "takeaway": "핵심 개선 요약"
      }
    },
    {
      "id": "cards-1", "type": "cards", "secNum": "03",
      "title": "섹션 제목", "subtitle": "설명",
      "cards": [
        {
          "tag": "태그", "tagStyle": "brand",
          "title": "카드 제목",
          "body": "본문 설명 (원문 1~2문장)",
          "items": ["항목 1 (원문)", "항목 2", "항목 3"],
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
