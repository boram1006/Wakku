'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { useReportStore } from '@/store/reportStore'
import { InputForm } from '@/components/input/InputForm'
import { AgentQuestions } from '@/components/input/AgentQuestions'
import { GeneratingScreen, PageShell } from '@/components/input/GeneratingScreen'
import type { ProjectInput, AnalysisResult } from '@/types/agent'
import type { ReportData } from '@/types/report'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { step, input, analysis, answers, setStep, setInput, setAnalysis, setAnswer } =
    useAgentStore()
  const loadReport = useReportStore((s) => s.loadReport)

  useEffect(() => {
    if (step === 'editor') router.push('/editor')
  }, [step, router])

  // Step 1 → analysis loading → storyline selection placeholder
  const handleInputSubmit = async (data: ProjectInput) => {
    setInput(data)
    setStep('analysis')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result: AnalysisResult = await res.json()
      setAnalysis(result)
    } catch (e) {
      console.error('analyze failed:', e)
      setAnalysis({ detectedLayouts: [], detectedKpis: [], detectedProblems: [], questions: [] })
    }
    setStep('storyline')
  }

  // Storyline selected → questions (max 3, only what analysis couldn't infer)
  const handleStorylineContinue = () => {
    setStep('questions')
  }

  // Questions answered → generate report
  const handleGenerate = async () => {
    if (!input || !analysis) return
    setStep('generating')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, analysis, answers }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const report: ReportData = await res.json()
      loadReport(report)
      setStep('editor')
      router.push('/editor')
    } catch (e) {
      console.error('generate failed:', e)
      setStep('questions')
    }
  }

  if (step === 'analysis') {
    return <GeneratingScreen heading="자료를 분석하고 있습니다" title={input?.reportTitle ?? ''} />
  }

  if (step === 'generating') {
    return <GeneratingScreen heading="보고자료를 생성하고 있습니다" title={input?.reportTitle ?? ''} />
  }

  // Storyline selection placeholder — real UI TBD
  if (step === 'storyline') {
    return (
      <PageShell step={2}>
        <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: 12 }}>
            스토리라인 후보를 생성했습니다
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 40 }}>
            스토리라인 선택 UI는 준비 중입니다.
          </div>
          <button
            onClick={handleStorylineContinue}
            style={{
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 600,
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            계속
          </button>
        </div>
      </PageShell>
    )
  }

  if (step === 'questions' && input && analysis) {
    return (
      <PageShell step={3}>
        <AgentQuestions
          reportTitle={input.reportTitle}
          analysis={analysis}
          answers={answers}
          onAnswer={setAnswer}
          onGenerate={handleGenerate}
          onBack={() => setStep('storyline')}
        />
      </PageShell>
    )
  }

  return (
    <PageShell step={1}>
      <InputForm onSubmit={handleInputSubmit} />
    </PageShell>
  )
}
