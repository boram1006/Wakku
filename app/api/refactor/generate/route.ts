import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const HTML_EXAMPLES = `
## 컴포넌트 예시 — 이 클래스와 구조를 그대로 사용하라

### nav
\`\`\`html
<nav class="nav">
  <div class="nav-inner">
    <div class="brand">
      <span class="dot"></span>
      <span class="name">조직명</span>
      <span class="sep">/</span>
      <span class="sub">과제명</span>
    </div>
    <div class="nav-toc" id="navToc">
      <a href="#agenda">금일보고</a>
      <a href="#hero">과제개요</a>
    </div>
  </div>
</nav>
\`\`\`

### hero (과제 개요)
\`\`\`html
<header class="hero" id="hero">
  <div class="hero-inner">
    <span class="eyebrow"><span class="d"></span>조직명 · 2026</span>
    <h1>과제 제목<br><em>강조 텍스트</em></h1>
    <p class="lede">과제 배경 한 단락. 핵심 내용을 2~3문장으로.</p>
    <div class="hero-meta">
      <span>대상 조직<b>팀명</b></span>
      <span>보고일<b>'26. 06</b></span>
    </div>
    <div class="kpi-ribbon">
      <div class="kpi">
        <div class="label">지표 이름</div>
        <div class="value">54.5<small>h 절감</small></div>
        <div class="sub">116h → 61.5h</div>
      </div>
      <div class="kpi">
        <div class="label">절감 효과</div>
        <div class="value red">47<small>%</small></div>
        <div class="sub">개선 대상 업무 기준</div>
      </div>
      <div class="kpi">
        <div class="label">구성 Agent</div>
        <div class="value">3<small>개</small></div>
        <div class="sub">전체 Agent 구조</div>
      </div>
      <div class="kpi">
        <div class="label">완료 목표</div>
        <div class="value">'26.08<small>말</small></div>
        <div class="sub">MVP 구현 기준</div>
      </div>
    </div>
  </div>
</header>
\`\`\`

### agenda (금일 보고 범위)
\`\`\`html
<section class="block agenda-section" id="agenda" style="background:#F7F8F9;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>보고서 전체 제목</div>
      <h2>금일 보고 범위</h2>
      <p>설명 텍스트.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:72px;">
      <div class="card flat" style="padding:50px 38px;border-left:5px solid var(--color-primary);background:linear-gradient(180deg,#fff 0%,rgba(253,49,46,.04) 100%);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 class="h-bar" style="margin:0;">주요 안건</h3>
          <span class="tag tag-brand">오늘 보고</span>
        </div>
        <ul class="body">
          <li>항목 1</li>
          <li>항목 2</li>
        </ul>
      </div>
      <div class="card flat" style="padding:50px 38px;border-left:5px solid var(--color-neutral-300);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 class="h-bar" style="margin:0;">후속 보고 예정</h3>
          <span class="tag tag-neutral">별도 보고</span>
        </div>
        <ul class="body"><li>항목 1</li></ul>
      </div>
    </div>
    <div class="meta-row" style="margin-top:72px;">
      <div><div class="meta-label">보고일자</div><div class="meta-value">'26. 06</div></div>
      <div><div class="meta-label">참여 조직</div><div class="meta-value">팀명</div></div>
      <div><div class="meta-label">보고 범위</div><div class="meta-value">과제 현황 및 데모</div></div>
    </div>
  </div>
</section>
\`\`\`

### comparison (As-Is / To-Be 비교) — 반드시 proc-flow 다이어그램 포함
\`\`\`html
<section class="block" id="asis" style="background:#F7F8F9;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>02 · 현재 분석</div>
      <h2>As-Is / To-Be 비교</h2>
      <p>설명.</p>
    </div>

    <!-- 토글 버튼 -->
    <div class="cmp-bar">
      <button class="cmp-btn is-active" onclick="cmpSwitch(event,'cmp-asis','as-is')">As-Is · 현재</button>
      <button class="cmp-btn" onclick="cmpSwitch(event,'cmp-asis','to-be')">To-Be · 개선</button>
    </div>

    <!-- As-Is 패널: 프로세스 흐름 다이어그램 -->
    <div class="cmp-panel" id="cmp-asis-as-is">
      <h3 class="h-bar">현재 업무 흐름</h3>
      <!-- proc-flow: 박스 + 화살표 순서로 반복. 병목은 is-bottleneck -->
      <div class="proc-flow">
        <div class="proc-step">
          <div class="proc-idx">01</div>
          <div class="proc-title">요구사항 수령</div>
          <div class="proc-detail">설명</div>
          <div class="proc-hours">27h</div>
        </div>
        <div class="proc-arrow">→</div>
        <div class="proc-step is-bottleneck">
          <span class="proc-badge problem">병목</span>
          <div class="proc-idx">02</div>
          <div class="proc-title">GUI 컨셉 디자인</div>
          <div class="proc-detail">순차 작업으로 리드타임 증가</div>
          <div class="proc-hours">130h</div>
        </div>
        <div class="proc-arrow">→</div>
        <div class="proc-step is-bottleneck">
          <span class="proc-badge problem">병목</span>
          <div class="proc-idx">03</div>
          <div class="proc-title">UI 설계 및 리뷰</div>
          <div class="proc-detail">반복 수정 다수</div>
          <div class="proc-hours">160h</div>
        </div>
        <div class="proc-arrow">→</div>
        <div class="proc-step">
          <div class="proc-idx">04</div>
          <div class="proc-title">배포</div>
          <div class="proc-hours">17.5h</div>
        </div>
      </div>
      <!-- 수치 요약 바 -->
      <div class="proc-summary">
        <div class="proc-summary-item">
          <div class="proc-summary-label">현재 총 업무량</div>
          <div class="proc-summary-value">431h</div>
        </div>
        <div class="proc-summary-sep"></div>
        <div class="proc-summary-item">
          <div class="proc-summary-label">병목 구간 합산</div>
          <div class="proc-summary-value">290h</div>
        </div>
      </div>
      <!-- 문제점 + 핵심 요약 -->
      <div style="margin-top:24px;">
        <ul class="body">
          <li><em>문제점 1</em> — 구체적 설명</li>
          <li>문제점 2</li>
        </ul>
        <div class="takeaway"><b>핵심 문제:</b> 요약 한 줄.</div>
      </div>
    </div>

    <!-- To-Be 패널: AI·제거 단계 시각화 -->
    <div class="cmp-panel is-hidden" id="cmp-asis-to-be">
      <h3 class="h-bar">개선된 업무 흐름</h3>
      <!-- is-ai: AI 처리 단계, is-removed: 제거된 단계, proc-save: 절감 시간 -->
      <div class="proc-flow">
        <div class="proc-step">
          <div class="proc-idx">01</div>
          <div class="proc-title">요구사항 수령</div>
          <div class="proc-hours">27h</div>
        </div>
        <div class="proc-arrow">→</div>
        <div class="proc-step is-ai">
          <span class="proc-badge ai">AI</span>
          <div class="proc-idx">02</div>
          <div class="proc-title">AI Draft 생성</div>
          <div class="proc-detail">병렬 처리</div>
          <div class="proc-hours">20h</div>
          <div class="proc-save">-110h</div>
        </div>
        <div class="proc-arrow">→</div>
        <div class="proc-step">
          <div class="proc-idx">03</div>
          <div class="proc-title">검토 및 확정</div>
          <div class="proc-hours">30h</div>
          <div class="proc-save">-130h</div>
        </div>
        <div class="proc-arrow">→</div>
        <div class="proc-step">
          <div class="proc-idx">04</div>
          <div class="proc-title">배포</div>
          <div class="proc-hours">17.5h</div>
        </div>
      </div>
      <!-- 절감 수치 요약 -->
      <div class="proc-summary">
        <div class="proc-summary-item">
          <div class="proc-summary-label">개선 후 업무량</div>
          <div class="proc-summary-value">160h</div>
        </div>
        <div class="proc-summary-sep"></div>
        <div class="proc-summary-item">
          <div class="proc-summary-label">절감량</div>
          <div class="proc-summary-value saved">271h (−63%)</div>
        </div>
      </div>
      <div style="margin-top:24px;">
        <ul class="body">
          <li><em>개선 효과 1</em> — 구체적 설명</li>
          <li>개선 효과 2</li>
        </ul>
        <div class="takeaway"><b>핵심 개선:</b> 요약 한 줄.</div>
      </div>
    </div>
  </div>
</section>
\`\`\`

### cards (카드 나열)
\`\`\`html
<section class="block" id="scope" style="background:#fff;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>03 · 개요</div>
      <h2>섹션 제목</h2>
      <p>설명.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      <div class="card flat" style="padding:28px 24px;display:flex;flex-direction:column;gap:12px;">
        <span class="tag tag-brand">태그</span>
        <h3 class="h-bar">카드 제목</h3>
        <ul class="body"><li>항목 1</li><li>항목 2</li></ul>
        <div class="takeaway">핵심 요약</div>
      </div>
    </div>
  </div>
</section>
\`\`\`

### timeline (일정)
\`\`\`html
<section class="block" id="schedule" style="background:#fff;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>05 · 추진 일정</div>
      <h2>로드맵</h2>
    </div>
    <div class="timeline-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="timeline-cell">
        <div class="period">Q1 2026</div>
        <h4>마일스톤 1</h4>
        <ul class="body" style="font-size:13px;"><li>세부 항목 1</li></ul>
      </div>
      <div class="timeline-cell">
        <div class="period">Q2 2026</div>
        <h4>마일스톤 2</h4>
        <ul class="body" style="font-size:13px;"><li>세부 항목 1</li></ul>
      </div>
    </div>
  </div>
</section>
\`\`\`

### org (조직/R&R)
\`\`\`html
<section class="block" id="org-rnr" style="background:#F7F8F9;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>06 · 조직 및 R&R</div>
      <h2>추진 조직</h2>
    </div>
    <div class="rnr-grid">
      <div class="rnr-card">
        <div class="role">LEAD</div>
        <h4>팀명</h4>
        <ul class="body"><li>담당 업무 1</li></ul>
      </div>
    </div>
  </div>
</section>
\`\`\`

### discussion (추가 논의)
\`\`\`html
<section class="block" id="discussion" style="background:#fff;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>07 · 추가 논의</div>
      <h2>논의 사항</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;">
      <div class="card flat" style="padding:28px 24px;">
        <span class="tag tag-warning" style="margin-bottom:14px;">확인 필요</span>
        <h3 class="h-bar">논의 주제</h3>
        <ul class="body"><li>논의 항목 1</li></ul>
      </div>
    </div>
  </div>
</section>
\`\`\`

### 필수 JS (</body> 직전에 반드시 포함)
\`\`\`html
<script>
// 비교 토글 — id 규칙: cmp-[group]-[as-is|to-be]
function cmpSwitch(e, group, target) {
  const wrap = e.target.closest('.wrap');
  wrap.querySelectorAll('.cmp-btn').forEach(b => b.classList.remove('is-active'));
  e.target.classList.add('is-active');
  wrap.querySelectorAll('.cmp-panel').forEach(p => {
    p.classList.toggle('is-hidden', p.id !== group + '-' + target);
  });
}
// Nav 활성 상태
const navLinks = document.querySelectorAll('.nav-toc a');
const sections = document.querySelectorAll('section[id], header[id]');
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });
sections.forEach(s => io.observe(s));
</script>
\`\`\``

const GENERATE_PROMPT = (jsonContent: string) => `당신은 사내 보고자료 HTML 전문가입니다.
아래 JSON 내용을 바탕으로 완성된 HTML 보고서를 생성하세요.

## 필수 규칙
1. <head> 안에 반드시 포함: <link rel="stylesheet" href="/wakku-ds.css">
2. <style> 태그에 CSS를 직접 쓰지 마세요. 디자인 시스템이 처리합니다.
3. 아래 컴포넌트 예시의 클래스와 구조를 정확히 따르세요.
4. comparison 섹션이 있으면 cmp-bar + cmp-panel 토글 + proc-flow 다이어그램을 반드시 포함하세요.
5. comparison의 proc-flow는 asis.steps, tobe.steps의 모든 단계를 박스+화살표로 표현하세요.
6. 모든 섹션은 <section class="block"> 안에, 내용은 <div class="wrap"> 안에.
7. 섹션 배경은 #F7F8F9와 #fff를 교차 사용하세요.
8. 필수 JS (nav 활성화 + 비교 토글)를 </body> 직전에 포함하세요.
9. ⚠️ JSON에 없는 섹션을 임의로 추가하지 마세요. JSON의 sections 배열에 있는 것만 생성하세요.

${HTML_EXAMPLES}

## 생성할 보고서 내용 (JSON)
${jsonContent}

## 출력 지침
- 완성된 단일 HTML 파일만 출력하세요. 설명 텍스트 없이.
- <!DOCTYPE html>로 시작하는 완전한 HTML.
- <html lang="ko">에서 시작해서 </html>로 끝나야 합니다.`

export async function POST(req: NextRequest) {
  const body = await req.json()
  const jsonContent: string = typeof body.content === 'string'
    ? body.content
    : JSON.stringify(body.content, null, 2)

  if (!jsonContent || jsonContent === '{}') {
    return new Response(JSON.stringify({ error: '내용이 없습니다.' }), { status: 400 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }), { status: 500 })
  }

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: GENERATE_PROMPT(jsonContent) }],
    temperature: 0.2,
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
