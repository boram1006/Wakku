'use client'

import { useState } from 'react'
import type { ActivityItem } from '@/data/patternData'

interface Props {
  items: ActivityItem[]
  title?: string
}

export function ActivityReductionPattern({ items, title }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const categories = Array.from(new Set(items.map((i) => i.category)))
  const totalCurrent = items.reduce((s, i) => s + i.currentTime, 0)
  const totalReduced = items.reduce((s, i) => s + i.reducedTime, 0)
  const savedPct = Math.round(((totalCurrent - totalReduced) / totalCurrent) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        border: '1px solid var(--report-border, #E5E7EB)',
        borderRadius: 14, overflow: 'hidden', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
      }}>
        {[
          { label: '현재 총 소요시간', value: `${totalCurrent}분`, sub: `${Math.floor(totalCurrent/60)}시간 ${totalCurrent%60}분` },
          { label: '개선 후 소요시간', value: `${totalReduced}분`, sub: `${Math.floor(totalReduced/60)}시간 ${totalReduced%60}분` },
          { label: '절감 효과', value: `${savedPct}%`, sub: `${totalCurrent - totalReduced}분 단축`, highlight: true },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '20px 24px',
            borderRight: i < 2 ? '1px solid var(--report-border, #E5E7EB)' : undefined,
            background: stat.highlight ? 'linear-gradient(135deg,#FFF0F0 0%,#fff 100%)' : '#fff',
          }}>
            <div style={{ font: '500 12px/1 Inter,sans-serif', color: '#9CA3AF', marginBottom: 8, letterSpacing: '.02em' }}>{stat.label}</div>
            <div style={{ font: `700 28px/1 Inter,sans-serif`, color: stat.highlight ? '#FD312E' : '#111827', letterSpacing: '-1px', marginBottom: 4 }}>{stat.value}</div>
            <div style={{ font: '400 12px/1 Inter,sans-serif', color: '#9CA3AF' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Activity rows grouped by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map((cat) => (
          <div key={cat}>
            <div style={{ font: '700 11px/1 Inter,sans-serif', color: '#9CA3AF', letterSpacing: '.06em', textTransform: 'uppercase', padding: '0 4px 8px' }}>{cat}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.filter((item) => item.category === cat).map((item) => {
                const isExpanded = expandedId === item.id
                const isHovered = hoveredId === item.id
                const reductionPct = Math.round(((item.currentTime - item.reducedTime) / item.currentTime) * 100)
                const barMax = Math.max(...items.map((i) => i.currentTime))

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    style={{
                      background: isExpanded ? '#FFF8F8' : isHovered ? '#F9FAFB' : '#fff',
                      border: `1px solid ${isExpanded ? '#FCA5A5' : isHovered ? '#E5E7EB' : '#F3F4F6'}`,
                      borderRadius: 10, padding: '14px 16px',
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    {/* Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Automatable badge */}
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: item.automatable ? '#10B981' : '#F59E0B',
                      }} title={item.automatable ? '자동화 가능' : '부분 자동화'} />

                      {/* Activity name */}
                      <span style={{ flex: '0 0 160px', font: '500 14px/1.3 var(--font-kr,Inter,sans-serif)', color: '#111827' }}>
                        {item.activity}
                      </span>

                      {/* Bar comparison */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Current bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, font: '400 11px/1 Inter,sans-serif', color: '#9CA3AF', textAlign: 'right', flexShrink: 0 }}>현재</div>
                          <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${(item.currentTime / barMax) * 100}%`, height: '100%', background: '#D1D5DB', borderRadius: 4, transition: 'width .3s' }} />
                          </div>
                          <div style={{ width: 40, font: '600 12px/1 Inter,sans-serif', color: '#6B7280', textAlign: 'right', flexShrink: 0 }}>{item.currentTime}분</div>
                        </div>
                        {/* Improved bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, font: '400 11px/1 Inter,sans-serif', color: '#9CA3AF', textAlign: 'right', flexShrink: 0 }}>개선</div>
                          <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${(item.reducedTime / barMax) * 100}%`, height: '100%', background: '#FD312E', borderRadius: 4, transition: 'width .3s' }} />
                          </div>
                          <div style={{ width: 40, font: '600 12px/1 Inter,sans-serif', color: '#FD312E', textAlign: 'right', flexShrink: 0 }}>{item.reducedTime}분</div>
                        </div>
                      </div>

                      {/* Reduction badge */}
                      <div style={{
                        flexShrink: 0, width: 52, textAlign: 'center',
                        padding: '4px 0', borderRadius: 8,
                        background: '#FFF0F0', color: '#FD312E',
                        font: '700 13px/1 Inter,sans-serif',
                      }}>
                        -{reductionPct}%
                      </div>

                      {/* Expand chevron */}
                      {item.detail && (
                        <div style={{ color: '#D1D5DB', fontSize: 12, transition: 'transform .15s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</div>
                      )}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && item.detail && (
                      <div style={{
                        marginTop: 12, padding: '10px 14px',
                        background: '#fff', borderRadius: 8,
                        border: '1px solid #FFE0E0',
                        font: '400 13px/1.6 var(--font-kr,Inter,sans-serif)',
                        color: '#374151',
                      }}>
                        {item.detail}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
        {[{ color: '#10B981', label: '자동화 가능' }, { color: '#F59E0B', label: '부분 자동화' }].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ font: '400 12px/1 Inter,sans-serif', color: '#9CA3AF' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
