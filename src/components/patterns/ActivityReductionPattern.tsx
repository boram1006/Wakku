'use client'

import { useState } from 'react'
import type { ActivityItem } from '@/data/patternData'

interface Props {
  items: ActivityItem[]
  headline?: string
}

export function ActivityReductionPattern({ items, headline }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const totalCurrent = items.reduce((s, i) => s + i.currentTime, 0)
  const totalReduced = items.reduce((s, i) => s + i.reducedTime, 0)
  const savedMin = totalCurrent - totalReduced
  const savedPct = Math.round((savedMin / totalCurrent) * 100)
  const autoCount = items.filter((i) => i.automatable).length
  const categories = Array.from(new Set(items.map((i) => i.category)))
  const barMax = Math.max(...items.map((i) => i.currentTime))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* 핵심 메시지 */}
      {headline && (
        <div style={{
          padding: '10px 16px',
          background: 'linear-gradient(90deg, #FFF0F0 0%, #fff 100%)',
          borderLeft: '3px solid #FD312E',
          borderRadius: '0 8px 8px 0',
          font: '500 13px/1.5 var(--font-kr,Inter,sans-serif)',
          color: '#374151',
        }}>{headline}</div>
      )}

      {/* Hero summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 0, border: '1px solid #E5E7EB',
        borderRadius: 16, overflow: 'hidden', background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
      }}>
        <div style={{ padding: '22px 28px' }}>
          <div style={{ font: '500 11px/1 Inter,sans-serif', color: '#9CA3AF', marginBottom: 10, letterSpacing: '.05em', textTransform: 'uppercase' }}>현재 총 업무시간</div>
          <div style={{ font: '700 32px/1 Inter,sans-serif', color: '#6B7280', letterSpacing: '-1.5px' }}>{totalCurrent}<span style={{ font: '500 14px/1 Inter,sans-serif', marginLeft: 4 }}>분</span></div>
          <div style={{ font: '400 12px/1 Inter,sans-serif', color: '#D1D5DB', marginTop: 8 }}>{Math.floor(totalCurrent / 60)}시간 {totalCurrent % 60}분</div>
        </div>

        {/* Center: big savings number */}
        <div style={{
          padding: '22px 36px', background: 'linear-gradient(135deg,#FFF0F0,#FFF8F8)',
          borderLeft: '1px solid #FFE0E0', borderRight: '1px solid #FFE0E0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ font: '500 11px/1 Inter,sans-serif', color: '#FCA5A5', marginBottom: 8, letterSpacing: '.05em', textTransform: 'uppercase' }}>절감 효과</div>
          <div style={{ font: '800 48px/1 Inter,sans-serif', color: '#FD312E', letterSpacing: '-2px' }}>-{savedPct}%</div>
          <div style={{ font: '500 12px/1 Inter,sans-serif', color: '#F87171', marginTop: 8 }}>{savedMin}분 단축</div>
        </div>

        <div style={{ padding: '22px 28px', textAlign: 'right' }}>
          <div style={{ font: '500 11px/1 Inter,sans-serif', color: '#9CA3AF', marginBottom: 10, letterSpacing: '.05em', textTransform: 'uppercase' }}>개선 후 업무시간</div>
          <div style={{ font: '700 32px/1 Inter,sans-serif', color: '#111827', letterSpacing: '-1.5px' }}>{totalReduced}<span style={{ font: '500 14px/1 Inter,sans-serif', marginLeft: 4 }}>분</span></div>
          <div style={{ font: '400 12px/1 Inter,sans-serif', color: '#10B981', marginTop: 8 }}>자동화 가능 {autoCount}건 포함</div>
        </div>
      </div>

      {/* Activity rows: hover reveals improvement */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {categories.map((cat) => (
          <div key={cat} style={{ marginBottom: 4 }}>
            <div style={{
              font: '700 10px/1 Inter,sans-serif', color: '#C4C9D4',
              letterSpacing: '.08em', textTransform: 'uppercase',
              padding: '0 4px 6px',
            }}>{cat}</div>

            {items.filter((i) => i.category === cat).map((item) => {
              const isExpanded = expandedId === item.id
              const isHovered = hoveredId === item.id
              const reductionPct = Math.round(((item.currentTime - item.reducedTime) / item.currentTime) * 100)
              const currentWidth = (item.currentTime / barMax) * 100
              const reducedWidth = (item.reducedTime / barMax) * 100
              // On hover/expand, show reduced bar; otherwise show current bar
              const barWidth = (isHovered || isExpanded) ? reducedWidth : currentWidth
              const barColor = (isHovered || isExpanded) ? '#FD312E' : '#D1D5DB'
              const timeDisplay = (isHovered || isExpanded) ? item.reducedTime : item.currentTime

              return (
                <div key={item.id}>
                  <div
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px',
                      background: isExpanded ? '#FFF8F8' : isHovered ? '#FAFAFA' : '#fff',
                      border: `1px solid ${isExpanded ? '#FCA5A5' : isHovered ? '#E5E7EB' : '#F3F4F6'}`,
                      borderRadius: 10, cursor: 'pointer',
                      transition: 'background .15s, border-color .15s',
                    }}
                  >
                    {/* Automatable dot */}
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: item.automatable ? '#10B981' : '#F59E0B',
                    }} />

                    {/* Activity name */}
                    <span style={{
                      flex: '0 0 148px', font: '500 13px/1.3 var(--font-kr,Inter,sans-serif)',
                      color: '#111827',
                    }}>
                      {item.activity}
                    </span>

                    {/* Single bar that transitions on hover */}
                    <div style={{ flex: 1, position: 'relative', height: 10, background: '#F3F4F6', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        width: `${barWidth}%`,
                        background: barColor,
                        borderRadius: 5,
                        transition: 'width .35s cubic-bezier(.4,0,.2,1), background .2s',
                      }} />
                    </div>

                    {/* Time display */}
                    <div style={{
                      width: 44, textAlign: 'right', flexShrink: 0,
                      font: '600 12px/1 Inter,sans-serif',
                      color: (isHovered || isExpanded) ? '#FD312E' : '#6B7280',
                      transition: 'color .15s',
                    }}>{timeDisplay}분</div>

                    {/* Reduction badge — always visible */}
                    <div style={{
                      flexShrink: 0, padding: '3px 8px', borderRadius: 8,
                      background: (isHovered || isExpanded) ? '#FEE2E2' : '#F3F4F6',
                      color: (isHovered || isExpanded) ? '#FD312E' : '#9CA3AF',
                      font: '700 11px/1 Inter,sans-serif',
                      transition: 'background .15s, color .15s',
                      minWidth: 42, textAlign: 'center',
                    }}>
                      -{reductionPct}%
                    </div>

                    {/* Chevron */}
                    {item.detail && (
                      <div style={{
                        color: '#D1D5DB', fontSize: 10, flexShrink: 0,
                        transition: 'transform .15s',
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                      }}>▼</div>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && item.detail && (
                    <div style={{
                      margin: '2px 0 4px 28px', padding: '10px 14px',
                      background: '#fff', border: '1px solid #FFE4E4', borderRadius: 8,
                      font: '400 13px/1.6 var(--font-kr,Inter,sans-serif)', color: '#374151',
                    }}>
                      {item.detail}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, paddingTop: 2 }}>
        {[
          { color: '#10B981', label: '자동화 가능' },
          { color: '#F59E0B', label: '부분 자동화' },
          { color: '#D1D5DB', label: '현재 시간', fill: true },
          { color: '#FD312E', label: 'hover 시 개선 후 시간', fill: true },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: label.includes('시간') ? 16 : 7, height: label.includes('시간') ? 6 : 7, borderRadius: label.includes('시간') ? 3 : '50%', background: color, flexShrink: 0 }} />
            <span style={{ font: '400 11px/1 Inter,sans-serif', color: '#B0B7C3' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
