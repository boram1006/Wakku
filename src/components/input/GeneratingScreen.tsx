'use client'

export function GeneratingScreen({ heading, title }: { heading?: string; title: string }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Spinner />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: 8, letterSpacing: 'var(--tracking-tight)' }}>
          {heading ?? '보고자료를 생성하고 있습니다'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-neutral-500)' }}>{title}</div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ width: 36, height: 36, border: '3px solid var(--color-neutral-100)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function PageShell({ children, step }: { children: React.ReactNode; step?: 1 | 2 | 3 }) {
  const s = step ?? 1
  return (
    <div className="wk-page">
      <header className="wk-header">
        <a className="wk-brand" href="/">
          <span className="mark">W</span>
          <span className="name">Wakku</span>
        </a>
        <div className="wk-steps">
          <div className={`wk-step${s === 1 ? ' is-active' : s > 1 ? ' is-done' : ''}`}>
            <span className="dot">1</span>
            <span className="lbl">자료 입력</span>
          </div>
          <span className="wk-step-sep" />
          <div className={`wk-step${s === 2 ? ' is-active' : s > 2 ? ' is-done' : ''}`}>
            <span className="dot">2</span>
            <span className="lbl">분석 확인</span>
          </div>
          <span className="wk-step-sep" />
          <div className={`wk-step${s === 3 ? ' is-active' : ''}`}>
            <span className="dot">3</span>
            <span className="lbl">보고자료 생성</span>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
