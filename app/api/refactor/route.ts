import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { join } from 'path'

let DS_CSS = ''
try {
  DS_CSS = readFileSync(
    join(process.cwd(), 'src/design-system/report-design-system.css'),
    'utf-8'
  )
} catch {
  DS_CSS = '/* design system not found */'
}

const RESTRUCTURE_PROMPT = (html: string) => `당신은 사내 보고자료 HTML 전문가입니다.
아래 원본 HTML을 Report HTML Design System v1.2 기준으로 재구성하세요.

중요: 전체를 새로 만들지 말고, 현재 구조와 내용을 유지하면서 아래 기준으로 개선하세요.

## 디자인 규칙
- font-weight는 400/500/600/700만 사용한다. 800/900은 700으로 낮춘다.
- 강조색(#FD312E)은 KPI, 선택 상태, 핵심 태그에만 제한적으로 사용한다.
- 과한 그라데이션, 다색 아이콘, 장식적 요소는 제거한다.
- 카드는 얇은 라인, 18px radius, 약한 shadow만 사용한다.
- 섹션 배경은 화면 전체 너비를 채운다. 흰색과 #F7F8F9를 교차 사용한다.
- 콘텐츠 폭은 최대 1720px, 중앙 정렬한다.

## 문구 규칙
- 각 섹션은 하나의 핵심 메시지만 갖는다.
- 카드 제목과 본문이 같은 말을 반복하지 않는다.
- 숫자는 반드시 기준과 함께 표기한다 (예: 42h/월 기준).
- 확정 범위와 후속 검토 범위를 분리한다.
- "검토", "지원", "확산", "체계", "고도화" 같은 모호한 표현은 구체화한다.

## HTML 인터랙션 원칙
인터랙션은 발표 흐름을 돕는 경우에만 사용한다:
- As-Is / To-Be 전후 비교 → report-compare 또는 report-tabs 사용
- 핵심 요약 + 상세 근거 분리 → report-disclosure 사용
- 오늘 보고 / 후속 검토 / 제외 범위 → report-tabs 사용
- 단계별 설명 흐름 → report-reveal-group / report-reveal-item 사용
- 의미 없는 hover 효과, 자동 재생 애니메이션은 제거한다.
- JS는 classList.toggle 방식으로만 작성한다.

## 사용 가능한 CSS 클래스 (아래만 사용할 것)
\`\`\`css
${DS_CSS}
\`\`\`

## 개선 체크리스트
- 중복 CSS 제거
- 중복 JS 함수 정리
- font-weight 800/900 → 700으로 교체
- 섹션 배경이 전체 너비를 채우는지 확인
- 카드 제목과 본문 중복 제거
- 강조색 과다 사용 정리
- 직접 효과와 간접 효과 위계 조정
- 확정 범위와 후속 검토 범위 분리
- 네비게이션 active 상태 버그 확인
- HTML 인터랙션 적용 가능 지점 검토

## 원본 HTML
${html}

## 출력 지침
- 완성된 단일 HTML 파일만 출력하세요. 설명 텍스트는 절대 포함하지 마세요.
- <style> 태그에 위의 CSS 전체를 포함하세요.
- 필요한 JS는 <script> 태그에 최소한으로 작성하세요.
- 결과는 반드시 <!DOCTYPE html>로 시작하는 완전한 HTML이어야 합니다.`

export async function POST(req: NextRequest) {
  const { html }: { html: string } = await req.json()

  if (!html?.trim()) {
    return new Response(JSON.stringify({ error: '입력 HTML이 없습니다.' }), { status: 400 })
  }

  if (html.length > 200_000) {
    return new Response(JSON.stringify({ error: 'HTML이 너무 큽니다. 200,000자 이하로 입력하세요.' }), { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }), { status: 500 })
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: RESTRUCTURE_PROMPT(html) }],
    temperature: 0.3,
    max_tokens: 16000,
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
