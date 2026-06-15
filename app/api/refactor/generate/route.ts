import { NextRequest } from 'next/server'
import OpenAI from 'openai'

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
      <div class="card flat" style="padding:28px 24px;display:flex;flex-direction:column;gap:12px;align-items:flex-start;">
        <span class="tag tag-brand">태그</span>
        <h3 class="h-bar">카드 제목</h3>
        <ul class="body"><li>항목 1</li><li>항목 2</li></ul>
        <div class="takeaway">핵심 요약</div>
      </div>
    </div>
  </div>
</section>
\`\`\`

### timeline (일정 · 로드맵)
\`\`\`html
<section class="block" id="schedule" style="background:#fff;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>05 · 추진 일정</div>
      <h2>로드맵</h2>
      <p>추진 일정 설명.</p>
    </div>
    <!-- DS 타임라인 컴포넌트: wk-timeline -->
    <div class="wk-timeline">
      <!-- 월 헤더: wk-tl-months + wk-tl-label-col + wk-tl-month-grid(grid-template-columns 월 수만큼 반복) -->
      <div class="wk-tl-months" style="display:flex;">
        <div class="wk-tl-label-col"></div>
        <div class="wk-tl-month-grid" style="flex:1;display:grid;grid-template-columns:repeat(6,1fr);">
          <div class="wk-tl-month">'26 <b>4월</b></div>
          <div class="wk-tl-month">'26 <b>5월</b></div>
          <div class="wk-tl-month">'26 <b>6월</b></div>
          <div class="wk-tl-month">'26 <b>7월</b></div>
          <div class="wk-tl-month">'26 <b>8월</b></div>
          <div class="wk-tl-month">'26 <b>9월</b></div>
        </div>
      </div>
      <!-- 수영레인: 각 업무/단계 1개씩 -->
      <div class="wk-tl-lane">
        <div class="wk-tl-lane-label">
          0 · 현황 진단<small>4월 중순 ~ 5월 초</small>
        </div>
        <div class="wk-tl-track" style="position:relative;">
          <!-- left/width는 전체 기간 대비 % -->
          <div class="wk-tl-bar neutral" style="left:8%;width:12%;">현업 니즈 청취</div>
          <div class="wk-tl-bar primary" style="left:22%;width:10%;">워크플로우 분석</div>
        </div>
      </div>
      <div class="wk-tl-lane">
        <div class="wk-tl-lane-label">
          1 · Agent 설계<small>5월 ~ 6월</small>
        </div>
        <div class="wk-tl-track" style="position:relative;">
          <div class="wk-tl-bar light" style="left:33%;width:16%;">Agent 구조 설계</div>
        </div>
      </div>
      <!-- 마일스톤 행 -->
      <div class="wk-tl-milestones">
        <div class="wk-tl-milestone" style="left:20%;">
          <span class="pin">현황 진단</span>
          <span class="t">4월 중순</span>
        </div>
        <div class="wk-tl-milestone" style="left:65%;">
          <span class="pin">MVP 구현</span>
          <span class="t">8월 말</span>
        </div>
      </div>
    </div>
  </div>
</section>
\`\`\`

### process-matrix (업무 분해 · 30개 이상 프로세스)
\`\`\`html
<section class="block" id="process-matrix" style="background:#F7F8F9;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>02 · 업무 프로세스 분석</div>
      <h2>현행 업무 프로세스 분해</h2>
      <p>전체 업무 흐름을 Process Chain × 역할별로 분해합니다.</p>
    </div>
    <div class="wk-matrix">
      <div class="wk-matrix-inner" style="grid-template-columns: 100px 80px repeat(6, minmax(160px,1fr));">
        <!-- 체인 헤더 행 -->
        <div class="wk-matrix-chain label">Process<br>Chain</div>
        <div class="wk-matrix-chain label">역할</div>
        <div class="wk-matrix-chain">업무의뢰</div>
        <div class="wk-matrix-chain">UX 기획</div>
        <div class="wk-matrix-chain">GUI 디자인</div>
        <div class="wk-matrix-chain">프로토타이핑</div>
        <div class="wk-matrix-chain">검토·승인</div>
        <div class="wk-matrix-chain">양산 핸드오프</div>

        <!-- 역할 A 행 -->
        <div class="wk-matrix-rl" rowspan="1">기획</div>
        <div class="wk-matrix-rl">PM</div>
        <div class="wk-matrix-cell">
          <span class="wk-act focus">요구사항 수령</span>
          <span class="wk-act">검토</span>
          <span class="wk-act">수락</span>
        </div>
        <div class="wk-matrix-cell">
          <span class="wk-act">UX 방향 설정</span>
          <span class="wk-act focus">시나리오 작성</span>
        </div>
        <div class="wk-matrix-cell"></div>
        <div class="wk-matrix-cell"></div>
        <div class="wk-matrix-cell">
          <span class="wk-act focus">리뷰</span>
        </div>
        <div class="wk-matrix-cell"></div>

        <!-- 역할 B 행 -->
        <div class="wk-matrix-rl">디자이너</div>
        <div class="wk-matrix-rl"></div>
        <div class="wk-matrix-cell"></div>
        <div class="wk-matrix-cell">
          <span class="wk-act">와이어프레임</span>
        </div>
        <div class="wk-matrix-cell">
          <span class="wk-act focus">GUI 시안</span>
          <span class="wk-act ai">AI 초안 생성</span>
          <span class="wk-act">컴포넌트 조립</span>
        </div>
        <div class="wk-matrix-cell">
          <span class="wk-act">Figma 프로토</span>
        </div>
        <div class="wk-matrix-cell">
          <span class="wk-act">수정 반영</span>
        </div>
        <div class="wk-matrix-cell">
          <span class="wk-act focus">핸드오프 파일</span>
        </div>
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

### tools (도구 카드 나열) — subtabs가 있는 카드도 지원
\`\`\`html
<section class="block" id="tools-1" style="background:#fff;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>02 · 대표 AI 디자인 도구</div>
      <h2>대표 AI 디자인 도구</h2>
      <p>설명 텍스트.</p>
    </div>
    <!-- 용어 정의 callout (있으면) -->
    <div class="wk-callout" style="margin-bottom:28px;">
      <div class="wk-callout-inner">
        <div class="wk-callout-label">용어 정의</div>
        <p class="body">용어 설명 내용</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;">

      <!-- 일반 도구 카드 -->
      <div class="card flat" style="padding:28px 24px;display:flex;flex-direction:column;gap:0;align-items:flex-start;">
        <span class="tag tag-brand" style="margin-bottom:12px;">AI Native UI 생성</span>
        <h3 class="h-bar" style="margin:0 0 10px;">Google Stitch</h3>
        <p class="body" style="margin:0 0 16px;color:var(--color-primary);font-weight:600;">AI 기반 UI 생성 및 프로토타이핑 도구</p>
        <details open style="margin:0;border-top:1px solid var(--border-subtle);">
          <summary style="list-style:none;cursor:pointer;padding:12px 0;font:700 12px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">주요 기능</summary>
          <ul class="body" style="margin:4px 0 12px;"><li>기능 1</li><li>기능 2</li></ul>
        </details>
        <details style="margin:0;border-top:1px solid var(--border-subtle);">
          <summary style="list-style:none;cursor:pointer;padding:12px 0;font:700 12px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">잘하는 것</summary>
          <ul class="body" style="margin:4px 0 12px;"><li>강점 1</li></ul>
        </details>
        <details style="margin:0;border-top:1px solid var(--border-subtle);">
          <summary style="list-style:none;cursor:pointer;padding:12px 0;font:700 12px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">아쉬운 점</summary>
          <ul class="body" style="margin:4px 0 12px;"><li>약점 1</li></ul>
        </details>
        <details style="margin:0;border-top:1px solid var(--border-subtle);">
          <summary style="list-style:none;cursor:pointer;padding:12px 0;font:700 12px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">대표 장면</summary>
          <ul class="body" style="margin:4px 0 8px;"><li>장면 1</li></ul>
          <div class="takeaway" style="margin-top:8px;"><b>이런 팀에 적합</b> · 설명</div>
        </details>
      </div>

      <!-- subtabs가 있는 도구 카드 (예: Figma / Figma Make) -->
      <div class="card flat" style="padding:0;overflow:hidden;">
        <!-- 서브탭 헤더 -->
        <div style="display:flex;border-bottom:1px solid var(--border-subtle);background:var(--color-neutral-10);" role="tablist" data-subtab-group="tool-figma">
          <button type="button" class="tool-subtab is-active" data-target="tool-figma-0" style="flex:1;appearance:none;border:0;background:transparent;padding:14px 16px;font:700 13px/1 var(--font-sans);color:var(--color-neutral-400);cursor:pointer;border-bottom:3px solid transparent;transition:color .15s,border-color .15s;">Figma</button>
          <button type="button" class="tool-subtab" data-target="tool-figma-1" style="flex:1;appearance:none;border:0;background:transparent;padding:14px 16px;font:700 13px/1 var(--font-sans);color:var(--color-neutral-400);cursor:pointer;border-bottom:3px solid transparent;transition:color .15s,border-color .15s;">Figma Make</button>
        </div>
        <div id="tool-figma-0" class="tool-sub-panel" style="display:flex;flex-direction:column;align-items:flex-start;padding:24px;">
          <span class="tag tag-brand" style="margin-bottom:12px;">디자인 플랫폼 + AI</span>
          <h3 class="h-bar" style="margin:0 0 10px;">Figma</h3>
          <p class="body" style="margin:0 0 16px;color:var(--color-primary);font-weight:600;">Figma 포지션 설명</p>
          <details open style="border-top:1px solid var(--border-subtle);">
            <summary style="list-style:none;cursor:pointer;padding:12px 0;font:700 12px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">주요 기능</summary>
            <ul class="body" style="margin:4px 0 12px;"><li>기능 1</li></ul>
          </details>
        </div>
        <div id="tool-figma-1" class="tool-sub-panel" style="display:none;flex-direction:column;align-items:flex-start;padding:24px;">
          <span class="tag tag-neutral" style="margin-bottom:12px;">생성형 코드 AI</span>
          <h3 class="h-bar" style="margin:0 0 10px;">Figma Make</h3>
          <p class="body" style="margin:0 0 16px;color:var(--color-primary);font-weight:600;">Figma Make 포지션 설명</p>
          <details open style="border-top:1px solid var(--border-subtle);">
            <summary style="list-style:none;cursor:pointer;padding:12px 0;font:700 12px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">주요 기능</summary>
            <ul class="body" style="margin:4px 0 12px;"><li>기능 1</li></ul>
          </details>
        </div>
      </div>

    </div>
  </div>
</section>
\`\`\`

### examples (탭형 사용 예시)
\`\`\`html
<section class="block" id="examples-1" style="background:#F7F8F9;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>03 · 도구별 AI 적용 방식 &amp; 대표 사용 예시</div>
      <h2>도구별 AI 적용 방식 &amp; 대표 사용 예시</h2>
      <p>설명 텍스트.</p>
    </div>
    <!-- 용어 정의 callout (있으면) -->
    <div class="wk-callout" style="margin-bottom:28px;">
      <div class="wk-callout-inner">
        <div class="wk-callout-label">용어 정의</div>
        <p class="body">용어 정의 내용</p>
      </div>
    </div>
    <!-- DS 탭 컴포넌트 -->
    <div class="wk-tabs" data-tabgroup="examples">
      <!-- 탭 헤더 -->
      <div class="wk-tab-bar" role="tablist">
        <button type="button" class="wk-tab-btn is-active" data-target="ex-panel-0">
          <span class="wk-tab-icon">S</span>Google Stitch
        </button>
        <button type="button" class="wk-tab-btn" data-target="ex-panel-1">
          <span class="wk-tab-icon">F</span>Figma
        </button>
      </div>
      <!-- 탭 패널 0 -->
      <div id="ex-panel-0" class="wk-tab-panel is-active">
        <div class="wk-tab-hero">
          <div class="wk-tab-hero-icon">S</div>
          <div>
            <div class="wk-tab-hero-name">Google Stitch</div>
            <div class="wk-tab-hero-sub">Gemini 기반 · 텍스트/음성 → 멀티스크린 UI</div>
          </div>
        </div>
        <div class="wk-tab-body">
          <div>
            <p class="wk-tab-label">AI 적용 방식</p>
            <p class="body" style="list-style:none;padding:0;">AI 적용 방식 원문 전체. 생략 금지.</p>
          </div>
          <div>
            <p class="wk-tab-label">가장 빈번한 입문 예제</p>
            <ol style="padding-left:20px;margin:0 0 16px;">
              <li class="body" style="margin-bottom:8px;">단계 1</li>
              <li class="body" style="margin-bottom:8px;">단계 2</li>
            </ol>
            <!-- 프롬프트 블록 -->
            <div style="background:#1a1a1a;color:#e5e5e5;border-radius:10px;padding:16px 20px;font:400 14px/1.6 'SF Mono','Consolas','Monaco',monospace;margin-bottom:10px;white-space:pre-wrap;word-break:break-word;">
              <span style="color:var(--color-primary);font-weight:700;margin-right:8px;">프롬프트</span>프롬프트 텍스트 전체
            </div>
            <!-- 결과 블록 -->
            <div class="card flat" style="border-left:3px solid var(--color-primary);padding:14px 18px;">
              <p class="body" style="margin:0;">▷ 결과: 결과 설명 전체</p>
            </div>
          </div>
        </div>
      </div>
      <!-- 탭 패널 1 -->
      <div id="ex-panel-1" class="wk-tab-panel">
        <div class="wk-tab-hero">
          <div class="wk-tab-hero-icon">F</div>
          <div>
            <div class="wk-tab-hero-name">Figma</div>
            <div class="wk-tab-hero-sub">설명 한 줄</div>
          </div>
        </div>
        <div class="wk-tab-body">
          <!-- 동일 구조 반복 -->
        </div>
      </div>
    </div>
  </div>
</section>
\`\`\`

### webos-agenda (링크 카드 목록)
\`\`\`html
<section class="block" id="webos" style="background:#F7F8F9;">
  <div class="wrap">
    <div class="sec-head">
      <div class="sec-num"><span class="ln"></span>04 · WebOS UX 기술 검토</div>
      <h2>WebOS UX 디자인 자동화 과제<br>사전 기술 검토</h2>
      <p>설명 텍스트.</p>
    </div>
    <!-- 2-컬럼 그룹 -->
    <div style="display:grid;grid-template-columns:1fr 1px 1fr;column-gap:24px;align-items:start;">
      <!-- 좌: Part 1 -->
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <span style="width:8px;height:8px;border-radius:999px;background:var(--color-primary);box-shadow:0 0 0 4px rgba(253,49,46,.14);flex-shrink:0;"></span>
          <span class="tag tag-brand tag-md">Part 1</span>
          <span style="font:600 15px/1 var(--font-sans);color:var(--color-neutral-900);margin-left:4px;">사전 기술 검토</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <a href="#" class="wk-link-card">
            <div class="wk-link-num">1</div>
            <div class="wk-link-card-body">
              <div class="wk-link-card-title">항목 제목</div>
              <div class="wk-link-card-desc">항목 설명</div>
            </div>
            <div class="wk-link-go">바로가기 ↗</div>
          </a>
        </div>
      </div>
      <!-- 구분선 -->
      <div style="background:var(--border-subtle);align-self:stretch;"></div>
      <!-- 우: Part 2 -->
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <span style="width:8px;height:8px;border-radius:999px;background:var(--color-primary);box-shadow:0 0 0 4px rgba(253,49,46,.14);flex-shrink:0;"></span>
          <span class="tag tag-brand tag-md">Part 2</span>
          <span style="font:600 15px/1 var(--font-sans);color:var(--color-neutral-900);margin-left:4px;">컨셉 검증 Prototype</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <a href="#" class="wk-link-card" style="align-items:flex-start;">
            <div class="wk-link-num">5</div>
            <div class="wk-link-card-body">
              <div class="wk-link-card-title">컨셉 검증 및 1차 Prototype</div>
              <div class="wk-link-card-desc">설명</div>
              <div class="wk-link-card-sub">
                <ul class="body"><li>서브 항목 1</li></ul>
              </div>
            </div>
            <div class="wk-link-go">바로가기 ↗</div>
          </a>
        </div>
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

// examples 탭 — DS .wk-tabs 컴포넌트
document.querySelectorAll('.wk-tabs[data-tabgroup]').forEach(function(container) {
  var btns = container.querySelectorAll('.wk-tab-btn');
  var panels = container.querySelectorAll('.wk-tab-panel');
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var targetId = btn.getAttribute('data-target');
      btns.forEach(function(b) { b.classList.toggle('is-active', b === btn); });
      panels.forEach(function(p) { p.classList.toggle('is-active', p.id === targetId); });
    });
  });
});

// tool subtabs (data-subtab-group 속성으로 그룹 지정)
document.querySelectorAll('[data-subtab-group]').forEach(function(group) {
  var card = group.closest('div[style]') || group.parentElement;
  var subtabs = group.querySelectorAll('.tool-subtab');
  subtabs.forEach(function(st) {
    st.addEventListener('click', function() {
      var targetId = st.getAttribute('data-target');
      subtabs.forEach(function(s) {
        var active = s === st;
        s.classList.toggle('is-active', active);
        s.style.background = active ? '#fff' : 'transparent';
        s.style.color = active ? 'var(--color-primary)' : 'var(--color-neutral-500)';
        s.style.boxShadow = active ? '0 1px 2px rgba(26,26,34,.06)' : 'none';
      });
      card.querySelectorAll('.tool-sub-panel').forEach(function(p) {
        p.style.display = p.id === targetId ? 'block' : 'none';
      });
    });
  });
  // 초기 활성 탭 스타일 적용
  var activeTab = group.querySelector('.tool-subtab.is-active');
  if (activeTab) {
    activeTab.style.background = '#fff';
    activeTab.style.color = 'var(--color-primary)';
    activeTab.style.boxShadow = '0 1px 2px rgba(26,26,34,.06)';
  }
});
</script>
\`\`\``

const GENERATE_PROMPT = (jsonContent: string, sourceHtml?: string) => `당신은 사내 보고자료 HTML 전문가입니다.
아래 JSON 내용을 바탕으로 완성된 HTML 보고서를 생성하세요.

## 절대 규칙 (위반 시 틀린 답)
- ❌ <style> 태그 절대 금지. CSS 한 줄도 쓰지 마세요. wakku-ds.css가 모두 처리합니다.
- ❌ inline font: 절대 금지. 텍스트 크기·색상·font-weight를 inline style로 지정하지 마세요.
- ❌ .tag는 반드시 <span>으로, <div>나 <a>에 tag 클래스 금지. display:block/width:100% 금지.
- ❌ flex-direction:column 컨테이너에는 반드시 align-items:flex-start 포함 (태그 full-width 방지).
- ✅ <head>에 반드시: <link rel="stylesheet" href="/wakku-ds.css">
- ✅ 모든 섹션: <section class="block"> + <div class="wrap">
- ✅ 섹션 배경: #F7F8F9 / #fff 교차
- ✅ </body> 직전에 필수 JS 포함
- ❌ 링크 카드에 width:56px height:56px 같은 큰 아이콘 inline style 금지 → .wk-link-num 사용
- ✅ callout(용어정의/주의사항)은 반드시 .wk-callout 클래스 사용
- ✅ 일정/로드맵은 .wk-timeline 클래스 사용
- ✅ 업무 분해(30+)는 .wk-matrix 클래스 사용
- ✅ 링크 카드는 .wk-link-card + .wk-link-num + .wk-link-card-body 클래스 사용

## type:"table" 섹션 — 행·열 표 데이터
type이 "table"인 섹션은 반드시 wk-table-block + wk-table로 렌더링합니다.
- headerGroups가 있으면 → 각 그룹을 <tr>로 렌더링. colspan이 있는 셀은 <th colspan="N"> 사용.
- headers가 있으면(단일 행) → <thead><tr>에 <th> 목록
- rows 배열 → <tbody>의 <tr> 목록. rows[].label → <th scope="row">, rows[].values → <td> 목록
- note가 있으면 표 아래 <p class="t-caption"> 로 표시

\`\`\`html
<div class="wk-table-block">
  <div class="tb-head">
    <div class="tb-title">PRISM 활용 모델</div>
  </div>
  <div class="wk-table-wrap">
    <table class="wk-table">
      <thead>
        <tr>
          <th rowspan="2">특성</th>
          <th colspan="2" style="text-align:center">PRISM 1.0</th>
          <th colspan="2" style="text-align:center">PRISM 2.0 목표</th>
        </tr>
        <tr>
          <th>4.1-mini β</th>
          <th>4.1-mini 정식</th>
          <th>5-mini</th>
          <th>5.2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">분류 정확도</th>
          <td>65%</td>
          <td>94%</td>
          <td>96% ↑</td>
          <td>31%</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
\`\`\`

## cards 섹션 — subCard (카드 안 미니카드)
cards[].subCard가 있으면 카드 본문 안에 인라인 박스로 렌더링:
- subCard.title + subCard.items → .card.flat 스타일의 내부 박스
- subCard.left / subCard.right → 좌우 2열 비교 박스 (cmp-cols 구조 활용)

\`\`\`html
<!-- subCard 좌우 비교형 -->
<div style="margin-top:16px;background:var(--color-neutral-10);border:1px solid var(--color-neutral-100);border-radius:12px;padding:16px 20px;">
  <div style="font:600 13px/1 var(--font-kr);color:var(--color-neutral-700);margin-bottom:12px;letter-spacing:var(--tracking-tight);">1회 호출 내 상충하는 Task 공존의 딜레마</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div style="background:#fff;border:1px solid var(--color-neutral-100);border-radius:8px;padding:12px 14px;">
      <div style="font:600 12px/1 var(--font-sans);color:var(--color-neutral-500);margin-bottom:8px;">낮은 창의성 필요</div>
      <ul class="body"><li>카테고리 분류, 인용문, 브랜드 비율</li></ul>
    </div>
    <div style="background:#fff;border:1px solid var(--color-neutral-100);border-radius:8px;padding:12px 14px;">
      <div style="font:600 12px/1 var(--font-sans);color:var(--color-neutral-500);margin-bottom:8px;">높은 창의성 필요</div>
      <ul class="body"><li>마케팅 메시지 추출, 요약, 감성분석</li></ul>
    </div>
  </div>
</div>
\`\`\`

## ⚠️ 테이블 vs 플로우 — 반드시 구분하세요
- comparison.format === "table" → 아래 wk-table 템플릿으로 렌더링. proc-flow 절대 사용 금지.
- comparison.format === "flow" → 아래 proc-flow 템플릿으로 렌더링. wk-table 절대 사용 금지.

## wk-table 테이블 — format:"table"인 경우
tableRows 배열을 순서대로 <tr>로 렌더링합니다.
- phaseIsStart:true → <td class="phase-cell phase-p2d" rowspan="N"> 셀 포함
- phaseIsStart:false이고 phase가 있으면 → phase 셀 생략 (rowspan으로 이미 병합됨)
- phase:""이면 → <td class="phase-empty"></td>
- num → <td class="num-cell">번호</td>
- label → <th scope="row">구분명</th>
- asIs → <td class="asis-cell">내용</td>
- toBe → <td class="tobe-cell">내용</td>

\`\`\`html
<div class="wk-table-block">
  <div class="tb-head">
    <div class="tb-title">① 디자인 workflow에서의 변화</div>
    <div class="tb-sub">설명 텍스트</div>
  </div>
  <div class="wk-table-wrap">
    <table class="wk-table">
      <thead>
        <tr>
          <th style="width:140px;text-align:center;">구간</th>
          <th style="width:48px;text-align:center;">단계</th>
          <th>구분</th>
          <th>AS-IS (기존)</th>
          <th>TO-BE (AI 도입 이후)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="phase-empty"></td>
          <td class="num-cell">1</td>
          <th scope="row">문제 정의</th>
          <td class="asis-cell">PM·기획 주도</td>
          <td class="tobe-cell">AI와 함께 탐색형 정의</td>
        </tr>
        <tr>
          <td class="phase-cell phase-p2d" rowspan="2">
            <div class="phase-title">Prompt to Design</div>
            <div class="phase-sub">PRD → 디자인 초안</div>
          </td>
          <td class="num-cell">4</td>
          <th scope="row">와이어프레임</th>
          <td class="asis-cell">디자이너 수작업</td>
          <td class="tobe-cell">AI 초안 생성</td>
        </tr>
        <tr>
          <td class="num-cell">5</td>
          <th scope="row">UI 디자인</th>
          <td class="asis-cell">픽셀 단위 제작</td>
          <td class="tobe-cell">시스템 조합 + AI refinement</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
\`\`\`

## proc-flow 다이어그램 — format:"flow"인 경우
comparison 섹션이 있거나 sourceHtml에 As-Is/To-Be 내용이 있으면:
1. cmp-bar 토글 버튼 (As-Is / To-Be)
2. 각 패널에 proc-flow 다이어그램 — 박스(proc-step) + 화살표(proc-arrow) 반복
3. proc-step 박스 안에: proc-idx(순번) + proc-title(단계명) + proc-hours(시간) + proc-detail(설명, 있으면)
4. 병목 단계: class="proc-step is-bottleneck" + <span class="proc-badge problem">병목</span>
5. AI 단계: class="proc-step is-ai" + <span class="proc-badge ai">AI</span> + proc-save(절감량)
6. 제거 단계: class="proc-step is-removed"
7. proc-summary 바: 총 시간, 절감량 표시
JSON의 steps 배열에 asIs/toBe 컬럼이 있으면 → proc-flow 두 개(As-Is / To-Be 패널) 각각 생성
JSON의 steps 배열이 비어있으면 sourceHtml에서 순번+단계명+시간값 패턴을 직접 찾아 proc-flow를 구성하세요.

## tools 섹션 — 반드시 지켜야 합니다
tools 타입 섹션이 있으면 위 예시처럼 도구 카드 그리드를 생성합니다.
- 각 tool의 features/strengths/weaknesses/scenes/value를 <details> 접이식으로 표현
- subtabs가 있는 tool은 data-subtab-group + .tool-subtab 버튼으로 탭 전환 구현
- 각 도구의 모든 텍스트(features, strengths, weaknesses, scenes, value)를 원문 그대로 포함 — 생략 금지
- callout이 있으면 섹션 시작 부분에 표시

## examples 섹션 — 반드시 지켜야 합니다
examples 타입 섹션이 있으면 DS 탭 컴포넌트(.wk-tabs)로 생성합니다.
- .wk-tabs[data-tabgroup] > .wk-tab-bar > .wk-tab-btn[data-target] 구조 사용
- 패널은 .wk-tab-panel, 첫 패널만 .is-active 클래스 추가
- 패널 내부 텍스트는 DS 클래스 사용: .body / .wk-tab-label / .card.flat / h3.h-bar 등 — inline font: 절대 금지
- 각 탭의 method(원문 전체), accessSteps, steps, prompt, output을 모두 포함 — 생략 금지
- prompt는 어두운 배경(#1a1a1a) 모노스페이스 블록으로 표현
- output은 .card.flat + border-left:3px solid var(--color-primary) 결과 블록으로 표현
- callout이 있으면 탭 컨테이너 위에 .card.flat으로 표시

## webos-agenda 섹션 — 반드시 지켜야 합니다
webos-agenda 타입 섹션이 있으면 위 예시처럼 2컬럼 그룹 구조로 생성합니다.
- groups 배열의 각 그룹 → 컬럼으로 배치
- 각 item → 클릭 가능한 카드(href가 있으면 <a>, 없으면 <div>)
- subitems → 카드 안에 점선 구분선 이후 서브 목록으로 표시

${HTML_EXAMPLES}

## 생성할 보고서 내용 (JSON)
${jsonContent}
${sourceHtml ? `\n## 원본 HTML 텍스트 — 아래 경우에 직접 참조하세요\n- comparison.steps가 비어있으면 → 순번+단계명+시간 패턴을 찾아 proc-flow 구성\n- cards[].body 또는 items가 비어있으면 → 해당 카드 주변 텍스트를 찾아 채우세요\n- timeline.milestones[].items가 비어있으면 → 해당 기간의 세부 항목을 찾아 채우세요\n\`\`\`html\n${sourceHtml}\n\`\`\`` : ''}

출력: <!DOCTYPE html>로 시작하는 완전한 HTML만. 설명 텍스트 없이.`

export async function POST(req: NextRequest) {
  const body = await req.json()
  const sourceHtml: string | undefined = typeof body.sourceHtml === 'string'
    ? body.sourceHtml.slice(0, 12000)
    : undefined
  const jsonContent: string = typeof body.content === 'string'
    ? body.content.slice(0, 10000)
    : JSON.stringify(body.content, null, 2).slice(0, 10000)

  if (!jsonContent || jsonContent === '{}') {
    return new Response(JSON.stringify({ error: '내용이 없습니다.' }), { status: 400 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }), { status: 500 })
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: GENERATE_PROMPT(jsonContent, sourceHtml) }],
      temperature: 0.2,
      max_tokens: 16000,
      stream: false,
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    // 1. Strip markdown code fences (```html ... ```)
    let html = raw
      .replace(/^```(?:html)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')

    // 2. If gpt-4o still embedded markdown inside (</head>```html pattern), extract inner HTML
    const innerMatch = html.match(/<!DOCTYPE\s+html[\s\S]*/i) ?? html.match(/<html[\s\S]*/i)
    if (innerMatch) html = innerMatch[0]

    // 3. Strip any <style> blocks gpt-4o wrote despite instructions
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '')

    // 4. Ensure exactly one <link href="/wakku-ds.css"> in <head>
    html = html.replace(/(<link[^>]+wakku-ds\.css[^>]*>\s*)+/gi, '')
    html = html.replace('</head>', '<link rel="stylesheet" href="/wakku-ds.css">\n</head>')

    // 5. Close if truncated
    if (!/\<\/html\>/i.test(html)) {
      if (!/\<\/body\>/i.test(html)) html += '\n</body>'
      html += '\n</html>'
    }

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
}
