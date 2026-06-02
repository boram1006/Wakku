'use client'

import type { AnalysisResult, AgentAnswers } from '@/types/agent'

const SECTION_LABEL: Record<string, string> = {
  scope: '보고 범위',
  overview: '개요/KPI',
  problem: '현황/문제',
  tobe: '개선 방향',
  timeline: '추진 일정',
  effect: '기대효과',
}

interface Props {
  reportTitle: string
  analysis: AnalysisResult
  answers: AgentAnswers
  onAnswer: (id: string, value: string) => void
  onGenerate: () => void
  onBack: () => void
}

export function AgentQuestions({ reportTitle, analysis, answers, onAnswer, onGenerate, onBack }: Props) {
  const { detectedSections, detectedKpis, questions } = analysis

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 40px 80px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 44 }}>
        <div style={kickerStyle}>
          <span style={kickerBarStyle} />
          분석 완료
        </div>
        <h2 style={h2Style}>자료를 분석했습니다</h2>
        <p style={subtitleStyle}>
          <strong style={{ color: 'var(--report-text)', fontWeight: 700 }}>{reportTitle}</strong>
          {' — '}
          {questions.length > 0
            ? `보고자료를 완성하기 위해 ${questions.length}가지를 확인합니다.`
            : '추가 확인 없이 바로 생성할 수 있습니다.'}
        </p>
      </div>

      {/* 감지된 페이지 구조 */}
      <div style={infoBoxStyle}>
        <div style={infoLabelStyle}>
          감지된 페이지 구조 ({detectedSections.length}페이지)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {detectedSections.map((s, i) => (
            <span key={s} style={sectionPillStyle}>
              <span style={{ color: 'var(--report-accent)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {SECTION_LABEL[s] ?? s}
            </span>
          ))}
        </div>

        {detectedKpis.length > 0 && (
          <div style={{ marginTop: 18, borderTop: '1px solid var(--report-border)', paddingTop: 16 }}>
            <div style={{ ...infoLabelStyle, marginBottom: 10 }}>감지된 수치</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {detectedKpis.map((k) => (
                <span key={k} style={kpiPillStyle}>{k}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 질문 */}
      {questions.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={sectionTitleStyle}>확인 질문 ({questions.length}개)</div>
          {questions.map((q, i) => (
            <div key={q.id} style={questionBlockStyle}>
              <div style={qNumStyle}>Q{i + 1}</div>
              <div style={qTextStyle}>{q.question}</div>
              {q.multiline ? (
                <textarea
                  value={answers[q.id] ?? ''}
                  onChange={(e) => onAnswer(q.id, e.target.value)}
                  placeholder={q.hint}
                  rows={3}
                  className="report-field-textarea"
                  style={{ resize: 'none' }}
                />
              ) : (
                <input
                  type="text"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => onAnswer(q.id, e.target.value)}
                  placeholder={q.hint}
                  className="report-field-input"
                />
              )}
              <div style={hintStyle}>입력하지 않으면 기본값으로 생성됩니다.</div>
            </div>
          ))}
        </div>
      )}

      {/* 액션 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onGenerate} style={primaryBtnStyle}>
          보고자료 생성
          <span style={{ fontSize: 16 }}>→</span>
        </button>
        <button onClick={onBack} style={secondaryBtnStyle}>
          ← 다시 입력
        </button>
      </div>
    </div>
  )
}

// ─── 스타일 상수 ──────────────────────────────────────────────────────────────

const kickerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 18,
  color: 'var(--report-accent)',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

const kickerBarStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 24,
  height: 2,
  background: 'var(--report-accent)',
  borderRadius: 2,
}

const h2Style: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: 'var(--report-text)',
  lineHeight: 1.2,
}

const subtitleStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: 15,
  color: 'var(--report-text-muted)',
  lineHeight: 1.7,
}

const infoBoxStyle: React.CSSProperties = {
  background: 'var(--report-bg-muted)',
  borderRadius: 'var(--report-radius-md)',
  padding: '22px 24px',
  marginBottom: 40,
  border: '1px solid var(--report-border)',
}

const infoLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--report-text-muted)',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  marginBottom: 14,
}

const sectionPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 13px',
  background: '#fff',
  border: '1px solid var(--report-border)',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--report-text)',
}

const kpiPillStyle: React.CSSProperties = {
  padding: '4px 11px',
  background: 'var(--report-accent-soft)',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--report-accent)',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--report-text-muted)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: 24,
}

const questionBlockStyle: React.CSSProperties = {
  borderLeft: '2px solid var(--report-accent-line)',
  paddingLeft: 20,
  marginBottom: 32,
}

const qNumStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--report-accent)',
  letterSpacing: '0.06em',
  marginBottom: 6,
  textTransform: 'uppercase',
}

const qTextStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--report-text)',
  marginBottom: 12,
  lineHeight: 1.55,
}

const hintStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: 'var(--report-text-soft)',
  letterSpacing: '0.01em',
}

const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 48,
  padding: '0 28px',
  background: 'var(--report-accent)',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  height: 48,
  padding: '0 20px',
  background: 'none',
  border: '1.5px solid var(--report-border)',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--report-text-muted)',
  cursor: 'pointer',
}
