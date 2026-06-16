'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useReportStore } from '@/store/reportStore'
import type { LayoutType } from '@/types/report'
import { LAYOUT_LABELS, ALL_LAYOUTS } from '@/lib/pageDefaults'
import { PagePatternExplorer } from '@/components/patterns/PagePatternExplorer'

export function PageStructurePanel() {
  const pages = useReportStore((s) => s.pages)
  const selectedPageId = useReportStore((s) => s.selectedPageId)
  const addPage = useReportStore((s) => s.addPage)
  const removePage = useReportStore((s) => s.removePage)
  const movePage = useReportStore((s) => s.movePage)
  const changeLayoutType = useReportStore((s) => s.changeLayoutType)
  const updatePage = useReportStore((s) => s.updatePage)
  const selectPage = useReportStore((s) => s.selectPage)

  const [showPatternExplorer, setShowPatternExplorer] = useState(false)

  const handleSelectPage = (pageId: string) => {
    selectPage(pageId)
    document.getElementById(pageId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDelete = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation()
    if (pages.length <= 1) return
    removePage(pageId)
  }

  const handleMoveUp = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    if (index === 0) return
    movePage(index, index - 1)
  }

  const handleMoveDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    if (index === pages.length - 1) return
    movePage(index, index + 1)
  }

  const handleLayoutChange = (pageId: string, layoutType: LayoutType) => {
    changeLayoutType(pageId, layoutType)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 64,
        left: 0,
        width: 272,
        height: 'calc(100vh - 64px)',
        background: '#fff',
        borderRight: '1px solid var(--report-border)',
        boxShadow: '4px 0 20px rgba(17,24,39,0.06)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--report-text)' }}>
          페이지 구조
        </span>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowPatternExplorer(true)} style={addBtnStyle}>
            + 추가
          </button>
        </div>
      </div>

      {/* Page list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {pages.map((page, index) => {
          const isSelected = selectedPageId === page.id

          return (
            <div
              key={page.id}
              onClick={() => handleSelectPage(page.id)}
              style={pageItemStyle(isSelected)}
            >
              {/* Row: number + label + actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={sectionNumStyle(isSelected)}>{page.sectionNumber}</span>
                  <span style={sectionLabelStyle}>{page.sectionLabel}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button
                    disabled={index === 0}
                    onClick={(e) => handleMoveUp(e, index)}
                    style={actionBtnStyle(index === 0)}
                    title="위로"
                  >
                    ↑
                  </button>
                  <button
                    disabled={index === pages.length - 1}
                    onClick={(e) => handleMoveDown(e, index)}
                    style={actionBtnStyle(index === pages.length - 1)}
                    title="아래로"
                  >
                    ↓
                  </button>
                  <button
                    disabled={pages.length <= 1}
                    onClick={(e) => handleDelete(e, page.id)}
                    style={actionBtnStyle(pages.length <= 1)}
                    title="삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Title preview */}
              <div style={titlePreviewStyle}>
                {page.title.replace(/\n/g, ' ')}
              </div>

              {/* layoutType tag */}
              <span style={layoutTagStyle}>{LAYOUT_LABELS[page.layoutType]}</span>

              {/* Expanded detail when selected */}
              {isSelected && (
                <div
                  style={{ marginTop: 12 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ marginBottom: 10 }}>
                    <div style={detailLabelStyle}>제목</div>
                    <input
                      className="wk-input"
                      value={page.title.replace(/\n/g, ' ')}
                      onChange={(e) => updatePage(page.id, { title: e.target.value })}
                      placeholder="페이지 제목"
                    />
                  </div>
                  <div>
                    <div style={detailLabelStyle}>레이아웃</div>
                    <select
                      value={page.layoutType}
                      onChange={(e) => handleLayoutChange(page.id, e.target.value as LayoutType)}
                      style={selectStyle}
                    >
                      {ALL_LAYOUTS.map((lt) => (
                        <option key={lt} value={lt}>
                          {LAYOUT_LABELS[lt]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <span style={{ color: 'var(--report-text-soft)', fontSize: 11 }}>
          {pages.length}개 페이지
        </span>
      </div>

      {/* Pattern Explorer modal */}
      {showPatternExplorer && (
        <PagePatternExplorer onClose={() => setShowPatternExplorer(false)} />
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 14px',
  borderBottom: '1px solid var(--report-border)',
  flexShrink: 0,
}

const addBtnStyle: CSSProperties = {
  height: 28,
  padding: '0 12px',
  background: 'var(--report-accent)',
  border: 'none',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  color: '#fff',
  cursor: 'pointer',
}

const addMenuStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: 4,
  background: '#fff',
  border: '1px solid var(--report-border)',
  borderRadius: 'var(--report-radius-sm)',
  boxShadow: 'var(--report-shadow-card)',
  zIndex: 300,
  minWidth: 176,
  overflow: 'hidden',
}

const addMenuItemStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '9px 14px',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--report-border)',
  fontSize: 12,
  color: 'var(--report-text)',
  cursor: 'pointer',
}

function pageItemStyle(isSelected: boolean): CSSProperties {
  return {
    padding: '12px 14px',
    borderBottom: '1px solid var(--report-border)',
    borderLeft: isSelected ? '3px solid var(--report-accent)' : '3px solid transparent',
    background: isSelected ? 'var(--report-accent-soft)' : 'transparent',
    cursor: 'pointer',
  }
}

function sectionNumStyle(isSelected: boolean): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: isSelected ? 'var(--report-accent)' : 'var(--report-text-soft)',
    minWidth: 18,
    flexShrink: 0,
  }
}

const sectionLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--report-text-muted)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

function actionBtnStyle(disabled: boolean): CSSProperties {
  return {
    width: 22,
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: '1px solid var(--report-border)',
    borderRadius: 4,
    fontSize: 10,
    color: disabled ? 'var(--report-text-soft)' : 'var(--report-text-muted)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    padding: 0,
  }
}

const titlePreviewStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--report-text)',
  lineHeight: 1.3,
  marginBottom: 6,
  marginTop: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const layoutTagStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--report-text-soft)',
  background: 'var(--report-bg-muted)',
  borderRadius: 4,
  padding: '2px 6px',
}

const detailLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--report-text-soft)',
  marginBottom: 4,
}

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  fontSize: 12,
  border: '1px solid var(--report-border)',
  borderRadius: 'var(--report-radius-sm)',
  background: '#fff',
  color: 'var(--report-text)',
  cursor: 'pointer',
  appearance: 'auto',
}

const footerStyle: CSSProperties = {
  padding: '10px 14px',
  borderTop: '1px solid var(--report-border)',
  flexShrink: 0,
}
