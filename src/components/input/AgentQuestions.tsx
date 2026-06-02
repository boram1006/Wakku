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

export function AgentQuestions({
  reportTitle,
  analysis,
  answers,
  onAnswer,
  onGenerate,
  onBack,
}: Props) {
  const { detectedSections, detectedKpis, questions } = analysis

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 40px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
            color: 'var(--report-accent)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 28,
              height: 2,
              background: 'var(--report-accent)',
            }}
          />
          분석 완료
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--report-text)',
          }}
        >
          자료를 분석했습니다
        </h2>
        <p
          style={{
            marginTop: 10,
            fontSize: 15,
            color: 'var(--report-text-muted)',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: 'var(--report-text)' }}>{reportTitle}</strong>
          {' — '}
          {questions.length > 0
            ? `보고자료를 완성하기 위해 ${questions.length}가지를 확인합니다.`
            : '추가 확인 없이 바로 생성할 수 있습니다.'}
        </p>
      </div>

      {/* 감지된 페이지 구조 */}
      <div
        style={{
          background: 'var(--report-bg-muted)',
          borderRadius: 'var(--report-radius-md)',
          padding: '20px 24px',
          marginBottom: 36,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--report-text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          감지된 페이지 구조 ({detectedSections.length}페이지)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {detectedSections.map((s, i) => (
            <span
              key={s}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                background: '#fff',
                border: '1px solid var(--report-border)',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--report-text)',
              }}
            >
              <span style={{ color: 'var(--report-accent)', fontWeight: 700 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {SECTION_LABEL[s] ?? s}
            </span>
          ))}
        </div>

        {detectedKpis.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--report-border)', paddingTop: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--report-text-muted)',
                marginBottom: 8,
              }}
            >
              감지된 수치
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {detectedKpis.map((k) => (
                <span
                  key={k}
                  style={{
                    padding: '3px 10px',
                    background: 'var(--report-accent-soft)',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--report-accent)',
                  }}
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 질문 */}
      {questions.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--report-text)',
              marginBottom: 20,
            }}
          >
            확인 질문 ({questions.length}개)
          </div>
          {questions.map((q, i) => (
            <div
              key={q.id}
              style={{
                borderLeft: '3px solid var(--report-accent-line)',
                paddingLeft: 20,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--report-accent)',
                  marginBottom: 6,
                }}
              >
                Q{i + 1}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--report-text)',
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}
              >
                {q.question}
              </div>
              {q.multiline ? (
                <textarea
                  value={answers[q.id] ?? ''}
                  onChange={(e) => onAnswer(q.id, e.target.value)}
                  placeholder={q.hint}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid var(--report-border)',
                    borderRadius: 'var(--report-radius-sm)',
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--report-text)',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.6,
                    boxSizing: 'border-box' as const,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#FD312E' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--report-border)' }}
                />
              ) : (
                <input
                  type="text"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => onAnswer(q.id, e.target.value)}
                  placeholder={q.hint}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid var(--report-border)',
                    borderRadius: 'var(--report-radius-sm)',
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--report-text)',
                    outline: 'none',
                    boxSizing: 'border-box' as const,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#FD312E' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--report-border)' }}
                />
              )}
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: 'var(--report-text-soft)',
                }}
              >
                입력하지 않으면 기본값으로 생성됩니다.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 액션 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onGenerate}
          style={{
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
          }}
        >
          보고자료 생성
          <span style={{ fontSize: 16 }}>→</span>
        </button>
        <button
          onClick={onBack}
          style={{
            height: 48,
            padding: '0 20px',
            background: 'none',
            border: '1.5px solid var(--report-border)',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--report-text-muted)',
            cursor: 'pointer',
          }}
        >
          ← 다시 입력
        </button>
      </div>
    </div>
  )
}
