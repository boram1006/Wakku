'use client'

import { useState } from 'react'
import { PAGE_PATTERNS, PATTERN_CATEGORIES } from '@/patterns/pagePatterns'
import type { PatternCategory } from '@/patterns/pagePatterns'
import { REPORT_ARCHETYPES, INTERACTIVE_LAYOUT_TYPES } from '@/data/archetypeData'
import { useReportStore } from '@/store/reportStore'

interface Props {
  onClose: () => void
}

type TabMode = 'patterns' | 'templates'

export function PagePatternExplorer({ onClose }: Props) {
  const [tab, setTab] = useState<TabMode>('patterns')
  const [activeCategory, setActiveCategory] = useState<PatternCategory | 'all'>('all')
  const pages = useReportStore((s) => s.pages)
  const addPage = useReportStore((s) => s.addPage)
  const selectPage = useReportStore((s) => s.selectPage)
  const setPages = useReportStore((s) => s.setPages)

  const filtered = activeCategory === 'all'
    ? PAGE_PATTERNS
    : PAGE_PATTERNS.filter((p) => p.category === activeCategory)

  function handleSelect(patternId: string, variantId?: string) {
    const pattern = PAGE_PATTERNS.find((p) => p.id === patternId)
    if (!pattern) return
    const newPage = pattern.createPage(pages, variantId)
    addPage(newPage)
    selectPage(newPage.id)
    setTimeout(() => {
      document.getElementById(newPage.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    onClose()
  }

  function handleApplyArchetype(archetypeId: string) {
    const archetype = REPORT_ARCHETYPES.find((a) => a.id === archetypeId)
    if (!archetype) return
    const newPages = archetype.createPages()
    setPages(newPages)
    selectPage(newPages[0]?.id ?? null)
    setTimeout(() => {
      document.getElementById(newPages[0]?.id ?? '')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 399, background: 'rgba(17,24,39,.45)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 400,
        width: 'min(760px, calc(100vw - 48px))',
        maxHeight: 'calc(100vh - 80px)',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 24px 64px rgba(17,24,39,.22)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 0', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, font: '700 20px/1.3 var(--font-kr,Inter,sans-serif)', color: '#111111', letterSpacing: '-.5px' }}>
                {tab === 'patterns' ? '페이지 패턴 선택' : '리포트 템플릿'}
              </h2>
              <p style={{ margin: '6px 0 0', font: '400 13px/1.5 var(--font-kr,Inter,sans-serif)', color: '#6B7280' }}>
                {tab === 'patterns'
                  ? '표현하려는 내용에 맞는 레이아웃을 고르세요.'
                  : '검증된 보고 흐름으로 전체 보고서를 한 번에 시작하세요.'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, border: 'none', background: '#F3F4F6', borderRadius: 8, cursor: 'pointer', fontSize: 16, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >✕</button>
          </div>

          {/* Top-level tab switcher + category tabs */}
          <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end' }}>
            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: 2, marginRight: 16, borderRight: '1px solid #E5E7EB', paddingRight: 16 }}>
              {(['patterns', 'templates'] as TabMode[]).map((t) => {
                const active = tab === t
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '7px 14px', border: 'none', borderRadius: '8px 8px 0 0',
                      cursor: 'pointer',
                      font: `${active ? 700 : 500} 13px/1 var(--font-kr,Inter,sans-serif)`,
                      background: active ? '#fff' : 'transparent',
                      color: active ? '#111111' : '#9CA3AF',
                      borderBottom: active ? '2px solid #FD312E' : '2px solid transparent',
                      transition: 'color .12s',
                    }}
                  >
                    {t === 'patterns' ? '페이지 추가' : '리포트 템플릿'}
                  </button>
                )
              })}
            </div>

            {/* Category tabs (only in patterns mode) */}
            {tab === 'patterns' && (
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all', ...PATTERN_CATEGORIES] as const).map((cat) => {
                  const active = activeCategory === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: '7px 12px', border: 'none', borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        font: `${active ? 700 : 500} 12px/1 var(--font-kr,Inter,sans-serif)`,
                        background: active ? '#fff' : 'transparent',
                        color: active ? '#111111' : '#9CA3AF',
                        borderBottom: active ? '2px solid #FD312E' : '2px solid transparent',
                        transition: 'color .12s',
                      }}
                    >
                      {cat === 'all' ? '전체' : cat}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 28px' }}>
          {tab === 'patterns' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {filtered.map((pattern) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  onSelect={(variantId) => handleSelect(pattern.id, variantId)}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {REPORT_ARCHETYPES.map((archetype) => (
                <ArchetypeCard
                  key={archetype.id}
                  archetype={archetype}
                  onApply={() => handleApplyArchetype(archetype.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── PatternCard ───────────────────────────────────────────────────────────────

function PatternCard({
  pattern,
  onSelect,
}: {
  pattern: typeof PAGE_PATTERNS[0]
  onSelect: (variantId?: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [showVariants, setShowVariants] = useState(false)

  const hasVariants = pattern.variants && pattern.variants.length > 1

  function handleCardClick() {
    if (hasVariants) {
      setShowVariants((v) => !v)
    } else {
      onSelect(undefined)
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        border: `2px solid ${showVariants ? '#FD312E' : hovered ? '#FD312E' : '#E5E7EB'}`,
        borderRadius: 14,
        background: showVariants ? '#FFF8F8' : hovered ? '#FFF8F8' : '#fff',
        overflow: 'hidden',
        transition: 'border-color .15s, background .15s, box-shadow .15s',
        boxShadow: (hovered || showVariants) ? '0 4px 16px rgba(253,49,46,.12)' : '0 1px 3px rgba(0,0,0,.06)',
        textAlign: 'left',
      }}
    >
      <button
        onClick={handleCardClick}
        style={{
          display: 'flex', flexDirection: 'column',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
        {/* Preview area */}
        <div style={{
          background: '#F9FAFB', padding: '16px 16px 12px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex', flexDirection: 'column', gap: 10,
          minHeight: 88,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              display: 'inline-block', padding: '3px 8px', borderRadius: 999,
              background: (hovered || showVariants) ? 'rgba(253,49,46,.1)' : '#E5E7EB',
              color: (hovered || showVariants) ? '#FD312E' : '#6B7280',
              font: '700 10px/1 Inter,sans-serif', letterSpacing: '.04em', textTransform: 'uppercase',
              transition: 'background .15s, color .15s',
            }}>
              {pattern.layoutType}
            </span>
            <span style={{ font: '400 10px/1 Inter,sans-serif', color: '#D1D5DB' }}>{pattern.category}</span>
          </div>
          {pattern.previewLines.map((line, i) => (
            <div key={i} style={{
              font: `${i === 0 ? 600 : 400} ${i === 0 ? 11 : 10}px/1.5 Inter,sans-serif`,
              color: i === 0 ? '#374151' : '#9CA3AF',
              letterSpacing: i === 0 ? '-.2px' : 0,
              whiteSpace: 'pre',
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* Name + description */}
        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ font: '700 13px/1.3 var(--font-kr,Inter,sans-serif)', color: '#111111', marginBottom: 5 }}>
            {pattern.name}
          </div>
          <div style={{ font: '400 12px/1.5 var(--font-kr,Inter,sans-serif)', color: '#6B7280' }}>
            {pattern.description}
          </div>
        </div>
      </button>

      {/* Variant picker */}
      {hasVariants && (
        <div style={{
          borderTop: `1px solid ${showVariants ? '#FFE0E0' : '#F3F4F6'}`,
          background: showVariants ? '#FFF5F5' : '#FAFAFA',
          padding: showVariants ? '10px 12px 12px' : '6px 12px',
          transition: 'background .15s',
        }}>
          {showVariants ? (
            <>
              <div style={{ font: '600 10px/1 Inter,sans-serif', color: '#FCA5A5', letterSpacing: '.06em', marginBottom: 8 }}>
                샘플 데이터 선택
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {pattern.variants!.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onSelect(v.id)}
                    style={{
                      width: '100%', border: '1px solid #FFE0E0', borderRadius: 8,
                      background: '#fff', cursor: 'pointer', padding: '8px 10px',
                      textAlign: 'left', transition: 'background .1s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF0F0' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
                  >
                    <div style={{ font: '700 12px/1 var(--font-kr,Inter,sans-serif)', color: '#FD312E', marginBottom: 4 }}>
                      {v.label}
                    </div>
                    <div style={{ font: '400 11px/1.4 var(--font-kr,Inter,sans-serif)', color: '#6B7280' }}>
                      {v.headline}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ font: '400 11px/1 Inter,sans-serif', color: '#C4C9D4', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>샘플 {pattern.variants!.length}개</span>
              <span style={{ fontSize: 9 }}>▼</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── ArchetypeCard ─────────────────────────────────────────────────────────────

function ArchetypeCard({
  archetype,
  onApply,
}: {
  archetype: typeof REPORT_ARCHETYPES[0]
  onApply: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirming(false) }}
      style={{
        border: `2px solid ${hovered ? '#FD312E' : '#E5E7EB'}`,
        borderRadius: 16,
        background: hovered ? '#FFF8F8' : '#fff',
        overflow: 'hidden',
        transition: 'border-color .15s, background .15s, box-shadow .15s',
        boxShadow: hovered ? '0 4px 20px rgba(253,49,46,.1)' : '0 1px 4px rgba(0,0,0,.06)',
      }}
    >
      <div style={{ padding: '20px 24px 0' }}>
        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ font: '700 16px/1.3 var(--font-kr,Inter,sans-serif)', color: '#111111', marginBottom: 3 }}>
              {archetype.name}
            </div>
            <div style={{ font: '500 13px/1 var(--font-kr,Inter,sans-serif)', color: '#FD312E' }}>
              {archetype.tagline}
            </div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: '#F3F4F6', color: '#6B7280',
            font: '600 11px/1 Inter,sans-serif',
            flexShrink: 0, marginLeft: 12,
          }}>
            {archetype.pageFlow.length}페이지
          </span>
        </div>

        {/* Description */}
        <p style={{ margin: '10px 0 14px', font: '400 13px/1.6 var(--font-kr,Inter,sans-serif)', color: '#6B7280' }}>
          {archetype.description}
        </p>

        {/* Page flow pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {archetype.pageFlow.map((p, i) => {
            const isInteractive = INTERACTIVE_LAYOUT_TYPES.has(p.layoutType)
            return (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 999,
                font: `${isInteractive ? 700 : 500} 11px/1 var(--font-kr,Inter,sans-serif)`,
                background: isInteractive ? '#FFF0F0' : '#F3F4F6',
                color: isInteractive ? '#FD312E' : '#6B7280',
                border: `1px solid ${isInteractive ? '#FFD0D0' : 'transparent'}`,
              }}>
                <span style={{ font: '400 10px/1 Inter,sans-serif', color: isInteractive ? '#FCA5A5' : '#C4C9D4' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {p.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Action bar */}
      <div style={{
        padding: '12px 24px 16px',
        background: hovered ? '#FFF5F5' : '#FAFAFA',
        borderTop: `1px solid ${hovered ? '#FFE0E0' : '#F3F4F6'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background .15s',
      }}>
        {confirming ? (
          <>
            <span style={{ font: '500 12px/1.4 var(--font-kr,Inter,sans-serif)', color: '#9CA3AF' }}>
              현재 보고서가 템플릿으로 교체됩니다.
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8,
                  background: '#fff', cursor: 'pointer',
                  font: '500 12px/1 var(--font-kr,Inter,sans-serif)', color: '#6B7280',
                }}
              >취소</button>
              <button
                onClick={onApply}
                style={{
                  padding: '7px 16px', border: 'none', borderRadius: 8,
                  background: '#FD312E', cursor: 'pointer',
                  font: '700 12px/1 var(--font-kr,Inter,sans-serif)', color: '#fff',
                }}
              >교체 적용</button>
            </div>
          </>
        ) : (
          <>
            <span style={{ font: '400 11px/1 Inter,sans-serif', color: '#C4C9D4' }}>
              ✦ 표시 = Interactive Pattern 포함
            </span>
            <button
              onClick={() => setConfirming(true)}
              style={{
                padding: '8px 20px', border: 'none', borderRadius: 8,
                background: hovered ? '#FD312E' : '#F3F4F6',
                color: hovered ? '#fff' : '#374151',
                cursor: 'pointer',
                font: '700 13px/1 var(--font-kr,Inter,sans-serif)',
                transition: 'background .15s, color .15s',
              }}
            >
              이 템플릿으로 시작
            </button>
          </>
        )}
      </div>
    </div>
  )
}
