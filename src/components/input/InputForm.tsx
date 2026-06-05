'use client'

import { useState, useCallback } from 'react'
import type { ProjectInput } from '@/types/agent'

const PLACEHOLDER_SOURCE = `예시 — 아래 내용을 지우고 참고할 자료를 붙여넣으세요.

[회의록 / 기획서 / PRD / PPT 텍스트 등]

---
현재 업무에서 중간 산출물이 후속 단계로 이어지지 않아
담당자가 매번 재해석하는 병목이 발생하고 있습니다.
약 42h의 작업시간이 반복 업무로 소모되고 있으며,
이는 전체 업무량 대비 38% 수준입니다.

개선 방향: 입력 구조를 정비하고 중간 산출물이
후속 단계의 입력값으로 직접 이어지도록 Workflow를 재설계합니다.

추진 일정:
- 1단계 (6월): 현황 분석 및 구조 정의
- 2단계 (7월): MVP 구현 및 내부 검증
- 3단계 (8월): 운영 적용 및 효과 측정`

interface Props {
  onSubmit: (input: ProjectInput) => void
}

export function InputForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [goal, setGoal] = useState('')
  const [source, setSource] = useState('')
  const [avoid, setAvoid] = useState('')

  const canSubmit = title.trim().length > 0

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      reportTitle: title.trim(),
      reportContext: context.trim() || undefined,
      reportGoal: goal.trim() || undefined,
      referenceMaterial: source.trim() || undefined,
      avoidPoints: avoid.trim() || undefined,
    })
  }

  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '72px 32px 120px' }}>
      <div style={{ width: '100%', maxWidth: 760 }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 48 }}>
          <span className="wk-eyebrow">보고자료 생성</span>
          <h1 style={{ margin: '0 0 18px', font: '700 40px/52px var(--font-kr)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-neutral-900)' }}>
            기존 자료를 붙여넣으면<br />보고자료 구조를 잡아드립니다
          </h1>
          <p style={{ margin: 0, font: '400 17px/28px var(--font-kr)', color: 'var(--color-neutral-500)', letterSpacing: 'var(--tracking-tight)', maxWidth: 600 }}>
            회의록, 기획서, PRD, PPT 텍스트 등 어떤 형태든 괜찮습니다.
            처음부터 만들지 않고, <strong style={{ color: 'var(--color-neutral-700)', fontWeight: 700 }}>가진 자료를 보고자료로 재구성</strong>합니다.
          </p>
        </div>

        {/* 필드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="wk-field">
            <label className="wk-field-label">
              보고 제목 <span className="req">*</span>
            </label>
            <input
              className="wk-input"
              placeholder="예: AI 활용 업무 자동화 중간 보고"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="wk-field">
            <label className="wk-field-label">보고 맥락</label>
            <textarea
              className="wk-textarea"
              placeholder="예: Q2 성과 보고 / 임원진 공유 / 다음 단계 예산 승인 요청"
              value={context}
              ref={autoResize}
              onChange={(e) => { setContext(e.target.value); autoResize(e.target) }}
              style={{ minHeight: 80, resize: 'none' }}
            />
          </div>

          <div className="wk-field">
            <label className="wk-field-label">핵심 목표</label>
            <textarea
              className="wk-textarea"
              placeholder="이번 보고를 통해 무엇을 설득하거나 결정받고 싶은지 입력하세요."
              value={goal}
              ref={autoResize}
              onChange={(e) => { setGoal(e.target.value); autoResize(e.target) }}
              style={{ minHeight: 100, resize: 'none' }}
            />
          </div>

          <div className="wk-field">
            <label className="wk-field-label">피해야 할 내용</label>
            <textarea
              className="wk-textarea"
              placeholder="보고에서 강조하지 말아야 할 내용, 아직 확정되지 않은 내용, 과장되면 안 되는 내용을 입력하세요."
              value={avoid}
              ref={autoResize}
              onChange={(e) => { setAvoid(e.target.value); autoResize(e.target) }}
              style={{ minHeight: 100, resize: 'none' }}
            />
          </div>

          <div className="wk-field">
            <label className="wk-field-label">
              참고 자료{' '}
              <span style={{ fontWeight: 500, color: 'var(--color-neutral-400)' }}>(선택)</span>
            </label>
            <span className="wk-field-help">자료가 없어도 생성 가능합니다. 회의록 · 기획서 · PRD · PPT 텍스트 등 형태 무관.</span>
            <textarea
              className="wk-textarea"
              placeholder={PLACEHOLDER_SOURCE}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="wk-actions">
          <span className="hint">붙여넣은 자료는 분석에만 사용되며 별도로 저장되지 않습니다.</span>
          <button
            className="wk-btn wk-btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            자료 분석하기 ›
          </button>
        </div>

      </div>
    </main>
  )
}
