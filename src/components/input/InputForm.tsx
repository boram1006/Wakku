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
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 40px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 48 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
            color: 'var(--report-accent)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 28,
              height: 2,
              background: 'var(--report-accent)',
            }}
          />
          보고자료 생성
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
            color: 'var(--report-text)',
          }}
        >
          기존 자료를 붙여넣으면<br />보고자료 구조를 잡아드립니다
        </h1>
        <p
          style={{
            marginTop: 14,
            color: 'var(--report-text-muted)',
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
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
          style={inputStyle}
          onFocus={focusStyle}
          onBlur={blurStyle}
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
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={focusStyle}
          onBlur={blurStyle}
        />
      </FieldGroup>

      {/* 선택 필드 토글 */}
      <button
        onClick={() => setShowOptional((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--report-text-muted)',
          fontSize: 14,
          fontWeight: 600,
          padding: '0 0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            border: '1.5px solid var(--report-border-strong)',
            borderRadius: 3,
            transition: 'transform 0.15s',
            transform: showOptional ? 'rotate(45deg)' : 'none',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--report-text-muted)',
              lineHeight: 1,
            }}
          >
            +
          </span>
        </span>
        추가 정보 입력 (선택)
      </button>

      {showOptional && (
        <>
          <FieldGroup label="보고 맥락" desc="이 보고의 배경·목적 (선택)">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="예: Q2 성과 보고 / 임원진 공유 / 다음 단계 예산 승인 요청"
              rows={2}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </FieldGroup>

          <FieldGroup label="핵심 목표" desc="이 보고를 통해 달성하려는 것 (선택)">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 다음 단계 추진 승인 / 리소스 확보 요청"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </FieldGroup>

          <FieldGroup label="피해야 할 내용" desc="보고서에 포함하지 않을 내용 (선택)">
            <input
              type="text"
              value={avoid}
              onChange={(e) => setAvoid(e.target.value)}
              placeholder="예: 기술 구현 세부 스펙, 조직 개편 관련 내용"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </FieldGroup>
        </>
      )}

      {/* CTA */}
      <div style={{ paddingTop: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 48,
            padding: '0 28px',
            background: canSubmit ? 'var(--report-accent)' : 'var(--report-border)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
        >
          자료 분석 시작
          <span style={{ fontSize: 16 }}>→</span>
        </button>
        {!canSubmit && (
          <span
            style={{
              marginLeft: 14,
              fontSize: 13,
              color: 'var(--report-text-soft)',
            }}
          >
            보고 제목을 입력해주세요
          </span>
        )}
      </div>
    </div>
  )
}

// ─── 스타일 헬퍼 ─────────────────────────────────────────────────────────────

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
    <div style={{ marginBottom: 28 }}>
      <label
        style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--report-text)',
          marginBottom: 4,
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--report-accent)', marginLeft: 4 }}>*</span>
        )}
      </label>
      {desc && (
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 13,
            color: 'var(--report-text-muted)',
          }}
        >
          {desc}
        </p>
      )}
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid var(--report-border)',
  borderRadius: 'var(--report-radius-sm)',
  fontSize: 14,
  color: 'var(--report-text)',
  fontFamily: 'var(--font-sans)',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box' as const,
}

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#FD312E'
}

function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--report-border)'
}
