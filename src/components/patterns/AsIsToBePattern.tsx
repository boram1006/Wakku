'use client'

import { useState } from 'react'
import type { AsIsToBeItem } from '@/data/patternData'

interface Props {
  items: AsIsToBeItem[]
  title?: string
}

const IMPACT_COLOR = { high: '#FD312E', medium: '#F59E0B', low: '#10B981' }
const IMPACT_LABEL = { high: 'High', medium: 'Mid', low: 'Low' }

export function AsIsToBePattern({ items, title }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [view, setView] = useState<'split' | 'compare'>('split')

  const activeItem = items.find((i) => i.id === activeId) ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: '#F3F4F6', borderRadius: 10, width: 'fit-content' }}>
        {(['split', 'compare'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '6px 16px', border: 'none', borderRadius: 7, cursor: 'pointer',
              font: `${view === v ? 700 : 500} 13px/1 Inter,sans-serif`,
              background: view === v ? '#fff' : 'transparent',
              color: view === v ? '#111827' : '#9CA3AF',
              boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              transition: 'all .12s',
            }}
          >
            {v === 'split' ? '항목 비교' : '통합 보기'}
          </button>
        ))}
      </div>

      {view === 'split' ? (
        /* Split view: rows with AS-IS → TO-BE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 32px 1fr 56px', gap: 12, padding: '0 16px 8px', borderBottom: '1px solid #F3F4F6' }}>
            {['구분', 'AS-IS', '', 'TO-BE', 'Impact'].map((h, i) => (
              <div key={i} style={{ font: '700 11px/1 Inter,sans-serif', color: '#9CA3AF', letterSpacing: '.04em', textAlign: i === 4 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          {items.map((item) => {
            const isActive = activeId === item.id
            const isHovered = hoveredId === item.id

            return (
              <div key={item.id}>
                <div
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setActiveId(isActive ? null : item.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '140px 1fr 32px 1fr 56px',
                    gap: 12, padding: '14px 16px',
                    background: isActive ? '#FFF8F8' : isHovered ? '#F9FAFB' : '#fff',
                    border: `1px solid ${isActive ? '#FCA5A5' : '#F3F4F6'}`,
                    borderRadius: 10, cursor: 'pointer', alignItems: 'center',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ font: '600 13px/1.3 var(--font-kr,Inter,sans-serif)', color: '#374151' }}>{item.dimension}</div>
                  <div style={{
                    font: '400 13px/1.5 var(--font-kr,Inter,sans-serif)', color: '#9CA3AF',
                    padding: '8px 12px', background: '#F9FAFB', borderRadius: 8,
                  }}>{item.asIs}</div>
                  <div style={{ textAlign: 'center', color: '#D1D5DB', fontSize: 18, fontWeight: 700 }}>→</div>
                  <div style={{
                    font: '500 13px/1.5 var(--font-kr,Inter,sans-serif)', color: '#111827',
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg,#FFF0F0 0%,#fff5f5 100%)',
                    border: '1px solid #FFE0E0', borderRadius: 8,
                  }}>{item.toBe}</div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px', borderRadius: 999,
                      font: '700 10px/1 Inter,sans-serif',
                      background: `${IMPACT_COLOR[item.impact]}18`,
                      color: IMPACT_COLOR[item.impact],
                    }}>{IMPACT_LABEL[item.impact]}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isActive && item.detail && (
                  <div style={{
                    margin: '4px 0 4px 16px', padding: '10px 14px',
                    background: '#fff', border: '1px solid #FFE0E0', borderRadius: 8,
                    font: '400 13px/1.6 var(--font-kr,Inter,sans-serif)', color: '#374151',
                  }}>
                    {item.detail}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Compare view: 2-col grid AS-IS left, TO-BE right */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* AS-IS column */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', font: '700 13px/1 Inter,sans-serif', color: '#9CA3AF', letterSpacing: '.04em' }}>AS-IS</div>
            {items.map((item) => (
              <div key={item.id} style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ font: '600 12px/1 Inter,sans-serif', color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{item.dimension}</div>
                <div style={{ font: '400 14px/1.5 var(--font-kr,Inter,sans-serif)', color: '#6B7280' }}>{item.asIs}</div>
              </div>
            ))}
          </div>
          {/* TO-BE column */}
          <div style={{ border: '1px solid #FFE0E0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: '#FFF0F0', borderBottom: '1px solid #FFE0E0', font: '700 13px/1 Inter,sans-serif', color: '#FD312E', letterSpacing: '.04em' }}>TO-BE</div>
            {items.map((item) => (
              <div key={item.id} style={{ padding: '14px 20px', borderBottom: '1px solid #FFF0F0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ font: '600 12px/1 Inter,sans-serif', color: '#FD312E', textTransform: 'uppercase', letterSpacing: '.04em' }}>{item.dimension}</div>
                  <span style={{ flexShrink: 0, padding: '2px 7px', borderRadius: 999, font: '700 10px/1 Inter,sans-serif', background: `${IMPACT_COLOR[item.impact]}18`, color: IMPACT_COLOR[item.impact] }}>{IMPACT_LABEL[item.impact]}</span>
                </div>
                <div style={{ font: '500 14px/1.5 var(--font-kr,Inter,sans-serif)', color: '#111827' }}>{item.toBe}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
