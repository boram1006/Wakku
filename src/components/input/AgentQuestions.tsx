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
    <main style={{ display: 'flex', justifyContent: 'center', padding: '72px 32px 120px' }}>
      <div style={{ width: '100%', maxWidth: 760 }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 44 }}>
          <span className="wk-eyebrow">분석 완료</span>
          <h2 style={{ margin: '0 0 14px', font: '700 36px/48px var(--font-kr)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-neutral-900)' }}>
            자료를 분석했습니다
          </h2>
          <p style={{ margin: 0, font: '400 16px/26px var(--font-kr)', color: 'var(--color-neutral-500)', letterSpacing: 'var(--tracking-tight)' }}>
            <strong style={{ color: 'var(--color-neutral-900)', fontWeight: 700 }}>{reportTitle}</strong>
            {' — '}
            {questions.length > 0
              ? `보고자료를 완성하기 위해 ${questions.length}가지를 확인합니다.`
              : '추가 확인 없이 바로 생성할 수 있습니다.'}
          </p>
        </div>

        {/* 감지된 구조 카드 */}
        <div className="wk-struct-card" style={{ marginBottom: 44 }}>
          <div className="wk-card-label">
            감지된 페이지 구조 <span className="n">{detectedSections.length}페이지</span>
          </div>
          <div className="wk-struct">
            {detectedSections.map((s, i) => (
              <span key={s} className="wk-page-chip">
                <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="nm">{SECTION_LABEL[s] ?? s}</span>
              </span>
            ))}
          </div>

          {detectedKpis.length > 0 && (
            <>
              <div className="wk-card-divider" />
              <div className="wk-card-label">감지된 수치</div>
              <div className="wk-metrics">
                {detectedKpis.map((k) => (
                  <span key={k} className="wk-metric">{k}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 질문 */}
        {questions.length > 0 && (
          <div style={{ marginBottom: 44 }}>
            <div className="wk-block-label">
              확인 질문 <span className="n">{questions.length}개</span>
            </div>
            <div className="wk-qs">
              {questions.map((q, i) => (
                <div key={q.id} className="wk-q">
                  <span className="tag-q">Q{i + 1}</span>
                  <p className="qtext">{q.question}</p>
                  {q.multiline ? (
                    <textarea
                      className="wk-textarea wk-input"
                      value={answers[q.id] ?? ''}
                      onChange={(e) => onAnswer(q.id, e.target.value)}
                      placeholder={q.hint}
                      style={{ width: '100%', minHeight: 88, resize: 'none' }}
                    />
                  ) : (
                    <input
                      className="wk-input"
                      style={{ width: '100%' }}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => onAnswer(q.id, e.target.value)}
                      placeholder={q.hint}
                    />
                  )}
                  <span className="field-help">입력하지 않으면 기본값으로 생성됩니다.</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 */}
        <div className="wk-actions">
          <button className="wk-btn wk-btn-ghost" onClick={onBack}>← 다시 입력</button>
          <button className="wk-btn wk-btn-primary" onClick={onGenerate}>보고자료 생성 ›</button>
        </div>

      </div>
    </main>
  )
}
