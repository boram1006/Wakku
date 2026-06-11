import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const EXTRACT_PROMPT = (html: string) => `아래 HTML 보고서의 텍스트 내용을 빠짐없이 추출하여 JSON으로 반환하세요.

⚠️ 핵심 원칙
1. HTML의 모든 섹션을 순서대로 처리하세요 — 마지막 섹션까지 빠짐없이
2. 각 섹션의 본문(body)·항목(items)은 원문 텍스트를 그대로 넣으세요 — 절대 요약하거나 생략하지 마세요
3. 원본에 없는 내용 추가 금지
4. cards.body는 p 태그 전체 문장을 그대로 담으세요 (한 문장도 빠뜨리지 마세요)

## A. comparison 섹션 (As-Is / To-Be 비교)

⚠️ 테이블과 플로우는 반드시 구분하세요:

### format: "table" — 원본이 <table> 태그로 AS-IS/TO-BE 열을 나란히 보여주는 경우
- thead에 AS-IS, TO-BE 같은 열이 있거나
- <table>의 각 행이 단계(구분)이고 열이 AS-IS/TO-BE인 구조
- 예: 9개 단계가 행으로, AS-IS와 TO-BE가 열로 나란히 있는 워크플로우 비교표
- 이 경우 tableRows 배열로 추출:
  - phase: 구간명 (있으면), phaseClass: "phase-p2d"|"phase-d2c"|"" , phaseSub: 구간 설명, phaseRowspan: rowspan 수
  - num: 단계 번호 (1,2,3...)
  - label: 단계명 (구분)
  - asIs: AS-IS 내용
  - toBe: TO-BE 내용
  - phaseIsStart: true이면 해당 행이 rowspan 시작 행

### format: "flow" — 원본이 박스+화살표로 순서대로 이어지는 프로세스 다이어그램인 경우
- div.proc-step 또는 박스+→ 화살표 구조
- 시간값(27h, 130h...)이 있고 병목/AI 강조가 있는 단계별 흐름
- 이 경우 steps 배열로 추출:
  - idx, title, hours, isBottleneck, isAI, isRemoved, detail, savedHours
- 수치: totalHours, bottleneckHours, savedHours, savedPct(%)

하나의 섹션에 테이블과 추가 카드(extraCards)가 함께 있을 수 있음.

## B. cards 섹션 (카드 나열형)

카드 섹션 찾기: 배경, 현황, 문제, 개선방안, 적용 범위, 변화, CHANGE 등 카드나 박스가 나열된 섹션
각 카드에서 반드시 추출:
- title: 카드 제목 (h3, h4 등)
- body: 카드 본문 설명 (p 태그 전체 — 원문 그대로, 절대 요약하지 마세요, 여러 문장 모두 포함)
- items: 해당 카드의 모든 bullet point (li 항목 전체 — 원문 그대로)
- tag: 태그/라벨 텍스트 (있으면)
- takeaway: 핵심 요약 한 줄 (있으면)

## C. tools 섹션 (도구/제품 카드 나열)

도구 섹션 찾기: 도구, tool, 제품, 플랫폼, AI 도구, 솔루션 등을 소개하는 카드 섹션
각 tool 카드에서 반드시 추출:
- name: 도구/제품명
- stage: 카테고리/포지션 레이블 (예: "AI Native UI 생성")
- position: 한 줄 설명
- subtabs: Figma/Figma Make처럼 동일 카드 내 탭이 있으면 탭별로 분리 (배열)
  - 각 subtab: { label, name, stage, position, features, strengths, weaknesses, scenes, value }
- features: 주요 기능 목록 (원문 그대로)
- strengths: 잘하는 것 목록 (원문 그대로)
- weaknesses: 아쉬운 점 목록 (원문 그대로)
- scenes: 대표 장면 목록 (원문 그대로)
- value: 핵심 가치/적합한 팀 설명 (원문 그대로)

## D. examples 섹션 (탭형 사용 예시)

예시 섹션 찾기: 사용 예시, 입문 예제, hands-on, 적용 방식, 사용법 등 탭으로 구성된 섹션
각 tab에서 반드시 추출:
- label: 탭 이름
- toolName: 도구 이름
- toolSub: 부제/버전 정보
- method: AI 적용 방식 (원문 전체 — 절대 요약 금지)
- accessSteps: 접속 경로 단계 (있으면, 원문 그대로)
- exampleTitle: 입문 예제 제목
- steps: 단계별 순서 (원문 그대로)
- prompt: 프롬프트 텍스트 (원문 그대로)
- output: 결과 설명 (원문 그대로)
- callout: 용어 정의나 주의사항 박스 내용 (있으면)

## E. timeline 섹션

일정, 로드맵, 마일스톤, 추진 계획 섹션
각 milestone: period(Q1 2026 등), title, items(세부 항목 전체)

## F. org 섹션

조직, R&R, 역할, 담당 섹션
각 team: role(역할명), name(팀/조직명), items(담당 업무 전체)

## G. webos-agenda 섹션 (링크가 있는 아젠다 카드 목록)

외부 링크가 있는 항목 목록 (사전 기술 검토, 컨셉 검증 등)
각 item: num(번호), title(제목), desc(설명), href(링크 URL), subitems(서브 항목 배열, 있으면)
groups가 있으면 그룹 분리: { groupLabel, groupTitle, items[] }

## 섹션 타입 (원본에 있는 것만 사용)
"hero" | "agenda" | "comparison" | "cards" | "tools" | "examples" | "kpi" | "timeline" | "org" | "discussion" | "webos-agenda"

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
      "format": "table",
      "secNum": "01", "title": "제목", "subtitle": "설명",
      "tableTitle": "① 섹션 내 테이블 블록 제목",
      "tableSub": "테이블 부제",
      "tableHeaders": ["구간", "단계", "구분", "AS-IS (기존)", "TO-BE (AI 도입 이후)"],
      "tableRows": [
        {"phase": "", "phaseClass": "", "phaseSub": "", "phaseRowspan": 0, "phaseIsStart": false, "num": "1", "label": "문제 정의", "asIs": "PM·기획 주도", "toBe": "AI와 함께 탐색형 정의"},
        {"phase": "Prompt to Design", "phaseClass": "phase-p2d", "phaseSub": "PRD → 디자인 초안", "phaseRowspan": 2, "phaseIsStart": true, "num": "4", "label": "와이어프레임", "asIs": "디자이너 수작업", "toBe": "AI 초안 생성"},
        {"phase": "Prompt to Design", "phaseClass": "phase-p2d", "phaseSub": "", "phaseRowspan": 0, "phaseIsStart": false, "num": "5", "label": "UI 디자인", "asIs": "픽셀 단위 제작", "toBe": "시스템 조합 + AI refinement"}
      ],
      "extraCards": [
        {"tag": "AS-IS", "title": "카드 제목", "items": ["항목1", "항목2"]}
      ],
      "extraBlocks": [
        {"title": "② 직렬→병렬 구조 변화", "subtitle": "설명", "before": "기획 → 디자인 → 개발", "after": "AI + PM + Designer + Dev\n동시 협업", "afterDesc": "설명 (원문 그대로)"}
      ]
    },
    {
      "id": "asis-flow", "type": "comparison",
      "format": "flow",
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
          {"idx": "02", "title": "AI 처리", "hours": "20h", "isAI": true, "savedHours": "110h", "detail": "AI 처리 내용"}
        ],
        "totalHours": "160h", "savedHours": "271h", "savedPct": "63%",
        "improvements": ["개선 효과 (원문)"],
        "takeaway": "핵심 요약"
      }
    },
    {
      "id": "cards-1", "type": "cards", "secNum": "02",
      "title": "섹션 제목", "subtitle": "설명",
      "cards": [
        {
          "tag": "CHANGE 01", "tagStyle": "brand",
          "title": "카드 제목",
          "body": "카드 본문 — 원문 전체 문장 (절대 요약 금지)",
          "items": ["bullet 항목 1 (원문)", "항목 2", "항목 3"],
          "takeaway": "핵심 요약"
        }
      ]
    },
    {
      "id": "tools-1", "type": "tools", "secNum": "02",
      "title": "대표 AI 디자인 도구", "subtitle": "설명",
      "callout": "용어 정의 박스 내용 (있으면, 원문 그대로)",
      "tools": [
        {
          "name": "Google Stitch",
          "stage": "AI Native UI 생성",
          "position": "AI 기반 UI 생성 및 프로토타이핑 도구",
          "features": ["기능 1 (원문)", "기능 2"],
          "strengths": ["강점 1 (원문)"],
          "weaknesses": ["약점 1 (원문)"],
          "scenes": ["대표 장면 1 (원문)"],
          "value": "이런 팀에 적합 — 원문 그대로"
        },
        {
          "name": "Figma",
          "subtabs": [
            {
              "label": "Figma",
              "name": "Figma",
              "stage": "디자인 플랫폼 + AI",
              "position": "설명",
              "features": ["기능 (원문)"],
              "strengths": ["강점 (원문)"],
              "weaknesses": ["약점 (원문)"],
              "scenes": ["장면 (원문)"],
              "value": "원문"
            },
            {
              "label": "Figma Make",
              "name": "Figma Make",
              "stage": "생성형 코드 AI",
              "position": "설명",
              "features": ["기능 (원문)"],
              "strengths": ["강점 (원문)"],
              "weaknesses": ["약점 (원문)"],
              "scenes": ["장면 (원문)"],
              "value": "원문"
            }
          ]
        }
      ]
    },
    {
      "id": "examples-1", "type": "examples", "secNum": "03",
      "title": "도구별 AI 적용 방식 & 대표 사용 예시", "subtitle": "설명",
      "callout": "용어 정의 박스 내용 (있으면, 원문 그대로)",
      "tabs": [
        {
          "label": "Google Stitch",
          "toolName": "Google Stitch",
          "toolSub": "Gemini 기반 · 텍스트/음성 → 멀티스크린 UI",
          "method": "AI 적용 방식 전체 원문 — 절대 요약 금지",
          "exampleTitle": "입문 예제 제목",
          "steps": ["1. 단계 (원문)", "2. 단계 (원문)"],
          "prompt": "프롬프트 텍스트 (원문 그대로)",
          "output": "결과 설명 (원문 그대로)"
        }
      ]
    },
    {
      "id": "webos", "type": "webos-agenda", "secNum": "04",
      "title": "WebOS UX 디자인 자동화 과제 사전 기술 검토",
      "subtitle": "설명 (원문 그대로)",
      "headerDesc": "헤더 추가 설명 (원문 그대로)",
      "groups": [
        {
          "groupLabel": "Part 1",
          "groupTitle": "사전 기술 검토",
          "items": [
            {"num": 1, "title": "항목 제목", "desc": "설명 (원문)", "href": "URL (있으면)", "subitems": []}
          ]
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

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const strippedHtml = stripStylesAndScripts(html)

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: EXTRACT_PROMPT(strippedHtml) }],
      temperature: 0.1,
      max_tokens: 16384,
      response_format: { type: 'json_object' },
    })

    const json = completion.choices[0]?.message?.content ?? '{}'

    // Return JSON + stripped source so the caller can pass it to generate as fallback
    const parsed = JSON.parse(json)
    const responsePayload = JSON.stringify({
      ...parsed,
      _sourceHtml: strippedHtml.slice(0, 80000),
    })

    return new Response(responsePayload, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
}
