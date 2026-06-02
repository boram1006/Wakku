'use client'

import { useState } from 'react'
import type { ProjectInput } from '@/types/agent'

interface Props {
  onSubmit: (input: ProjectInput) => void
}

const PLACEHOLDER_SOURCE = `예시 — 아래 내용을 지우고 분석할 자료를 붙여넣으세요.

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

export function InputForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [goal, setGoal] = useState('')
  const [source, setSource] = useState('')
  const [avoid, setAvoid] = useState('')
  const [showOptional, setShowOptional] = useState(false)

  const canSubmit = title.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      reportTitle: title.trim(),
      reportContext: context.trim() || undefined,
      reportGoal: goal.trim() || undefined,
      sourceText: source.trim() || undefined,
      avoidPoints: avoid.trim() || undefined,
    })
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 40px 80px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 52 }}>
        <div style={kickerStyle}>
          <span style={kickerBarStyle} />
          보고자료 생성
        </div>
        <h1 style={h1Style}>
          기존 자료를 붙여넣으면<br />보고자료 구조를 잡아드립니다
        </h1>
        <p style={subtitleStyle}>
          회의록, 기획서, PRD, PPT 텍스트 등 어떤 형태든 괜찮습니다.
          처음부터 만들지 않고, 가진 자료를 보고자료로 재구성합니다.
        </p>
      </div>

      {/* 필수: 보고 제목 */}
      <FieldGroup label="보고 제목" required>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: AI 활용 업무 자동화 중간 보고"
          className="report-field-input"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </FieldGroup>

      {/* 필수: 원본 자료 */}
      <FieldGroup
        label="원본 자료"
        desc="분석할 자료를 그대로 붙여넣으세요. 회의록·기획서·PRD·PPT 텍스트 등 형태 무관."
      >
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder={PLACEHOLDER_SOURCE}
          rows={12}
          className="report-field-textarea"
        />
      </FieldGroup>

      {/* 선택 필드 토글 */}
      <button
        onClick={() => setShowOptional((v) => !v)}
        style={optionalToggleStyle}
      >
        <span style={{
          fontSize: 16,
          lineHeight: 1,
          color: 'var(--report-text-muted)',
          transition: 'transform 0.15s',
          display: 'inline-block',
          transform: showOptional ? 'rotate(45deg)' : 'none',
        }}>+</span>
        추가 정보 입력 (선택)
      </button>

      {showOptional && (
        <div style={{ marginBottom: 8 }}>
          <FieldGroup label="보고 맥락" desc="이 보고의 배경·목적 (선택)">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="예: Q2 성과 보고 / 임원진 공유 / 다음 단계 예산 승인 요청"
              rows={2}
              className="report-field-textarea"
              style={{ resize: 'none' }}
            />
          </FieldGroup>

          <FieldGroup label="핵심 목표" desc="이 보고를 통해 달성하려는 것 (선택)">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 다음 단계 추진 승인 / 리소스 확보 요청"
              className="report-field-input"
            />
          </FieldGroup>

          <FieldGroup label="피해야 할 내용" desc="보고서에 포함하지 않을 내용 (선택)">
            <input
              type="text"
              value={avoid}
              onChange={(e) => setAvoid(e.target.value)}
              placeholder="예: 기술 구현 세부 스펙, 조직 개편 관련 내용"
              className="report-field-input"
            />
          </FieldGroup>
        </div>
      )}

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            ...ctaButtonStyle,
            background: canSubmit ? 'var(--report-accent)' : 'var(--report-border)',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          자료 분석 시작
          <span style={{ fontSize: 16 }}>→</span>
        </button>
        {!canSubmit && (
          <span style={{ fontSize: 13, color: 'var(--report-text-soft)' }}>
            보고 제목을 입력해주세요
          </span>
        )}
      </div>
    </div>
  )
}

function FieldGroup({
  label,
  desc,
  required,
  children,
}: {
  label: string
  desc?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: 'var(--report-accent)', marginLeft: 4 }}>*</span>}
      </label>
      {desc && <p style={descStyle}>{desc}</p>}
      {children}
    </div>
  )
}

// ─── 스타일 상수 ──────────────────────────────────────────────────────────────

const kickerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 18,
  color: 'var(--report-accent)',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

const kickerBarStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 24,
  height: 2,
  background: 'var(--report-accent)',
  borderRadius: 2,
}

const h1Style: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  fontWeight: 700,
  lineHeight: 1.25,
  letterSpacing: '-0.03em',
  color: 'var(--report-text)',
}

const subtitleStyle: React.CSSProperties = {
  marginTop: 14,
  fontSize: 15,
  color: 'var(--report-text-muted)',
  lineHeight: 1.7,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--report-text)',
  marginBottom: 5,
  letterSpacing: '0.01em',
}

const descStyle: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 13,
  color: 'var(--report-text-muted)',
  lineHeight: 1.6,
}

const optionalToggleStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--report-text-muted)',
  fontSize: 13,
  fontWeight: 600,
  padding: '0 0 28px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  letterSpacing: '0.01em',
}

const ctaButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 48,
  padding: '0 28px',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 700,
  transition: 'background 0.15s, opacity 0.15s',
}
