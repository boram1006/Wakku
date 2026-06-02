'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { useReportStore } from '@/store/reportStore'
import { analyzeInput, generateReport } from '@/agent/mockAgent'
import { InputForm } from '@/components/input/InputForm'
import { AgentQuestions } from '@/components/input/AgentQuestions'
import type { ProjectInput } from '@/types/agent'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { step, input, analysis, answers, setStep, setInput, setAnalysis, setAnswer } =
    useAgentStore()
  const loadReport = useReportStore((s) => s.loadReport)

  // 이미 생성된 경우 editor로
  useEffect(() => {
    if (step === 'editor') router.push('/editor')
  }, [step, router])

  const handleInputSubmit = (data: ProjectInput) => {
    setInput(data)
    const result = analyzeInput(data)
    setAnalysis(result)
    setStep('questions')
  }

  const handleGenerate = () => {
    if (!input || !analysis) return
    setStep('generating')

    // Mock 딜레이로 "생성 중" 느낌
    setTimeout(() => {
      const report = generateReport(input, analysis, answers)
      loadReport(report)
      setStep('editor')
      router.push('/editor')
    }, 900)
  }

  if (step === 'generating') {
    return <GeneratingScreen title={input?.reportTitle ?? ''} />
  }

  if (step === 'questions' && input && analysis) {
    return (
      <PageShell>
        <AgentQuestions
          reportTitle={input.reportTitle}
          analysis={analysis}
          answers={answers}
          onAnswer={setAnswer}
          onGenerate={handleGenerate}
          onBack={() => setStep('input')}
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <InputForm onSubmit={handleInputSubmit} />
    </PageShell>
  )
}

function GeneratingScreen({ title }: { title: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: 'var(--report-bg)',
      }}
    >
      <Spinner />
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--report-text)',
            marginBottom: 8,
          }}
        >
          보고자료를 생성하고 있습니다
        </div>
        <div style={{ fontSize: 14, color: 'var(--report-text-muted)' }}>
          {title}
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        border: '3px solid var(--report-border)',
        borderTopColor: 'var(--report-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--report-bg)' }}>
      {/* 미니 헤더 */}
      <div
        style={{
          borderBottom: '1px solid var(--report-border)',
          padding: '0 40px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          Wakku
        </div>
      </div>
      {children}
    </div>
  )
}
