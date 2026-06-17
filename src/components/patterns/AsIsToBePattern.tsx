'use client'

import { useState } from 'react'
import type { AsIsToBeItem } from '@/data/patternData'

interface Props {
  items: AsIsToBeItem[]
  title?: string
}

const IMPACT_COLOR: Record<AsIsToBeItem['impact'], string> = { high: '#FD312E', medium: '#F59E0B', low: '#10B981' }
const IMPACT_LABEL: Record<AsIsToBeItem['impact'], string> = { high: 'High', medium: 'Mid', low: 'Low' }

export function AsIsToBePattern({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [view, setView] = useState<'compare' | 'split'>('compare')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* View toggle — subtle, not dominant */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 2, padding: 3, background: '#F3F4F6', borderRadius: 8 }}>
          {(['compare', 'split'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '5px 13px', border: 'none', borderRadius: 6, cursor: 'pointer',
                font: `${view === v ? 700 : 400} 12px/1 Inter,sans-serif`,
                background: view === v ? '#fff' : 'transparent',
                color: view === v ? '#111827' : '#9CA3AF',
                boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                transition: 'all .12s',
              }}
            >
              {v === 'compare' ? '좌우 비교' : '항목별'}
            </button>
          ))}
        </div>
      </div>

      {view === 'compare' ? (
        /* Compare view: 2-col with center AI bridge */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 1fr', gap: 0, alignItems: 'stretch' }}>

          {/* AS-IS column */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '14px 0 0 14px', overflow: 'hidden' }}>
            <div style={{
              padding: '13px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
              font: '700 12px/1 Inter,sans-serif', color: '#9CA3AF', letterSpacing: '.05em',
              textAlign: 'center',
            }}>AS-IS</div>
            {items.map((item) => {
              const isActive = activeId === item.id
              const isHovered = hoveredId === item.id
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setActiveId(isActive ? null : item.id)}
                  style={{
                    padding: '14px 18px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer',
                    background: (isActive || isHovered) ? '#F3F4F6' : '#fff',
                    transition: 'background .15s',
                    minHeight: 68,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  }}
                >
                  <div style={{
                    font: '600 11px/1 Inter,sans-serif', color: '#C4C9D4',
                    letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 5,
                  }}>{item.dimension}</div>
                  <div style={{
                    font: '400 13px/1.5 var(--font-kr,Inter,sans-serif)',
                    color: (isActive || isHovered) ? '#6B7280' : '#9CA3AF',
                    transition: 'color .15s',
                  }}>{item.asIs}</div>
                </div>
              )
            })}
          </div>

          {/* Center AI bridge */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: '#fff',
          }}>
            {/* header spacer */}
            <div style={{ height: 43, borderBottom: '1px solid #E5E7EB', width: '100%', background: '#F9FAFB' }} />
            {/* AI bridge cells — one per row */}
            {items.map((item) => {
              const isActive = activeId === item.id
              const isHovered = hoveredId === item.id
              return (
                <div
                  key={item.id}
                  style={{
                    height: 68, width: '100%', borderBottom: '1px solid #F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 3,
                    background: (isActive || isHovered) ? '#FFF8F8' : '#fff',
                    transition: 'background .15s',
                  }}
                >
                  <div style={{ width: 1, flex: 1, background: (isActive || isHovered) ? '#FCA5A5' : '#E5E7EB', transition: 'background .2s' }} />
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    background: (isActive || isHovered) ? '#FD312E' : '#F3F4F6',
                    color: (isActive || isHovered) ? '#fff' : '#9CA3AF',
                    font: '700 9px/1 Inter,sans-serif',
                    transition: 'background .2s, color .2s',
                    letterSpacing: '.02em',
                  }}>AI</div>
                  <div style={{ width: 1, flex: 1, background: (isActive || isHovered) ? '#FCA5A5' : '#E5E7EB', transition: 'background .2s' }} />
                </div>
              )
            })}
          </div>

          {/* TO-BE column */}
          <div style={{ border: '1px solid #FFE0E0', borderRadius: '0 14px 14px 0', overflow: 'hidden' }}>
            <div style={{
              padding: '13px 20px', background: '#FFF5F5', borderBottom: '1px solid #FFE0E0',
              font: '700 12px/1 Inter,sans-serif', color: '#FD312E', letterSpacing: '.05em',
              textAlign: 'center',
            }}>TO-BE</div>
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
                      padding: '14px 18px', borderBottom: isActive ? 'none' : '1px solid #FFF0F0',
                      cursor: 'pointer',
                      background: (isActive || isHovered) ? '#FFF0F0' : '#fff',
                      transition: 'background .15s',
                      minHeight: 68,
                      display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{
                        font: '600 11px/1 Inter,sans-serif', color: '#FCA5A5',
                        letterSpacing: '.04em', textTransform: 'uppercase',
                      }}>{item.dimension}</div>
                      <span style={{
                        padding: '2px 7px', borderRadius: 999,
                        font: '700 10px/1 Inter,sans-serif',
                        background: `${IMPACT_COLOR[item.impact]}18`,
                        color: IMPACT_COLOR[item.impact],
                        flexShrink: 0,
                      }}>{IMPACT_LABEL[item.impact]}</span>
                    </div>
                    <div style={{
                      font: '500 13px/1.5 var(--font-kr,Inter,sans-serif)',
                      color: (isActive || isHovered) ? '#111827' : '#374151',
                      transition: 'color .15s',
                    }}>{item.toBe}</div>
                  </div>

                  {/* Expanded detail — under TO-BE cell */}
                  {isActive && item.detail && (
                    <div style={{
                      padding: '10px 18px 14px',
                      background: '#FFF8F8', borderBottom: '1px solid #FFF0F0',
                      font: '400 12px/1.6 var(--font-kr,Inter,sans-serif)', color: '#6B7280',
                    }}>
                      {item.detail}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      ) : (
        /* Split view: rows with AS-IS → center AI → TO-BE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                    display: 'grid', gridTemplateColumns: '120px 1fr 48px 1fr 52px',
                    gap: 10, padding: '13px 14px',
                    background: isActive ? '#FFF8F8' : isHovered ? '#FAFAFA' : '#fff',
                    border: `1px solid ${isActive ? '#FCA5A5' : isHovered ? '#E5E7EB' : '#F3F4F6'}`,
                    borderRadius: 10, cursor: 'pointer', alignItems: 'center',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ font: '600 12px/1.3 var(--font-kr,Inter,sans-serif)', color: '#374151' }}>{item.dimension}</div>

                  <div style={{
                    font: '400 12px/1.5 var(--font-kr,Inter,sans-serif)', color: '#9CA3AF',
                    padding: '7px 10px', background: isHovered ? '#F0F0F0' : '#F9FAFB', borderRadius: 7,
                    transition: 'background .15s',
                  }}>{item.asIs}</div>

                  {/* AI bridge arrow */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: (isActive || isHovered) ? '#FD312E' : '#F3F4F6',
                      color: (isActive || isHovered) ? '#fff' : '#9CA3AF',
                      font: '700 8px/1 Inter,sans-serif',
                      transition: 'background .2s, color .2s',
                    }}>AI</div>
                    <div style={{ color: (isActive || isHovered) ? '#FD312E' : '#D1D5DB', fontSize: 10, transition: 'color .2s' }}>→</div>
                  </div>

                  <div style={{
                    font: '500 12px/1.5 var(--font-kr,Inter,sans-serif)', color: '#111827',
                    padding: '7px 10px',
                    background: isActive ? '#FFF0F0' : isHovered ? '#FFF5F5' : '#fff',
                    border: `1px solid ${(isActive || isHovered) ? '#FFE0E0' : '#F3F4F6'}`,
                    borderRadius: 7, transition: 'background .15s, border-color .15s',
                  }}>{item.toBe}</div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 7px', borderRadius: 999,
                      font: '700 10px/1 Inter,sans-serif',
                      background: `${IMPACT_COLOR[item.impact]}18`,
                      color: IMPACT_COLOR[item.impact],
                    }}>{IMPACT_LABEL[item.impact]}</span>
                  </div>
                </div>

                {isActive && item.detail && (
                  <div style={{
                    margin: '2px 0 4px 14px', padding: '10px 14px',
                    background: '#fff', border: '1px solid #FFE4E4', borderRadius: 8,
                    font: '400 12px/1.6 var(--font-kr,Inter,sans-serif)', color: '#374151',
                  }}>
                    {item.detail}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Footer hint */}
      <div style={{ font: '400 11px/1 Inter,sans-serif', color: '#D1D5DB', textAlign: 'right' }}>
        항목을 클릭하면 상세 내용을 확인할 수 있습니다
      </div>
    </div>
  )
}
