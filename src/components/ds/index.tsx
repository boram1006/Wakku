import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

// ─── ReportSection ────────────────────────────────────────────────────────────

interface SectionProps {
  id?: string
  muted?: boolean
  children: React.ReactNode
  className?: string
}

export function ReportSection({ id, muted, children, className }: SectionProps) {
  return (
    <section id={id} className={cn('report-section', muted && 'is-muted', className)}>
      {children}
    </section>
  )
}

// ─── ReportWrap ───────────────────────────────────────────────────────────────

interface WrapProps { children: React.ReactNode; className?: string }

export function ReportWrap({ children, className }: WrapProps) {
  return <div className={cn('report-wrap', className)}>{children}</div>
}

// ─── ReportHead ───────────────────────────────────────────────────────────────

interface HeadProps { kicker: string; title: string; subtitle: string; className?: string }

export function ReportHead({ kicker, title, subtitle, className }: HeadProps) {
  return (
    <header className={cn('report-head', className)}>
      <div>
        <div className="report-kicker">{kicker}</div>
        <h2 className="report-title" dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }} />
        <p className="report-subtitle">{subtitle}</p>
      </div>
    </header>
  )
}

// ─── ReportGrid ───────────────────────────────────────────────────────────────

const COL_CLASS: Record<number, string> = { 2: 'report-grid-2', 3: 'report-grid-3', 4: 'report-grid-4' }

interface GridProps { cols: 2 | 3 | 4; children: React.ReactNode; className?: string }

export function ReportGrid({ cols, children, className }: GridProps) {
  return <div className={cn(COL_CLASS[cols], className)}>{children}</div>
}

// ─── ReportCard ───────────────────────────────────────────────────────────────

interface CardProps { emphasis?: boolean; children: React.ReactNode; className?: string }

export function ReportCard({ emphasis, children, className }: CardProps) {
  return (
    <article className={cn('report-card', emphasis && 'is-emphasis', className)}>
      {children}
    </article>
  )
}

// ─── ReportKpiCard ────────────────────────────────────────────────────────────

interface KpiCardProps { num: string; unit: string; title: string; desc: string; emphasis?: boolean; className?: string }

export function ReportKpiCard({ num, unit, title, desc, emphasis, className }: KpiCardProps) {
  return (
    <article className={cn('report-card', emphasis && 'is-emphasis', className)}>
      <div>
        <span className="report-num">{num}</span>
        <span className="report-unit">{unit}</span>
      </div>
      <h3 className="report-card-title">{title}</h3>
      <p className="report-card-desc">{desc}</p>
    </article>
  )
}

// ─── ReportLabel ──────────────────────────────────────────────────────────────

interface LabelProps { accent?: boolean; children: React.ReactNode; className?: string }

export function ReportLabel({ accent, children, className }: LabelProps) {
  return <span className={cn('report-label', accent && 'is-accent', className)}>{children}</span>
}

// ─── ReportFlow ───────────────────────────────────────────────────────────────

interface FlowProps { children: React.ReactNode; className?: string }

export function ReportFlow({ children, className }: FlowProps) {
  return <div className={cn('report-flow', className)}>{children}</div>
}

// ─── ReportStep ───────────────────────────────────────────────────────────────

interface StepProps { num: string; title: string; desc: string; className?: string }

export function ReportStep({ num, title, desc, className }: StepProps) {
  return (
    <div className={cn('report-step', className)}>
      <div className="report-step-num">{num}</div>
      <div className="report-step-title">{title}</div>
      <div className="report-step-desc">{desc}</div>
    </div>
  )
}

// ─── ReportArrow ──────────────────────────────────────────────────────────────

export function ReportArrow() {
  return <div className="report-arrow">→</div>
}

// ─── ReportCallout ────────────────────────────────────────────────────────────

interface CalloutProps { children: React.ReactNode; className?: string; style?: CSSProperties }

export function ReportCallout({ children, className, style }: CalloutProps) {
  return <div className={cn('report-callout', className)} style={style}>{children}</div>
}

// ─── ReportSplitRow ───────────────────────────────────────────────────────────

interface SplitRowProps { label: string; text: string }

export function ReportSplitRow({ label, text }: SplitRowProps) {
  return (
    <div className="report-split-row">
      <div className="report-row-label">{label}</div>
      <div className="report-row-text">{text}</div>
    </div>
  )
}

// ─── ReportNav ────────────────────────────────────────────────────────────────

interface NavLink { href: string; label: string }
interface NavProps { brand: string; links: NavLink[] }

export function ReportNav({ brand, links }: NavProps) {
  return (
    <nav className="report-nav">
      <div className="report-nav-inner">
        <div className="report-brand">{brand}</div>
        <div className="report-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>
      </div>
    </nav>
  )
}
