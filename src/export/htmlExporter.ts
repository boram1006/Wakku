import { REPORT_CSS } from './reportCss'
import type { ReportData, ReportPage } from '@/types/report'

// ── Escaping ──────────────────────────────────────────────────────────────────

function esc(text: string | undefined): string {
  return (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function nl2br(text: string | undefined): string {
  return esc(text).replace(/\n/g, '<br />')
}

// ── Page head (kicker + title + subtitle) ─────────────────────────────────────

function renderHead(page: ReportPage): string {
  return `
      <header class="report-head">
        <div>
          <div class="report-kicker">${esc(page.sectionNumber)} · ${esc(page.sectionLabel)}</div>
          <h2 class="report-title">${nl2br(page.title)}</h2>
          ${page.subtitle ? `<p class="report-subtitle">${esc(page.subtitle)}</p>` : ''}
        </div>
      </header>`
}

// ── Layout renderers ──────────────────────────────────────────────────────────

function renderCover(page: ReportPage, muted: boolean): string {
  const textBlock = page.blocks.find((b) => b.type === 'text')
  return `
  <section id="${esc(page.id)}" class="report-section${muted ? ' is-muted' : ''}">
    <div class="report-wrap">
      <div class="report-cover-inner">
        <div class="report-kicker">${esc(page.sectionNumber)} · ${esc(page.sectionLabel)}</div>
        <h1 class="report-title">${nl2br(page.title)}</h1>
        ${textBlock ? `<p class="report-cover-body">${nl2br(textBlock.body)}</p>` : ''}
      </div>
    </div>
  </section>`
}

function renderScope(page: ReportPage, muted: boolean): string {
  const cards = page.blocks.filter((b) => b.type === 'card')
  const items = cards.map((b, i) => `
          <article class="report-card${i === 0 ? ' is-emphasis' : ''}">
            <span class="report-label${i === 0 ? ' is-accent' : ''}">${esc(b.meta)}</span>
            <h3 class="report-card-title" style="margin-top:14px">${esc(b.title)}</h3>
            <p class="report-card-desc">${nl2br(b.body)}</p>
          </article>`).join('')
  return `
  <section id="${esc(page.id)}" class="report-section${muted ? ' is-muted' : ''}">
    <div class="report-wrap">
      ${renderHead(page)}
      <div class="report-grid-3">${items}</div>
    </div>
  </section>`
}

function renderOverviewKpi(page: ReportPage, muted: boolean): string {
  const kpis = page.blocks.filter((b) => b.type === 'kpi')
  const items = kpis.map((b, i) => `
          <article class="report-card${i === 1 ? ' is-emphasis' : ''}">
            <div><span class="report-num">${esc(b.value)}</span><span class="report-unit">${esc(b.meta)}</span></div>
            <h3 class="report-card-title">${esc(b.title)}</h3>
            <p class="report-card-desc">${nl2br(b.body)}</p>
          </article>`).join('')
  return `
  <section id="${esc(page.id)}" class="report-section${muted ? ' is-muted' : ''}">
    <div class="report-wrap">
      ${renderHead(page)}
      <div class="report-grid-3">${items}</div>
    </div>
  </section>`
}

function renderCardGrid(
  page: ReportPage,
  muted: boolean,
  cols: 2 | 3,
  emphasisIndex?: number
): string {
  const cards = page.blocks.filter((b) => b.type === 'card')
  const items = cards.map((b, i) => {
    const isEmphasis = emphasisIndex !== undefined && i === emphasisIndex
    return `
          <article class="report-card${isEmphasis ? ' is-emphasis' : ''}">
            <span class="report-label${isEmphasis ? ' is-accent' : ''}">${esc(b.meta)}</span>
            <h3 class="report-card-title" style="margin-top:14px">${esc(b.title)}</h3>
            <p class="report-card-desc">${nl2br(b.body)}</p>
          </article>`
  }).join('')
  return `
  <section id="${esc(page.id)}" class="report-section${muted ? ' is-muted' : ''}">
    <div class="report-wrap">
      ${renderHead(page)}
      <div class="report-grid-${cols}">${items}</div>
    </div>
  </section>`
}

function renderTimeline(page: ReportPage, muted: boolean): string {
  const rows = page.blocks.filter((b) => b.type === 'timeline')
  const items = rows.map((b) => `
            <div class="report-split-row">
              <div class="report-row-label">${esc(b.meta)}</div>
              <div class="report-row-text">${nl2br(b.body)}</div>
            </div>`).join('')
  return `
  <section id="${esc(page.id)}" class="report-section${muted ? ' is-muted' : ''}">
    <div class="report-wrap">
      ${renderHead(page)}
      <article class="report-card">${items}</article>
    </div>
  </section>`
}

function renderToBeFlow(page: ReportPage, muted: boolean): string {
  const steps = page.blocks.filter((b) => b.type === 'flow')
  const callout = page.blocks.find((b) => b.type === 'text')

  const stepsHtml = steps.flatMap((b, i) => {
    const step = `
            <div class="report-step">
              <div class="report-step-num">${esc(b.meta)}</div>
              <div class="report-step-title">${esc(b.title)}</div>
              <div class="report-step-desc">${nl2br(b.body)}</div>
            </div>`
    return i < steps.length - 1 ? [step, `<div class="report-arrow">→</div>`] : [step]
  }).join('')

  const calloutHtml = callout
    ? `\n      <div class="report-callout" style="margin-top:28px">${nl2br(callout.body)}</div>`
    : ''

  return `
  <section id="${esc(page.id)}" class="report-section${muted ? ' is-muted' : ''}">
    <div class="report-wrap">
      ${renderHead(page)}
      <div class="report-flow">${stepsHtml}</div>${calloutHtml}
    </div>
  </section>`
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

function renderPage(page: ReportPage, index: number): string {
  const muted = index % 2 === 0
  switch (page.layoutType) {
    case 'cover':           return renderCover(page, muted)
    case 'scope':           return renderScope(page, muted)
    case 'overview-kpi':    return renderOverviewKpi(page, muted)
    case 'problem-cards':   return renderCardGrid(page, muted, 3)
    case 'effect-split':    return renderCardGrid(page, muted, 2, 0)
    case 'execution-plan':  return renderCardGrid(page, muted, 3)
    case 'discussion-cards':return renderCardGrid(page, muted, 3)
    case 'rr':              return renderCardGrid(page, muted, 2)
    case 'timeline':        return renderTimeline(page, muted)
    case 'to-be-flow':      return renderToBeFlow(page, muted)
    default:                return ''
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateHtml(data: ReportData): string {
  const navLinks = data.pages
    .map((p) => `<a href="#${esc(p.id)}">${esc(p.sectionLabel)}</a>`)
    .join('\n        ')

  const pagesHtml = data.pages.map((page, i) => renderPage(page, i)).join('\n')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(data.brand)}</title>
  <style>
${REPORT_CSS}
  </style>
</head>
<body>
  <nav class="report-nav">
    <div class="report-nav-inner">
      <div class="report-brand">${esc(data.brand)}</div>
      <div class="report-nav-links">
        ${navLinks}
      </div>
    </div>
  </nav>
${pagesHtml}
</body>
</html>`
}

function toFilename(title: string): string {
  const safe = title.replace(/\s+/g, '_').replace(/[\\/:*?"<>|]/g, '').slice(0, 80)
  return (safe || 'report') + '.html'
}

export function downloadHtml(data: ReportData): void {
  const html = generateHtml(data)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = toFilename(data.brand)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
