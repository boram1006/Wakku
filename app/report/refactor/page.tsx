'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { PageShell } from '@/components/input/GeneratingScreen'

type Stage = 'idle' | 'extracting' | 'generating' | 'done' | 'error'
type Viewport = '1920' | '1440' | '1200'
type InputMode = 'image' | 'html'

interface SlideEntry { id: string; file: File; preview: string }

const VIEWPORTS: Viewport[] = ['1920', '1440', '1200']
const VP_WIDTHS: Record<Viewport, number> = { '1920': 1920, '1440': 1440, '1200': 1200 }

async function resizeToJpeg(file: File, maxPx = 1280): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg',
        0.85,
      )
    }
    img.src = url
  })
}

export default function RefactorPage() {
  const [inputMode, setInputMode] = useState<InputMode>('image')
  const [slides, setSlides] = useState<SlideEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [html, setHtml] = useState('')
  const [result, setResult] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState('')
  const [viewport, setViewport] = useState<Viewport>('1920')
  const [extractedJson, setExtractedJson] = useState<Record<string, unknown> | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  const fileRef = useRef<HTMLInputElement>(null)
  const slideInputRef = useRef<HTMLInputElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const el = previewContainerRef.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Clean up slide preview URLs on unmount
  useEffect(() => {
    return () => { slides.forEach((s) => URL.revokeObjectURL(s.preview)) }
  }, [slides])

  const vpWidth = VP_WIDTHS[viewport]
  const scale = containerWidth > 0 ? Math.min(1, containerWidth / vpWidth) : 1
  const iframeHeight = scale > 0 ? `${82 / scale}vh` : '82vh'

  const isDone = stage === 'done'
  const isWorking = stage === 'extracting' || stage === 'generating'

  async function addSlides(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!arr.length) return
    const resized = await Promise.all(arr.map((f) => resizeToJpeg(f)))
    const entries: SlideEntry[] = resized.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
    }))
    setSlides((prev) => [...prev, ...entries].slice(0, 20))
  }

  function removeSlide(id: string) {
    setSlides((prev) => {
      const entry = prev.find((s) => s.id === id)
      if (entry) URL.revokeObjectURL(entry.preview)
      return prev.filter((s) => s.id !== id)
    })
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback(() => setIsDragging(false), [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addSlides(e.dataTransfer.files)
  }, [])

  function handleCancel() {
    abortRef.current?.abort()
    abortRef.current = null
    setStage('idle')
    setError('')
  }

  async function handleRefactor() {
    const abort = new AbortController()
    abortRef.current = abort
    setStage('extracting')
    setError('')
    setResult('')
    setExtractedJson(null)
    setShowDebug(false)

    try {
      let extracted: Record<string, unknown>

      if (inputMode === 'image') {
        if (!slides.length) return
        const formData = new FormData()
        slides.forEach((s, i) => formData.append(`slide_${i}`, s.file))
        const res = await fetch('/api/refactor/extract-vision', { method: 'POST', body: formData, signal: abort.signal })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d.error ?? `추출 실패 HTTP ${res.status}`)
        }
        extracted = await res.json()
      } else {
        if (!html.trim()) return
        const res = await fetch('/api/refactor/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html }),
          signal: abort.signal,
        })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d.error ?? `추출 실패 HTTP ${res.status}`)
        }
        extracted = await res.json()
      }

      setExtractedJson(extracted)
      const { _sourceHtml, ...extractedContent } = extracted as Record<string, unknown>

      setStage('generating')
      const genRes = await fetch('/api/refactor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: extractedContent, sourceHtml: _sourceHtml }),
        signal: abort.signal,
      })
      if (!genRes.ok) {
        const d = await genRes.json().catch(() => ({}))
        throw new Error(d.error ?? `생성 실패 HTTP ${genRes.status}`)
      }

      let finalHtml = await genRes.text()
      if (!finalHtml.trim() || !/<html/i.test(finalHtml)) {
        throw new Error('유효한 HTML을 추출할 수 없습니다.')
      }

      // iframe 내 모든 링크를 인터셉트: 해시 링크는 scrollIntoView, 외부 링크는 차단
      const anchorScript = `<script>
document.addEventListener('click', function(e) {
  var a = e.target.closest('a');
  if (!a) return;
  var href = a.getAttribute('href') || '';
  if (!href || href.startsWith('javascript')) return;
  // 순수 해시 링크: #foo
  if (href.charAt(0) === '#') {
    e.preventDefault();
    var el = document.getElementById(href.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  // 경로 + 해시: /path#foo 또는 http://...#foo
  var hi = href.indexOf('#');
  if (hi !== -1) {
    e.preventDefault();
    var id = href.slice(hi + 1);
    var el2 = document.getElementById(id);
    if (el2) el2.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  // 그 외 모든 링크 — 외부 탐색 차단
  e.preventDefault();
}, true);
</script>`
      finalHtml = finalHtml.replace(/<\/body>/i, anchorScript + '\n</body>')

      setResult(finalHtml)
      setStage('done')
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
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

  async function handleDownload() {
    let downloadHtml = result
    try {
      const cssText = await fetch('/wakku-ds.css').then((r) => r.text())
      downloadHtml = downloadHtml.replace(
        /<link[^>]+href="\/wakku-ds\.css"[^>]*>/i,
        `<style>\n${cssText}\n</style>`,
      )
    } catch { /* leave link tag as-is */ }
    const blob = new Blob([downloadHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report-v1.2.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
  }

  const canRun = inputMode === 'image' ? slides.length > 0 : (html.trim().length > 0 && html.length <= 200_000)
  const charCount = html.length
  const overLimit = charCount > 200_000

  return (
    <PageShell mode="refactor">
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: isDone ? '40px 0 80px' : '72px 32px 120px',
        minHeight: 'calc(100vh - 72px)',
      }}>
      <div style={{ width: '100%', maxWidth: isDone ? 'none' : 860 }}>

        {/* 헤더 (입력 단계만) */}
        {!isDone && (
          <div style={{ marginBottom: 36 }}>
            <span className="wk-eyebrow">Design System v1.2</span>
            <h1 style={{ margin: '0 0 14px', font: '700 36px/48px var(--font-kr)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-neutral-900)' }}>
              HTML 보고서 재구성
            </h1>
            <p style={{ margin: 0, font: '400 16px/26px var(--font-kr)', color: 'var(--color-neutral-500)', letterSpacing: 'var(--tracking-tight)', maxWidth: 600 }}>
              보고서 슬라이드 이미지를 올리거나 HTML을 붙여넣으면
              Wakku DS 레이아웃으로 완전히 새로 재구성합니다.
            </p>
          </div>
        )}

        {/* 입력 영역 */}
        {!isDone && (
          <div style={{ marginBottom: 32 }}>

            {/* 모드 탭 */}
            <div style={{ display: 'inline-flex', gap: 0, marginBottom: 24, border: '1px solid var(--color-neutral-100)', borderRadius: 10, overflow: 'hidden' }}>
              {(['image', 'html'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  style={{
                    padding: '9px 20px', border: 'none', cursor: 'pointer',
                    font: `${inputMode === mode ? 600 : 400} 13px/1 var(--font-kr)`,
                    background: inputMode === mode ? 'var(--color-primary)' : '#fff',
                    color: inputMode === mode ? '#fff' : 'var(--color-neutral-500)',
                    transition: 'background 120ms, color 120ms',
                  }}
                >
                  {mode === 'image' ? '이미지 슬라이드' : 'HTML 파일'}
                </button>
              ))}
            </div>

            {/* 이미지 모드 */}
            {inputMode === 'image' && (
              <div>
                {/* 드롭 존 */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => slideInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-neutral-200)'}`,
                    borderRadius: 14,
                    padding: '48px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? 'var(--color-primary-bg)' : 'var(--color-neutral-10)',
                    transition: 'border-color 120ms, background 120ms',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🖼</div>
                  <p style={{ margin: '0 0 6px', font: '600 15px/1 var(--font-kr)', color: 'var(--color-neutral-700)' }}>
                    슬라이드 이미지를 드래그하거나 클릭해서 선택
                  </p>
                  <p style={{ margin: 0, font: '400 13px/1 var(--font-kr)', color: 'var(--color-neutral-400)' }}>
                    PNG · JPG · WEBP · 최대 20장
                  </p>
                </div>
                <input
                  ref={slideInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && addSlides(e.target.files)}
                />

                {/* 썸네일 그리드 */}
                {slides.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ font: '600 13px/1 var(--font-kr)', color: 'var(--color-neutral-600)' }}>
                        {slides.length}장 선택됨
                      </span>
                      <button
                        className="wk-btn wk-btn-ghost"
                        style={{ height: 28, padding: '0 12px', fontSize: 12 }}
                        onClick={() => { slides.forEach((s) => URL.revokeObjectURL(s.preview)); setSlides([]) }}
                      >
                        전체 삭제
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                      {slides.map((s, i) => (
                        <div key={s.id} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-neutral-100)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.preview} alt={`slide ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,.55)', color: '#fff', borderRadius: 4, padding: '2px 6px', font: '700 10px/1 var(--font-sans)' }}>
                            {i + 1}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSlide(s.id) }}
                            style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, border: 'none', borderRadius: '50%', background: 'rgba(0,0,0,.55)', color: '#fff', cursor: 'pointer', font: '700 11px/1 sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HTML 모드 */}
            {inputMode === 'html' && (
              <div>
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
              </div>
            )}

            {/* 오류 */}
            {stage === 'error' && (
              <p style={{ margin: '10px 0 0', font: '400 14px/1.5 var(--font-kr)', color: '#EF4444' }}>
                오류: {error}
              </p>
            )}

            {/* 실행 버튼 */}
            <div className="wk-actions" style={{ marginTop: 20 }}>
              {isWorking ? (
                <button
                  className="wk-btn wk-btn-ghost"
                  onClick={handleCancel}
                  style={{ minWidth: 160 }}
                >
                  취소
                </button>
              ) : (
                <button
                  className="wk-btn wk-btn-primary"
                  onClick={handleRefactor}
                  disabled={!canRun}
                  style={{ minWidth: 160 }}
                >
                  재구성하기 ›
                </button>
              )}
            </div>

            {/* 진행 표시 */}
            {isWorking && (
              <div style={{ marginTop: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>
                  {(['extracting', 'generating'] as const).map((s, i) => {
                    const done = s === 'extracting' && stage === 'generating'
                    const active = stage === s
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: done ? 'var(--color-primary)' : 'transparent',
                          border: active ? '2px solid var(--color-primary)' : done ? 'none' : '2px solid var(--color-neutral-200)',
                          borderTopColor: active ? 'transparent' : undefined,
                          animation: active ? 'wk-spin 0.8s linear infinite' : 'none',
                        }}>
                          {done && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                        </div>
                        <span style={{
                          font: `${active ? 600 : 400} 13px/1 var(--font-kr)`,
                          color: done ? 'var(--color-primary)' : active ? 'var(--color-neutral-900)' : 'var(--color-neutral-300)',
                        }}>
                          {s === 'extracting'
                            ? (inputMode === 'image' ? '슬라이드 분석 중' : '내용 분석')
                            : 'HTML 생성'}
                        </span>
                        {i === 0 && <span style={{ margin: '0 10px', color: 'var(--color-neutral-200)', fontSize: 16 }}>→</span>}
                      </div>
                    )
                  })}
                </div>
                <span style={{ font: '400 13px/1 var(--font-kr)', color: 'var(--color-neutral-400)' }}>
                  {stage === 'extracting'
                    ? (inputMode === 'image' ? `${slides.length}장 슬라이드에서 내용을 읽고 있습니다…` : '보고서 내용을 구조화하고 있습니다…')
                    : 'Wakku 디자인 시스템으로 재구성하고 있습니다…'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 결과 */}
        {isDone && (
          <div>
            {/* 툴바 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--color-neutral-10)', border: '1px solid var(--color-neutral-100)', borderRadius: 999 }}>
                  {VIEWPORTS.map((vp) => (
                    <button
                      key={vp}
                      onClick={() => setViewport(vp)}
                      style={{
                        height: 28, padding: '0 14px', border: 'none', borderRadius: 999,
                        background: viewport === vp ? '#fff' : 'transparent',
                        boxShadow: viewport === vp ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                        color: viewport === vp ? 'var(--color-primary)' : 'var(--color-neutral-400)',
                        font: `${viewport === vp ? 700 : 500} 13px/1 var(--font-kr)`,
                        cursor: 'pointer', transition: 'all 120ms',
                      }}
                    >
                      {vp}
                    </button>
                  ))}
                </div>
                {scale < 1 && (
                  <span style={{ font: '400 11px/1 var(--font-kr)', color: 'var(--color-neutral-300)' }}>
                    {Math.round(scale * 100)}% 축소
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="wk-btn wk-btn-ghost" style={{ height: 34, padding: '0 14px', fontSize: 13 }} onClick={() => { setStage('idle'); setResult('') }}>
                  ← 다시 입력
                </button>
                {extractedJson && (
                  <button
                    className="wk-btn wk-btn-ghost"
                    style={{ height: 34, padding: '0 14px', fontSize: 13, color: showDebug ? 'var(--color-primary)' : undefined }}
                    onClick={() => setShowDebug((v) => !v)}
                  >
                    추출 JSON {(extractedJson as { sections?: unknown[] }).sections?.length ?? 0}섹션
                  </button>
                )}
                <button className="wk-btn wk-btn-ghost" style={{ height: 34, padding: '0 14px', fontSize: 13 }} onClick={handleCopy}>
                  HTML 복사
                </button>
                <button className="wk-btn wk-btn-primary" style={{ height: 34, padding: '0 14px', fontSize: 13 }} onClick={handleDownload}>
                  다운로드
                </button>
              </div>
            </div>

            {/* 디버그: 추출된 JSON */}
            {showDebug && extractedJson && (
              <div style={{ marginBottom: 12, margin: '0 24px 12px', border: '1px solid var(--color-neutral-100)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px', background: 'var(--color-neutral-10)', borderBottom: '1px solid var(--color-neutral-100)', font: '600 12px/1 var(--font-kr)', color: 'var(--color-neutral-500)' }}>
                  추출된 JSON — sections: {(extractedJson as { sections?: unknown[] }).sections?.length ?? 0}개
                </div>
                <pre style={{ margin: 0, padding: '16px', background: '#1e1e1e', color: '#d4d4d4', fontSize: 11, lineHeight: 1.6, overflowX: 'auto', maxHeight: 320, overflowY: 'auto' }}>
                  {JSON.stringify(extractedJson, (k, v) => k === '_sourceHtml' ? '[stripped HTML...]' : v, 2)}
                </pre>
              </div>
            )}

            {/* iframe */}
            <div style={{ border: '1px solid var(--color-neutral-100)', borderTop: '1px solid var(--color-neutral-100)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'var(--color-neutral-10)', borderBottom: '1px solid var(--color-neutral-100)' }}>
                <span style={{ font: '400 12px/1 monospace', color: 'var(--color-neutral-300)' }}>
                  {vpWidth}px 기준 미리보기
                </span>
                <span style={{ font: '400 11px/1 var(--font-kr)', color: 'var(--color-neutral-300)' }}>
                  {result.length.toLocaleString()}자
                </span>
              </div>
              <div
                ref={previewContainerRef}
                style={{ overflow: 'hidden', height: '82vh', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
              >
                <iframe
                  key={viewport}
                  srcDoc={result}
                  style={{
                    width: vpWidth, height: iframeHeight, border: 'none',
                    display: 'block', transform: `scale(${scale})`, transformOrigin: 'top center',
                    flexShrink: 0,
                  }}
                  sandbox="allow-scripts allow-same-origin"
                  title="재구성된 HTML 보고서 미리보기"
                />
              </div>
            </div>
          </div>
        )}

      </div>
      </div>
    </PageShell>
  )
}
