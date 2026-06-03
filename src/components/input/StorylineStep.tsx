'use client'

import type { Storyline } from '@/types/storyline'

const PAGE_ROLE_LABEL: Record<string, string> = {
  hook:       '도입',
  context:    '배경',
  scope:      '범위',
  problem:    '문제',
  evidence:   '근거',
  decision:   '의사결정',
  solution:   '해결책',
  effect:     '효과',
  'to-be':    'To-Be',
  execution:  '실행',
  risk:       '리스크',
  'next-step':'다음 단계',
  appendix:   '부록',
}

interface Props {
  reportTitle: string
  storylines: Storyline[]
  selectedId: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  onBack: () => void
}

export function StorylineStep({
  reportTitle,
  storylines,
  selectedId,
  onSelect,
  onConfirm,
  onBack,
}: Props) {
  return (
    <main style={{ padding: '72px 32px 120px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 44 }}>
          <span className="wk-eyebrow">스토리라인 선택</span>
          <h2 style={{
            margin: '0 0 14px',
            font: '700 36px/48px var(--font-kr)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-neutral-900)',
          }}>
            설득 전략을 선택하세요
          </h2>
          <p style={{
            margin: 0,
            font: '400 16px/26px var(--font-kr)',
            color: 'var(--color-neutral-500)',
            letterSpacing: 'var(--tracking-tight)',
          }}>
            <strong style={{ color: 'var(--color-neutral-900)', fontWeight: 700 }}>{reportTitle}</strong>
            {' — '}
            보고 목적에 가장 맞는 스토리라인을 고르면 그에 맞는 페이지 구성으로 생성됩니다.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 48,
          alignItems: 'start',
        }}>
          {storylines.map((storyline, index) => {
            const isSelected = storyline.id === selectedId
            const isRecommended = index === 0

            return (
              <div
                key={storyline.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(storyline.id)}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(storyline.id)}
                style={{
                  cursor: 'pointer',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-neutral-100)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  background: isSelected ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                  boxShadow: isSelected ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  outline: 'none',
                }}
              >
                {/* Card header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    {isRecommended && (
                      <span style={{
                        display: 'inline-block',
                        marginBottom: 6,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        font: '700 11px/16px var(--font-sans)',
                        letterSpacing: 'var(--tracking-caption)',
                      }}>
                        추천
                      </span>
                    )}
                    <div style={{
                      font: '700 17px/24px var(--font-kr)',
                      color: 'var(--color-neutral-900)',
                      letterSpacing: 'var(--tracking-tight)',
                    }}>
                      {storyline.name}
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: isRecommended ? 22 : 2,
                    }}>
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* One-line summary */}
                <div style={{
                  font: '400 13px/20px var(--font-kr)',
                  color: 'var(--color-neutral-500)',
                  letterSpacing: 'var(--tracking-tight)',
                }}>
                  {storyline.oneLineSummary}
                </div>

                {/* Key message */}
                <div style={{
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(253,49,46,0.08)' : 'var(--color-neutral-30)',
                  padding: '12px 14px',
                }}>
                  <div style={{
                    font: '600 10px/14px var(--font-sans)',
                    color: 'var(--color-neutral-500)',
                    letterSpacing: 'var(--tracking-caption)',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}>
                    핵심 메시지
                  </div>
                  <div style={{
                    font: '500 13px/21px var(--font-kr)',
                    color: 'var(--color-neutral-800)',
                    letterSpacing: 'var(--tracking-tight)',
                  }}>
                    {storyline.keyMessage}
                  </div>
                </div>

                {/* Recommended reason */}
                <div style={{
                  font: '400 12px/18px var(--font-kr)',
                  color: 'var(--color-neutral-500)',
                  letterSpacing: 'var(--tracking-tight)',
                  borderLeft: `3px solid ${isRecommended ? 'var(--color-primary)' : 'var(--color-neutral-200)'}`,
                  paddingLeft: 10,
                }}>
                  {storyline.recommendedReason}
                </div>

                {/* Narrative flow */}
                <div>
                  <div style={{
                    font: '600 10px/14px var(--font-sans)',
                    color: 'var(--color-neutral-500)',
                    letterSpacing: 'var(--tracking-caption)',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    설득 흐름
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {storyline.narrativeFlow.map((flowStep, i) => (
                      <li
                        key={i}
                        style={{
                          font: '400 13px/18px var(--font-kr)',
                          color: 'var(--color-neutral-700)',
                          letterSpacing: 'var(--tracking-tight)',
                        }}
                      >
                        {flowStep}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Page plan */}
                <div>
                  <div style={{
                    font: '600 10px/14px var(--font-sans)',
                    color: 'var(--color-neutral-500)',
                    letterSpacing: 'var(--tracking-caption)',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    예상 페이지 구성
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                    {storyline.pagePlan.map((page, i) => (
                      <span key={page.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-neutral-100)',
                          font: '500 11px/16px var(--font-sans)',
                          color: 'var(--color-neutral-700)',
                        }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-neutral-400)', fontSize: 10 }}>{i + 1}</span>
                          {PAGE_ROLE_LABEL[page.role] ?? page.role}
                        </span>
                        {i < storyline.pagePlan.length - 1 && (
                          <span style={{ fontSize: 10, color: 'var(--color-neutral-300)', lineHeight: 1 }}>›</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="wk-actions">
          <button className="wk-btn wk-btn-ghost" onClick={onBack}>← 다시 입력</button>
          <button
            className="wk-btn wk-btn-primary"
            onClick={onConfirm}
            disabled={!selectedId}
          >
            이 스토리라인으로 생성 ›
          </button>
        </div>

      </div>
    </main>
  )
}
