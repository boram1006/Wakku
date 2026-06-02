'use client'

export function GeneratingScreen({ title }: { title: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: 'var(--report-bg)',
      }}
    >
      <Spinner />
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--report-text)',
            marginBottom: 8,
          }}
        >
          보고자료를 생성하고 있습니다
        </div>
        <div style={{ fontSize: 14, color: 'var(--report-text-muted)' }}>{title}</div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        border: '3px solid var(--report-border)',
        borderTopColor: 'var(--report-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--report-bg)' }}>
      <div
        style={{
          borderBottom: '1px solid var(--report-border)',
          padding: '0 40px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--report-text)' }}>
          Wakku
        </div>
      </div>
      {children}
    </div>
  )
}
