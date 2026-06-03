'use client'

import { useSelectedElementStore } from '@/store/selectedElementStore'
import { useReportStore } from '@/store/reportStore'
import { useCallback, useEffect, useRef, useState } from 'react'

export function InspectorPanel() {
  const { path, label, multiline, clear } = useSelectedElementStore()
  const getValueByPath = useReportStore((s) => s.getValueByPath)
  const setValueByPath = useReportStore((s) => s.setValueByPath)
  const pages = useReportStore((s) => s.pages)

  const [localValue, setLocalValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!path) return
    setLocalValue(getValueByPath(path))
    setTimeout(() => {
      if (multiline) textareaRef.current?.focus()
      else inputRef.current?.focus()
    }, 50)
  }, [path, getValueByPath, multiline])

  const handleChange = useCallback(
    (value: string) => {
      if (!path) return
      setLocalValue(value)
      setValueByPath(path, value)
    },
    [path, setValueByPath]
  )

  if (!path) return null

  const page = pages.find((p) => p.id === path.pageId)
  const sectionLabel = page ? `${page.sectionNumber} · ${page.sectionLabel}` : ''

  const inputClass = 'wk-input'
  const textareaClass = 'wk-textarea'

  return (
    <div
      data-inspector
      style={{
        position: 'fixed', top: 0, right: 0, width: 320, height: '100vh',
        background: '#fff', borderLeft: '1px solid var(--report-border)',
        boxShadow: '-4px 0 24px rgba(17,24,39,0.08)', zIndex: 200,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--report-border)', minHeight: 56,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--report-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
            {sectionLabel}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--report-text)' }}>
            {label}
          </div>
        </div>
        <button
          onClick={clear}
          style={{ width: 28, height: 28, border: '1px solid var(--report-border)', borderRadius: 999, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--report-text-muted)' }}
          aria-label="닫기"
        >✕</button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--report-text-soft)', marginBottom: 8 }}>텍스트 편집</div>
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            rows={6}
            className={textareaClass}
            style={{ resize: 'vertical', minHeight: 120 }}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={inputClass}
          />
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--report-text-soft)' }}>
          {multiline ? '줄바꿈은 Enter로 입력합니다.' : '변경 내용은 즉시 미리보기에 반영됩니다.'}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--report-border)', fontSize: 12, color: 'var(--report-text-soft)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#FD312E', flexShrink: 0 }} />
        다른 텍스트를 클릭하면 전환됩니다.
      </div>
    </div>
  )
}
