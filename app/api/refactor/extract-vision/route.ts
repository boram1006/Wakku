import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const EXTRACT_VISION_PROMPT = `아래 보고서 슬라이드 이미지들을 순서대로 분석하여 JSON으로 반환하세요.

⚠️ 절대 원칙 — 위반 시 틀린 답
1. 모든 텍스트를 원문 그대로 읽으세요. 절대 요약·생략·바꿔쓰기 금지.
2. 수치·퍼센트·시간값·모델명·영문 그대로 포함. 임의 변경 금지.
3. 원본에 없는 내용 추가 금지.
4. 슬라이드 내 독립적 주제 블록은 별도 섹션으로 분리하세요.

## 슬라이드 읽는 법 — 반드시 따르세요

### 슬라이드 구조
- 맨 상단 작은 텍스트 = 이 장표의 섹션 번호/주제 (예: "2. PRISM 구축 결과")
- 하단 큰 굵은 텍스트 = 이 장표에서 전달하는 핵심 메세지(헤드라인). hero 섹션의 subtitle로 사용.
- 슬라이드 상단 레이블·제목 → 섹션 title로 추출. 카드 tag에 넣지 마세요.

### 다중 블록 읽기 순서 (N자 — 왼쪽 우선)
슬라이드에 좌우 2열 블록이 있으면 다음 순서로 읽으세요:
1. 왼쪽 상단 블록
2. 왼쪽 하단 블록
3. 오른쪽 상단 블록
4. 오른쪽 하단 블록
→ 이 순서가 sections 배열 순서입니다.

### 카드 안에 미니카드/서브박스가 있는 경우
카드 본문 안에 별도 박스·강조 영역이 있으면 → subCard로 추출:
- subCard.title: 박스 제목
- subCard.items: 박스 안 항목들
- subCard.left/right: 좌우 비교형이면 각각의 레이블과 항목
→ 절대 삭제하지 마세요.

## 슬라이드 → 섹션 타입 매핑
- 첫 슬라이드, 큰 제목, 조직명, KPI 수치 → "hero"
- 목차, 오늘 보고 범위, 안건 → "agenda"
- As-Is / To-Be, 현재/개선, 박스 플로우, 워크플로우 비교 → "comparison"
- 카드/박스 나열, 배경/현황/문제/방안/적용범위 → "cards"
- 행·열로 구성된 표(격자형, 모델 비교표 등) → "table"
- 일정, 로드맵, 마일스톤, 분기별 계획 → "timeline"
- 조직도, R&R, 역할 분담 → "org"
- 논의, 결론, 다음 단계, Q&A → "discussion"

## table 슬라이드 추출 — 다단 헤더 주의

### 열 그룹 레이블 읽기 (중요!)
- 표 위쪽/밖에 큰 텍스트로 적힌 레이블(예: "PRISM 1.0", "PRISM 2.0 목표")은 → 그 아래 열들의 그룹 헤더입니다. headerGroups[0]에 colspan으로 포함하세요.
- 절대 "표 밖이니 제외"하지 마세요. 열 그룹 레이블은 표의 일부입니다.

### headerGroups 구조
- headerGroups[0]: 최상위 헤더 행. 병합 셀은 { label, colspan } 형태.
- headerGroups[1]: 두 번째 헤더 행 (서브헤더). 단일 셀은 { label } 형태.
- rows: 각 행 → { label: "행 이름", values: [...] }
  - values 항목은 문자열이거나, 셀 병합이 있으면 { text: "내용", colspan: N } 형태
  - 예: 4개 열 중 2개가 병합된 셀이면 → { text: "2,445/5분", colspan: 2 }
  - values 개수(colspan 합산)는 headerGroups 마지막 행의 열 수와 같아야 함
- note: 표 아래 주석 (있으면)

예시: 표 위에 "PRISM 1.0" / "PRISM 2.0 목표" 레이블이 있고, 그 아래 "4.1-mini"가 β/정식 두 열로 쪼개짐:
  headerGroups: [
    [{ label: "특성" }, { label: "PRISM 1.0", colspan: 2 }, { label: "PRISM 2.0 목표", colspan: 2 }],
    [{ label: "" }, { label: "4.1-mini β" }, { label: "4.1-mini 정식" }, { label: "5-mini" }, { label: "5.2" }]
  ]
  rows: [
    { "label": "분류 정확도", "values": ["65%", "94%", "96% ↑", "31%"] },
    { "label": "비용/시간", "values": [{ "text": "2,445/5분", "colspan": 2 }, { "text": "4,743원/25분", "colspan": 2 }] }
  ]

## cards 슬라이드 추출
각 카드/박스마다:
- title: 카드 제목 (원문 그대로)
- body: 본문 설명 원문 전체 (절대 요약하지 마세요, 여러 문장 모두)
- items: 해당 카드의 bullet point 전체 (원문 그대로)
- tag: 카드 안에 명시된 작은 뱃지 레이블만
- takeaway: 핵심 요약 박스 텍스트 (있으면)
- callout: 카드 안의 코드 블록·규칙 상자·예시 텍스트 원문 전체 (있으면, 예: "If any rule is violated...", "THESIS-FIRST:", "ALLOWED CAT4:")
- subCard: 카드 안에 별도 박스/강조 영역이 있으면
  { title, items?, left?: { label, items }, right?: { label, items } }

⚠️ 카드 안에 들여쓴 설명·예시·규칙 텍스트가 있으면 절대 빼지 마세요. callout 또는 items에 원문 전체를 담으세요.

## comparison 슬라이드 추출
- 각 단계 박스: idx, title, hours, detail (원문 전체), isBottleneck, isAI, isRemoved, savedHours
- totalHours, bottleneckHours, savedHours, savedPct
- problems, improvements (원문 그대로)

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
      "subtitle": "슬라이드 하단 헤드라인 메세지 (원문)",
      "kpis": [{"label": "지표명", "value": "54.5", "unit": "h 절감", "sub": "116h → 61.5h"}],
      "meta": [{"label": "항목명", "value": "값"}]
    },
    {
      "id": "prism-table", "type": "table",
      "secNum": "02", "title": "PRISM 활용 모델",
      "headerGroups": [
        [{"label": "특성"}, {"label": "PRISM 1.0", "colspan": 2}, {"label": "PRISM 2.0 목표", "colspan": 2}],
        [{"label": ""}, {"label": "4.1-mini β"}, {"label": "4.1-mini 정식"}, {"label": "5-mini"}, {"label": "5.2"}]
      ],
      "rows": [
        {"label": "분류 정확도", "values": ["65%", "94%", "96% ↑", "31%"]},
        {"label": "비용/시간", "values": ["2,445/5분", "", "4,743원/25분", "18,614원/1시간"]}
      ],
      "note": "※ 샘플 1,000건 상세 분석"
    },
    {
      "id": "cards-1", "type": "cards",
      "secNum": "02", "title": "개발 진행 과정",
      "cards": [
        {
          "title": "1. 대규모 정성 기사 → 일관된 포맷",
          "body": "LLM은 확률적 생성 특성으로 동일 입력에도 출력이 변동 → 대규모 집계. 대시보드용 정형 데이터로 사용하려면 출력 안정화가 필수.",
          "items": []
        },
        {
          "title": "3. LLM 수행 Task 구성의 어려움",
          "body": "작업 복잡성 및 비용 급격히 증가. 1회 수행 내 상충하는 Task 공존의 딜레마.",
          "subCard": {
            "title": "1회 호출 내 상충하는 Task 공존의 딜레마",
            "left": { "label": "낮은 창의성 필요", "items": ["카테고리 분류, 인용문, 브랜드 비율"] },
            "right": { "label": "높은 창의성 필요", "items": ["마케팅 메시지 추출, 요약, 감성분석"] }
          },
          "items": []
        }
      ]
    },
    {
      "id": "asis", "type": "comparison",
      "secNum": "03", "title": "비교 제목",
      "asis": { "steps": [], "totalHours": "", "problems": [] },
      "tobe": { "steps": [], "totalHours": "", "improvements": [] }
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
    max_tokens: 16000,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'

  // Validate JSON — if truncated, return error instead of broken JSON
  try {
    JSON.parse(raw)
  } catch {
    return new Response(JSON.stringify({ error: '슬라이드 분석 결과가 너무 큽니다. 슬라이드 수를 줄이거나 내용이 적은 이미지를 사용해 주세요.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  return new Response(raw, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
