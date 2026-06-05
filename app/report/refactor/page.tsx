'use client'

import { useState, useRef } from 'react'

type Stage = 'idle' | 'loading' | 'done' | 'error'
type Viewport = '1920' | '1440' | '1200'

const VIEWPORTS: Viewport[] = ['1920', '1440', '1200']

function injectViewportClass(html: string, viewport: Viewport): string {
  const cls = `report-viewport-${viewport}`
  const stripped = html.replace(/\breport-viewport-\d+\b/g, '').replace(/class="(\s*)"/g, 'class=""')
  if (/<body([^>]*)>/i.test(stripped)) {
    return stripped.replace(/<body([^>]*)>/i, (_, attrs: string) => {
      if (/class=/i.test(attrs)) {
        return `<body${attrs.replace(/class="([^"]*)"/i, (__, c) => `class="${(c.trim() + ' ' + cls).trim()}"`)}>`
      }
      return `<body${attrs} class="${cls}">`
    })
  }
  return stripped
}

export default function RefactorPage() {
  const [html, setHtml] = useState('')
  const [result, setResult] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState('')
  const [viewport, setViewport] = useState<Viewport>('1920')
  const [streamedChars, setStreamedChars] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleRefactor() {
    if (!html.trim()) return
    setStage('loading')
    setError('')
    setResult('')
    setStreamedChars(0)

    try {
      const res = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamedChars(accumulated.length)
      }

      const htmlMatch =
        accumulated.match(/<!DOCTYPE\s+html[\s\S]*<\/html>/i) ??
        accumulated.match(/<html[\s\S]*<\/html>/i)

      if (!htmlMatch) throw new Error('유효한 HTML을 추출할 수 없습니다.')

      setResult(htmlMatch[0])
      setStage('done')
    } catch (e) {
      setError(String(e))
      setStage('error')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setHtml(ev.target?.result as string)
    reader.readAsText(file, 'utf-8')
  }

  function handleDownload() {
    const blob = new Blob([result], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report-v1.2.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
  }

  const charCount = html.length
  const overLimit = charCount > 200_000
  const previewHtml = result ? injectViewportClass(result, viewport) : ''

  return (
    <main style={{
      display: 'flex',
      justifyContent: 'center',
      padding: stage === 'done' ? '40px 24px 80px' : '72px 32px 120px',
      minHeight: '100vh',
    }}>
      <div style={{ width: '100%', maxWidth: stage === 'done' ? 'none' : 860 }}>

        {/* 상단 네비 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: stage === 'done' ? 24 : 44 }}>
          <a href="/report/create" style={{ font: '700 15px/1 var(--font-kr)', color: 'var(--color-neutral-900)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>W</span>
            <span>Wakku</span>
          </a>
          <a href="/report/create" style={{ font: '500 13px/1 var(--font-kr)', color: 'var(--color-neutral-400)', textDecoration: 'none' }}>
            보고 구조 잡기 →
          </a>
        </div>

        {/* 헤더 (입력 단계만) */}
        {stage !== 'done' && (
          <div style={{ marginBottom: 44 }}>
            <span className="wk-eyebrow">Design System v1.2</span>
            <h1 style={{ margin: '0 0 14px', font: '700 36px/48px var(--font-kr)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-neutral-900)' }}>
              HTML 보고서 재구성
            </h1>
            <p style={{ margin: 0, font: '400 16px/26px var(--font-kr)', color: 'var(--color-neutral-500)', letterSpacing: 'var(--tracking-tight)', maxWidth: 600 }}>
              기존 HTML 보고서를 붙여넣거나 파일을 올리면,
              디자인 시스템 v1.2 기준으로 재구성합니다.
            </p>
          </div>
        )}

        {/* 입력 영역 */}
        {stage !== 'done' && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ font: '600 13px/1 var(--font-kr)', color: 'var(--color-neutral-700)', letterSpacing: 'var(--tracking-caption)' }}>
                원본 HTML
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ font: '400 12px/1 var(--font-kr)', color: overLimit ? '#EF4444' : 'var(--color-neutral-300)' }}>
                  {charCount.toLocaleString()} / 200,000자
                </span>
                <button
                  className="wk-btn wk-btn-ghost"
                  style={{ height: 30, padding: '0 12px', fontSize: 12 }}
                  onClick={() => fileRef.current?.click()}
                >
                  파일 열기
                </button>
                <input ref={fileRef} type="file" accept=".html,.htm" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
            </div>

            <textarea
              className="wk-textarea wk-input"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder={'<!DOCTYPE html>\n<html>...\n\n기존 HTML을 여기에 붙여넣으세요.'}
              style={{ width: '100%', minHeight: 280, resize: 'vertical', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}
            />

            {stage === 'error' && (
              <p style={{ margin: '10px 0 0', font: '400 14px/1.5 var(--font-kr)', color: '#EF4444' }}>
                오류: {error}
              </p>
            )}

            <div className="wk-actions" style={{ marginTop: 20 }}>
              <button
                className="wk-btn wk-btn-primary"
                onClick={handleRefactor}
                disabled={!html.trim() || overLimit || stage === 'loading'}
                style={{ minWidth: 160 }}
              >
                {stage === 'loading' ? '재구성 중…' : '재구성하기 ›'}
              </button>
            </div>

            {stage === 'loading' && (
              <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--color-neutral-100)', borderTopColor: 'var(--color-primary)', animation: 'wk-spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ font: '400 14px/1 var(--font-kr)', color: 'var(--color-neutral-500)' }}>
                  디자인 시스템을 적용하고 있습니다…
                  {streamedChars > 0 && (
                    <span style={{ marginLeft: 8, color: 'var(--color-primary)', fontWeight: 600 }}>
                      {streamedChars.toLocaleString()}자 수신 중
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 결과 */}
        {stage === 'done' && (
          <div>
            {/* 툴바 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              {/* 뷰포트 선택 */}
              <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--color-neutral-10)', border: '1px solid var(--color-neutral-100)', borderRadius: 999 }}>
                {VIEWPORTS.map((vp) => (
                  <button
                    key={vp}
                    onClick={() => setViewport(vp)}
                    style={{
                      height: 28, padding: '0 14px',
                      border: 'none', borderRadius: 999,
                      background: viewport === vp ? '#fff' : 'transparent',
                      boxShadow: viewport === vp ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                      color: viewport === vp ? 'var(--color-primary)' : 'var(--color-neutral-400)',
                      font: `${viewport === vp ? 700 : 500} 13px/1 var(--font-kr)`,
                      cursor: 'pointer',
                      transition: 'all 120ms',
                    }}
                  >
                    {vp}
                  </button>
                ))}
              </div>

              {/* 액션 버튼 */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="wk-btn wk-btn-ghost" style={{ height: 34, padding: '0 14px', fontSize: 13 }} onClick={() => { setStage('idle'); setResult('') }}>
                  ← 다시 입력
                </button>
                <button className="wk-btn wk-btn-ghost" style={{ height: 34, padding: '0 14px', fontSize: 13 }} onClick={handleCopy}>
                  HTML 복사
                </button>
                <button className="wk-btn wk-btn-primary" style={{ height: 34, padding: '0 14px', fontSize: 13 }} onClick={handleDownload}>
                  다운로드
                </button>
              </div>
            </div>

            {/* iframe 컨테이너 */}
            <div style={{ border: '1px solid var(--color-neutral-100)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'var(--color-neutral-10)', borderBottom: '1px solid var(--color-neutral-100)' }}>
                <span style={{ font: '400 12px/1 monospace', color: 'var(--color-neutral-300)' }}>
                  report-v1.2.html
                </span>
                <span style={{ font: '400 11px/1 var(--font-kr)', color: 'var(--color-neutral-300)' }}>
                  {result.length.toLocaleString()}자
                </span>
              </div>
              <iframe
                key={viewport}
                srcDoc={previewHtml}
                style={{ width: '100%', height: '82vh', border: 'none', display: 'block' }}
                sandbox="allow-scripts allow-same-origin"
                title="재구성된 HTML 보고서 미리보기"
              />
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
