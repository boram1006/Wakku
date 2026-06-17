'use client'

import { useState } from 'react'
import { PAGE_PATTERNS, PATTERN_CATEGORIES } from '@/patterns/pagePatterns'
import type { PatternCategory } from '@/patterns/pagePatterns'
import { useReportStore } from '@/store/reportStore'

interface Props {
  onClose: () => void
}

export function PagePatternExplorer({ onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<PatternCategory | 'all'>('all')
  const pages = useReportStore((s) => s.pages)
  const addPage = useReportStore((s) => s.addPage)
  const selectPage = useReportStore((s) => s.selectPage)

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
                페이지 패턴 선택
              </h2>
              <p style={{ margin: '6px 0 0', font: '400 13px/1.5 var(--font-kr,Inter,sans-serif)', color: '#6B7280' }}>
                표현하려는 내용에 맞는 레이아웃을 고르세요.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, border: 'none', background: '#F3F4F6', borderRadius: 8, cursor: 'pointer', fontSize: 16, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >✕</button>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 4, paddingBottom: 0 }}>
            {(['all', ...PATTERN_CATEGORIES] as const).map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
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
                  {cat === 'all' ? '전체' : cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filtered.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onSelect={(variantId) => handleSelect(pattern.id, variantId)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

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
      onMouseLeave={() => { setHovered(false) }}
      style={{
        display: 'flex', flexDirection: 'column', gap: 0,
        border: `2px solid ${showVariants ? '#FD312E' : hovered ? '#FD312E' : '#E5E7EB'}`,
        borderRadius: 14, background: showVariants ? '#FFF8F8' : hovered ? '#FFF8F8' : '#fff',
        overflow: 'hidden',
        transition: 'border-color .15s, background .15s, box-shadow .15s',
        boxShadow: (hovered || showVariants) ? '0 4px 16px rgba(253,49,46,.12)' : '0 1px 3px rgba(0,0,0,.06)',
        textAlign: 'left',
      }}
    >
      {/* Clickable main area */}
      <button
        onClick={handleCardClick}
        style={{
          display: 'flex', flexDirection: 'column', gap: 0,
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
        {/* Mini preview area */}
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

      {/* Variant picker — shown when hasVariants and card is clicked */}
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
