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
    <div style="background:linear-gradient(135deg,#FFF0F0 0%,#fff 100%);border-left:4px solid var(--color-primary);padding:20px 24px;border-radius:12px;margin-bottom:32px;">
      <p style="margin:0 0 6px;font:700 11px/1 var(--font-sans);color:var(--color-primary);letter-spacing:.4px;text-transform:uppercase;">용어 정의</p>
      <p style="margin:0;font:400 14px/1.7 var(--font-kr);color:var(--color-neutral-700);">용어 설명 내용</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;">

      <!-- 일반 도구 카드 -->
      <div style="background:#fff;border:1px solid var(--border-subtle);border-radius:16px;padding:22px;box-shadow:var(--shadow-sm);">
        <div style="font:600 11px/1 var(--font-sans);color:var(--color-primary);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">AI Native UI 생성</div>
        <div style="font:700 17px/1 var(--font-sans);color:var(--color-ink);margin-bottom:10px;">Google Stitch</div>
        <div style="font:700 13px/1.5 var(--font-kr);color:var(--color-primary);background:var(--color-primary-bg);border-left:3px solid var(--color-primary);border-radius:0 6px 6px 0;padding:8px 12px;margin-bottom:14px;">AI 기반 UI 생성 및 프로토타이핑 도구</div>
        <details open style="margin:0;"><summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:10px 0;border-top:1px solid var(--border-subtle);font:700 11px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">주요 기능</summary>
          <ul class="body" style="margin:6px 0 10px;"><li>기능 1</li><li>기능 2</li></ul>
        </details>
        <details style="margin:0;"><summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:10px 0;border-top:1px solid var(--border-subtle);font:700 11px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">잘하는 것</summary>
          <ul class="body" style="margin:6px 0 10px;"><li>강점 1</li></ul>
        </details>
        <details style="margin:0;"><summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:10px 0;border-top:1px solid var(--border-subtle);font:700 11px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-500);">아쉬운 점</summary>
          <ul class="body" style="margin:6px 0 10px;"><li>약점 1</li></ul>
        </details>
        <details style="margin:0;"><summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:10px 0;border-top:1px solid var(--border-subtle);font:700 11px/1 var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--color-neutral-600);">대표 장면</summary>
          <ul class="body" style="margin:6px 0 8px;"><li>장면 1</li></ul>
          <div class="takeaway" style="margin-top:8px;"><b>이런 팀에 적합</b> · 설명</div>
        </details>
      </div>

      <!-- subtabs가 있는 도구 카드 (예: Figma / Figma Make) -->
      <div style="background:#fff;border:1px solid var(--border-subtle);border-radius:16px;padding:22px;box-shadow:var(--shadow-sm);">
        <!-- 서브탭 -->
        <div style="display:flex;gap:6px;margin-bottom:14px;padding:4px;background:var(--color-neutral-30);border-radius:10px;" role="tablist" data-subtab-group="tool-figma">
          <button type="button" class="tool-subtab is-active" data-target="tool-figma-0" style="flex:1;appearance:none;border:0;background:transparent;padding:8px 10px;font:700 12px/1 var(--font-sans);color:var(--color-neutral-500);cursor:pointer;border-radius:7px;transition:background .15s,color .15s;">Figma</button>
          <button type="button" class="tool-subtab" data-target="tool-figma-1" style="flex:1;appearance:none;border:0;background:transparent;padding:8px 10px;font:700 12px/1 var(--font-sans);color:var(--color-neutral-500);cursor:pointer;border-radius:7px;transition:background .15s,color .15s;">Figma Make</button>
        </div>
        <div id="tool-figma-0" class="tool-sub-panel" style="display:block;">
          <div style="font:600 11px/1 var(--font-sans);color:var(--color-primary);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">디자인 플랫폼 + AI</div>
          <div style="font:700 17px/1 var(--font-sans);color:var(--color-ink);margin-bottom:10px;">Figma</div>
          <div style="font:700 13px/1.5 var(--font-kr);color:var(--color-primary);background:var(--color-primary-bg);border-left:3px solid var(--color-primary);border-radius:0 6px 6px 0;padding:8px 12px;margin-bottom:14px;">Figma 포지션 설명</div>
          <details open><summary style="list-style:none;cursor:pointer;padding:10px 0;border-top:1px solid var(--border-subtle);font:700 11px/1 var(--font-sans);text-transform:uppercase;color:var(--color-neutral-600);">주요 기능</summary>
            <ul class="body" style="margin:6px 0 10px;"><li>기능 1</li></ul>
          </details>
        </div>
        <div id="tool-figma-1" class="tool-sub-panel" style="display:none;">
          <div style="font:600 11px/1 var(--font-sans);color:var(--color-primary);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">생성형 코드 AI</div>
          <div style="font:700 17px/1 var(--font-sans);color:var(--color-ink);margin-bottom:10px;">Figma Make</div>
          <div style="font:700 13px/1.5 var(--font-kr);color:var(--color-primary);background:var(--color-primary-bg);border-left:3px solid var(--color-primary);border-radius:0 6px 6px 0;padding:8px 12px;margin-bottom:14px;">Figma Make 포지션 설명</div>
          <details open><summary style="list-style:none;cursor:pointer;padding:10px 0;border-top:1px solid var(--border-subtle);font:700 11px/1 var(--font-sans);text-transform:uppercase;color:var(--color-neutral-600);">주요 기능</summary>
            <ul class="body" style="margin:6px 0 10px;"><li>기능 1</li></ul>
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
    <!-- 용어 정의 callout -->
    <div style="background:linear-gradient(135deg,#FFF0F0 0%,#fff 100%);border-left:4px solid var(--color-primary);padding:20px 24px;border-radius:12px;margin-bottom:24px;box-shadow:var(--shadow-sm);">
      <p style="margin:0 0 6px;font:600 11px/1 var(--font-sans);color:var(--color-neutral-500);letter-spacing:.04em;text-transform:uppercase;">용어 정의</p>
      <p style="margin:0;font:400 14px/1.7 var(--font-kr);color:var(--color-neutral-700);">용어 정의 내용</p>
    </div>
    <!-- 탭 컨테이너 -->
    <div style="background:#fff;border:1px solid var(--border-subtle);border-radius:16px;overflow:hidden;box-shadow:var(--shadow-sm);">
      <!-- 탭 헤더 -->
      <div style="display:flex;border-bottom:1px solid var(--border-subtle);background:var(--color-neutral-30);" role="tablist" data-tabgroup="examples">
        <button type="button" class="hx-tab is-active" data-target="ex-panel-0" style="flex:1;appearance:none;border:0;background:transparent;padding:16px 18px;font:600 14px/1 var(--font-sans);color:var(--color-neutral-500);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;border-bottom:3px solid transparent;transition:color .15s,background .15s,border-color .15s;">
          <span style="width:24px;height:24px;border-radius:6px;display:grid;place-items:center;font:800 12px/1 var(--font-sans);background:var(--color-neutral-500);color:#fff;flex-shrink:0;">S</span>Google Stitch
        </button>
        <button type="button" class="hx-tab" data-target="ex-panel-1" style="flex:1;appearance:none;border:0;background:transparent;padding:16px 18px;font:600 14px/1 var(--font-sans);color:var(--color-neutral-500);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;border-bottom:3px solid transparent;transition:color .15s,background .15s,border-color .15s;">
          <span style="width:24px;height:24px;border-radius:6px;display:grid;place-items:center;font:800 12px/1 var(--font-sans);background:var(--color-neutral-500);color:#fff;flex-shrink:0;">F</span>Figma
        </button>
      </div>
      <!-- 탭 패널 -->
      <div id="ex-panel-0" class="hx-tab-panel" style="display:block;">
        <div style="display:flex;align-items:center;gap:14px;padding:20px 24px;background:linear-gradient(135deg,var(--color-primary) 0%,#FF7A78 100%);color:#fff;">
          <div style="width:38px;height:38px;background:rgba(255,255,255,.18);border-radius:10px;display:grid;place-items:center;font:800 16px/1 var(--font-sans);flex-shrink:0;">S</div>
          <div>
            <div style="font:700 18px/1 var(--font-sans);">Google Stitch</div>
            <div style="font:400 12px/1 var(--font-sans);opacity:.85;margin-top:2px;">Gemini 기반 · 텍스트/음성 → 멀티스크린 UI</div>
          </div>
        </div>
        <div style="padding:22px 24px 26px;">
          <div style="margin-bottom:18px;">
            <span style="display:inline-block;font:700 11px/1 var(--font-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--color-primary);margin-bottom:8px;">AI 적용 방식</span>
            <p style="font:400 14px/1.7 var(--font-kr);color:var(--color-neutral-600);margin:0;">AI 적용 방식 원문 전체</p>
          </div>
          <div style="margin-bottom:18px;">
            <span style="display:inline-block;font:700 11px/1 var(--font-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--color-primary);margin-bottom:8px;">가장 빈번한 입문 예제</span>
            <ol style="padding-left:18px;margin:0;">
              <li style="font:400 14px/1.7 var(--font-kr);color:var(--color-neutral-600);margin-bottom:6px;">단계 1</li>
            </ol>
            <div style="background:#1a1a1a;color:#e5e5e5;border-radius:8px;padding:14px 16px;font:400 13px/1.55 'SF Mono','Consolas','Monaco',monospace;margin-top:8px;white-space:pre-wrap;word-break:break-word;"><span style="color:#f59e0b;font-weight:700;margin-right:6px;">프롬프트</span>프롬프트 텍스트</div>
            <div style="background:var(--color-neutral-30);border-left:3px solid var(--color-primary);padding:12px 16px;border-radius:0 8px 8px 0;font:400 13px/1.6 var(--font-kr);color:var(--color-neutral-600);margin-top:6px;">▷ 결과: 결과 설명</div>
          </div>
        </div>
      </div>
      <div id="ex-panel-1" class="hx-tab-panel" style="display:none;"><!-- 다음 탭 패널 --></div>
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
          <span style="font:700 11px/1 var(--font-sans);letter-spacing:.18em;text-transform:uppercase;color:var(--color-primary);">Part 1</span>
          <span style="font:700 15px/1 var(--font-sans);color:var(--color-ink);margin-left:4px;">사전 기술 검토</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <a href="http://localhost:3004/" target="_blank" rel="noopener" style="display:flex;align-items:stretch;gap:22px;background:#fff;border:1px solid var(--border-subtle);border-radius:18px;padding:26px 28px;box-shadow:var(--shadow-sm);color:inherit;text-decoration:none;transition:transform .15s,border-color .15s,box-shadow .15s;">
            <div style="flex-shrink:0;width:56px;height:56px;border-radius:14px;background:var(--color-primary);color:#fff;font:800 22px/1 var(--font-sans);display:grid;place-items:center;">1</div>
            <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
              <div style="font:700 19px/1.3 var(--font-kr);color:var(--color-ink);margin-bottom:4px;">항목 제목</div>
              <div style="font:400 14px/1.55 var(--font-kr);color:var(--color-neutral-500);">항목 설명</div>
            </div>
            <div style="align-self:center;font:700 13px/1 var(--font-sans);color:var(--color-primary);white-space:nowrap;">바로가기 ↗</div>
          </a>
        </div>
      </div>
      <!-- 구분선 -->
      <div style="background:var(--border-subtle);align-self:stretch;"></div>
      <!-- 우: Part 2 -->
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <span style="width:8px;height:8px;border-radius:999px;background:var(--color-primary);box-shadow:0 0 0 4px rgba(253,49,46,.14);flex-shrink:0;"></span>
          <span style="font:700 11px/1 var(--font-sans);letter-spacing:.18em;text-transform:uppercase;color:var(--color-primary);">Part 2</span>
          <span style="font:700 15px/1 var(--font-sans);color:var(--color-ink);margin-left:4px;">컨셉 검증 Prototype</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <a href="#" target="_blank" rel="noopener" style="display:flex;align-items:flex-start;gap:22px;background:#fff;border:1px solid var(--border-subtle);border-radius:18px;padding:26px 28px;box-shadow:var(--shadow-sm);color:inherit;text-decoration:none;">
            <div style="flex-shrink:0;width:56px;height:56px;border-radius:14px;background:var(--color-primary);color:#fff;font:800 22px/1 var(--font-sans);display:grid;place-items:center;">5</div>
            <div style="flex:1;">
              <div style="font:700 19px/1.3 var(--font-kr);color:var(--color-ink);margin-bottom:4px;">컨셉 검증 및 1차 Prototype</div>
              <div style="font:400 14px/1.55 var(--font-kr);color:var(--color-neutral-500);">설명</div>
              <ul style="list-style:none;margin:12px 0 0;padding:12px 0 0;border-top:1px dashed var(--border-subtle);display:flex;flex-direction:column;gap:8px;">
                <li style="position:relative;padding-left:18px;font:400 14px/1.6 var(--font-kr);color:var(--color-neutral-500);">
                  <span style="position:absolute;left:0;top:9px;width:5px;height:5px;border-radius:999px;background:var(--color-primary);display:block;"></span>
                  서브 항목 1
                </li>
              </ul>
            </div>
            <div style="align-self:center;font:700 13px/1 var(--font-sans);color:var(--color-primary);white-space:nowrap;">바로가기 ↗</div>
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

// examples 탭 (data-tabgroup 속성으로 그룹 지정)
document.querySelectorAll('[data-tabgroup]').forEach(function(tablist) {
  var tabs = tablist.querySelectorAll('.hx-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var targetId = tab.getAttribute('data-target');
      tabs.forEach(function(t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.style.color = active ? 'var(--color-primary)' : 'var(--color-neutral-500)';
        t.style.background = active ? '#fff' : 'transparent';
        t.style.borderBottomColor = active ? 'var(--color-primary)' : 'transparent';
        var badge = t.querySelector('span');
        if (badge) badge.style.background = active ? 'var(--color-primary)' : 'var(--color-neutral-500)';
      });
      document.querySelectorAll('.hx-tab-panel').forEach(function(panel) {
        panel.style.display = panel.id === targetId ? 'block' : 'none';
      });
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
- ✅ <head>에 반드시: <link rel="stylesheet" href="/wakku-ds.css">
- ✅ 모든 섹션: <section class="block"> + <div class="wrap">
- ✅ 섹션 배경: #F7F8F9 / #fff 교차
- ✅ </body> 직전에 필수 JS 포함

## proc-flow 다이어그램 — 반드시 지켜야 합니다
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
examples 타입 섹션이 있으면 탭형 인터페이스를 생성합니다.
- data-tabgroup 속성으로 탭 그룹 지정, .hx-tab + .hx-tab-panel 구조 사용
- 각 탭의 method(원문 전체), accessSteps, steps, prompt, output을 모두 포함 — 생략 금지
- prompt는 어두운 배경(#1a1a1a) 모노스페이스 블록으로 표현
- output은 왼쪽에 빨간 border가 있는 결과 블록으로 표현
- callout이 있으면 탭 컨테이너 위에 표시

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
  const sourceHtml: string | undefined = body.sourceHtml
  const jsonContent: string = typeof body.content === 'string'
    ? body.content
    : JSON.stringify(body.content, null, 2)

  if (!jsonContent || jsonContent === '{}') {
    return new Response(JSON.stringify({ error: '내용이 없습니다.' }), { status: 400 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }), { status: 500 })
  }

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
}
