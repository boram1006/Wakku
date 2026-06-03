/**
 * Inline copy of src/design-system/report-design-system.css
 * Used by htmlExporter to embed styles in the exported HTML.
 */
export const REPORT_CSS = `
:root {
  --report-accent: #FD312E;
  --report-accent-soft: rgba(253, 49, 46, 0.08);
  --report-accent-line: rgba(253, 49, 46, 0.24);
  --report-bg: #FFFFFF;
  --report-bg-muted: #F7F8F9;
  --report-surface: #FFFFFF;
  --report-surface-strong: #111827;
  --report-text: #111111;
  --report-text-muted: #6B7280;
  --report-text-soft: #9CA3AF;
  --report-border: #E5E7EB;
  --report-border-strong: #D1D5DB;
  --report-radius-sm: 10px;
  --report-radius-md: 14px;
  --report-radius-lg: 18px;
  --report-radius-xl: 24px;
  --report-shadow-card: 0 8px 24px rgba(17, 24, 39, 0.06);
  --report-shadow-soft: 0 4px 14px rgba(17, 24, 39, 0.04);
  --report-width: 1240px;
  --report-pad-x: 48px;
  --report-section-y: 80px;
  --report-card-pad: 28px;
  --report-card-gap: 24px;
  --report-grid-gap: 24px;
  --report-grid-gap-sm: 20px;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Pretendard, "Noto Sans KR", sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--report-text);
  background: var(--report-bg);
  -webkit-font-smoothing: antialiased;
}

.report-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--report-border);
}
.report-nav-inner {
  width: min(var(--report-width), calc(100vw - 80px));
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}
.report-brand { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
.report-nav-links { display: flex; gap: 22px; align-items: center; }
.report-nav-links a {
  color: var(--report-text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}
.report-nav-links a:hover { color: var(--report-accent); }

.report-section {
  width: 100%;
  padding: var(--report-section-y) 0;
  background: var(--report-bg);
}
.report-section.is-muted { background: var(--report-bg-muted); }
.report-wrap {
  width: min(var(--report-width), calc(100vw - 80px));
  margin: 0 auto;
}

.report-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 40px;
  margin-bottom: 40px;
}
.report-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: var(--report-accent);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.report-kicker::before {
  content: "";
  width: 36px;
  height: 2px;
  background: var(--report-accent);
  display: inline-block;
}
.report-title {
  margin: 0;
  font-size: 42px;
  line-height: 1.14;
  letter-spacing: -0.035em;
  font-weight: 700;
}
.report-subtitle {
  margin: 18px 0 0;
  color: var(--report-text-muted);
  font-size: 18px;
  line-height: 1.58;
  letter-spacing: -0.01em;
  max-width: 1100px;
}

.report-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--report-grid-gap); }
.report-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--report-grid-gap); }
.report-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--report-grid-gap-sm); }

.report-card {
  background: var(--report-surface);
  border: 1px solid var(--report-border);
  border-radius: var(--report-radius-lg);
  box-shadow: var(--report-shadow-soft);
  padding: var(--report-card-pad);
}
.report-card.is-emphasis {
  border-color: var(--report-accent-line);
  background: linear-gradient(180deg, var(--report-accent-soft), #fff 62%);
}
.report-card-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.34;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.report-card-desc {
  margin: 12px 0 0;
  color: var(--report-text-muted);
  font-size: 16px;
  line-height: 1.64;
  letter-spacing: -0.01em;
}

.report-num {
  font-size: 56px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--report-accent);
}
.report-unit {
  margin-left: 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--report-text);
}

.report-label {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--report-bg-muted);
  color: var(--report-text-muted);
  font-size: 14px;
  font-weight: 700;
}
.report-label.is-accent {
  background: var(--report-accent-soft);
  color: var(--report-accent);
}

.report-split-row {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  padding: 16px 0;
  border-top: 1px solid var(--report-border);
}
.report-split-row:first-child { border-top: 0; padding-top: 0; }
.report-split-row:last-child { padding-bottom: 0; }
.report-row-label { font-size: 14px; font-weight: 700; color: var(--report-text-muted); }
.report-row-text { font-size: 16px; line-height: 1.58; color: var(--report-text); }

.report-flow { display: flex; align-items: stretch; gap: 18px; }
.report-step {
  flex: 1;
  min-height: 148px;
  background: var(--report-surface);
  border: 1px solid var(--report-border);
  border-radius: var(--report-radius-md);
  padding: 24px;
}
.report-step-num { color: var(--report-accent); font-size: 14px; font-weight: 700; margin-bottom: 10px; }
.report-step-title { font-size: 18px; line-height: 1.38; font-weight: 700; letter-spacing: -0.02em; }
.report-step-desc { margin-top: 8px; color: var(--report-text-muted); font-size: 14.5px; line-height: 1.55; }
.report-arrow { display: flex; align-items: center; color: var(--report-text-soft); font-size: 22px; font-weight: 700; }

.report-callout {
  border-left: 4px solid var(--report-accent);
  background: var(--report-accent-soft);
  border-radius: 0 var(--report-radius-md) var(--report-radius-md) 0;
  padding: 20px 22px;
  font-size: 18px;
  line-height: 1.62;
  font-weight: 500;
}

.report-cover-inner {
  min-height: 56vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.report-cover-body {
  margin: 32px 0 0;
  font-size: 22px;
  line-height: 1.6;
  color: var(--report-text-muted);
  max-width: 800px;
}

@media (max-width: 1200px) {
  .report-wrap, .report-nav-inner { width: calc(100vw - 48px); }
  .report-grid-2, .report-grid-3, .report-grid-4 { grid-template-columns: 1fr; }
  .report-head { grid-template-columns: 1fr; }
  .report-title { font-size: 32px; }
  .report-flow { flex-direction: column; }
  .report-arrow { justify-content: center; transform: rotate(90deg); }
}
`
