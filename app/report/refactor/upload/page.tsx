'use client'

import { useState, useCallback, useRef } from 'react'

interface UploadResult { name: string; ok: boolean }

export default function UploadForAnalysis() {
  const [queued, setQueued] = useState<File[]>([])
  const [results, setResults] = useState<UploadResult[]>([])
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | File[]) {
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'))
    setQueued((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      return [...prev, ...imgs.filter((f) => !existing.has(f.name))]
    })
  }

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const onDragLeave = useCallback(() => setIsDragging(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files)
  }, [])

  async function handleUpload() {
    if (!queued.length || uploading) return
    setUploading(true)
    setResults([])

    // Upload in batches of 10
    const BATCH = 10
    const newResults: UploadResult[] = []

    for (let i = 0; i < queued.length; i += BATCH) {
      const batch = queued.slice(i, i + BATCH)
      const fd = new FormData()
      batch.forEach((f) => fd.append('file', f))
      try {
        const res = await fetch('/api/refactor/upload-slides', { method: 'POST', body: fd })
        const data = await res.json()
        batch.forEach((f) => newResults.push({ name: f.name, ok: data.saved?.includes(f.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')) ?? false }))
      } catch {
        batch.forEach((f) => newResults.push({ name: f.name, ok: false }))
      }
      setResults([...newResults])
    }

    setUploading(false)
  }

  const done = results.length > 0 && !uploading
  const okCount = results.filter((r) => r.ok).length

  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '72px 32px 120px', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 44 }}>
          <a href="/report/refactor" style={{ font: '700 15px/1 var(--font-kr)', color: 'var(--color-neutral-900)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>W</span>
            <span>Wakku</span>
          </a>
        </div>

        <span className="wk-eyebrow">분석용 슬라이드 업로드</span>
        <h1 style={{ margin: '0 0 14px', font: '700 32px/44px var(--font-kr)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-neutral-900)' }}>
          슬라이드 이미지 업로드
        </h1>
        <p style={{ margin: '0 0 36px', font: '400 15px/26px var(--font-kr)', color: 'var(--color-neutral-500)', maxWidth: 540 }}>
          보고서 슬라이드 이미지를 올리면 서버에 저장됩니다.<br />
          저장된 이미지를 분석해 추출 프롬프트를 개선합니다.
        </p>

        {/* 드롭 존 */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-neutral-200)'}`,
            borderRadius: 14, padding: '52px 24px', textAlign: 'center', cursor: 'pointer',
            background: isDragging ? 'var(--color-primary-bg)' : 'var(--color-neutral-10)',
            transition: 'all 120ms', marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🖼</div>
          <p style={{ margin: '0 0 6px', font: '600 15px/1 var(--font-kr)', color: 'var(--color-neutral-700)' }}>
            슬라이드 이미지를 드래그하거나 클릭해서 선택
          </p>
          <p style={{ margin: 0, font: '400 13px/1 var(--font-kr)', color: 'var(--color-neutral-400)' }}>
            PNG · JPG · WEBP · 여러 장 한번에 가능
          </p>
        </div>
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
          onChange={(e) => e.target.files && addFiles(e.target.files)} />

        {/* 대기열 */}
        {queued.length > 0 && (
          <div style={{ marginBottom: 20, padding: '14px 18px', background: 'var(--color-neutral-10)', border: '1px solid var(--color-neutral-100)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ font: '600 14px/1 var(--font-kr)', color: 'var(--color-neutral-700)' }}>
                {queued.length}장 준비됨
              </span>
              <button
                className="wk-btn wk-btn-ghost"
                style={{ height: 28, padding: '0 12px', fontSize: 12 }}
                onClick={() => { setQueued([]); setResults([]) }}
              >
                초기화
              </button>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {queued.slice(0, 20).map((f) => (
                <span key={f.name} style={{ font: '400 11px/1 var(--font-kr)', color: 'var(--color-neutral-500)', background: '#fff', border: '1px solid var(--color-neutral-100)', borderRadius: 6, padding: '3px 8px' }}>
                  {f.name}
                </span>
              ))}
              {queued.length > 20 && (
                <span style={{ font: '400 11px/1 var(--font-kr)', color: 'var(--color-neutral-400)', padding: '3px 8px' }}>
                  +{queued.length - 20}장 더
                </span>
              )}
            </div>
          </div>
        )}

        {/* 업로드 버튼 */}
        <div className="wk-actions">
          <button
            className="wk-btn wk-btn-primary"
            onClick={handleUpload}
            disabled={!queued.length || uploading}
            style={{ minWidth: 160 }}
          >
            {uploading ? `업로드 중… (${results.length}/${queued.length})` : '서버에 저장하기 ›'}
          </button>
        </div>

        {/* 결과 */}
        {done && (
          <div style={{ marginTop: 28, padding: '20px 24px', background: okCount === results.length ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${okCount === results.length ? '#BBF7D0' : '#FDE68A'}`, borderRadius: 12 }}>
            <p style={{ margin: '0 0 8px', font: '700 15px/1 var(--font-kr)', color: okCount === results.length ? '#15803D' : '#92400E' }}>
              {okCount === results.length
                ? `✓ ${okCount}장 모두 저장 완료`
                : `${okCount}/${results.length}장 저장됨 (일부 실패)`}
            </p>
            <p style={{ margin: 0, font: '400 13px/1.5 var(--font-kr)', color: 'var(--color-neutral-500)' }}>
              서버 경로: <code style={{ fontSize: 12 }}>slides-for-analysis/</code><br />
              이제 Claude에게 분석 요청하세요.
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
