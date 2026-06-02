'use client'

import { useSelectedElementStore } from '@/store/selectedElementStore'
import { useReportStore } from '@/store/reportStore'
import { useCallback, useEffect, useRef, useState } from 'react'

const SECTION_LABEL: Record<string, string> = {
  scope: '보고 범위',
  overview: '개요',
  problem: '문제 정의',
  timeline: '추진 일정',
  tobe: '개선 방향',
  effect: '기대효과',
}

export function InspectorPanel() {
  const { target, clear } = useSelectedElementStore()
  const getValueByTarget = useReportStore((s) => s.getValueByTarget)
  const setValueByTarget = useReportStore((s) => s.setValueByTarget)
  const report = useReportStore((s) => s.report)

  const [localValue, setLocalValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync local value when target changes
  useEffect(() => {
    if (!target) return
    const v = getValueByTarget(target)
    setLocalValue(v)
    // Auto-focus the input after render
    setTimeout(() => {
      if (target.multiline) textareaRef.current?.focus()
      else inputRef.current?.focus()
    }, 50)
  }, [target, getValueByTarget])

  const handleChange = useCallback(
    (value: string) => {
      if (!target) return
      setLocalValue(value)
      setValueByTarget(target, value)
    },
    [target, setValueByTarget]
  )

  if (!target) return null

  const section = report.sections.find((s) => s.id === target.sectionId)
  const sectionLabel = section ? (SECTION_LABEL[section.type] ?? section.kicker) : ''

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 320,
        height: '100vh',
        background: '#fff',
        borderLeft: '1px solid var(--report-border)',
        boxShadow: '-4px 0 24px rgba(17,24,39,0.08)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--report-border)',
          minHeight: 56,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--report-text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            {sectionLabel}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--report-text)',
            }}
          >
            {target.label}
          </div>
        </div>
        <button
          onClick={clear}
          style={{
            width: 28,
            height: 28,
            border: '1px solid var(--report-border)',
            borderRadius: 999,
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            color: 'var(--report-text-muted)',
            flexShrink: 0,
          }}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--report-text-soft)',
            marginBottom: 8,
          }}
        >
          텍스트 편집
        </div>

        {target.multiline ? (
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '1.5px solid var(--report-border)',
              borderRadius: 'var(--report-radius-sm)',
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--report-text)',
              fontFamily: 'var(--font-sans)',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FD312E'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--report-border)'
            }}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid var(--report-border)',
              borderRadius: 'var(--report-radius-sm)',
              fontSize: 14,
              color: 'var(--report-text)',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FD312E'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--report-border)'
            }}
          />
        )}

        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: 'var(--report-text-soft)',
          }}
        >
          {target.multiline
            ? '줄바꿈은 Enter로 입력합니다.'
            : '변경 내용은 즉시 미리보기에 반영됩니다.'}
        </div>
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--report-border)',
          fontSize: 12,
          color: 'var(--report-text-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#FD312E',
            flexShrink: 0,
          }}
        />
        다른 텍스트를 클릭하면 전환됩니다.
      </div>
    </div>
  )
}
