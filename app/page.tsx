'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { useReportStore } from '@/store/reportStore'
import { InputForm } from '@/components/input/InputForm'
import { AgentQuestions } from '@/components/input/AgentQuestions'
import { GeneratingScreen, PageShell } from '@/components/input/GeneratingScreen'
import type { ProjectInput } from '@/types/agent'
import type { AnalysisResult } from '@/types/agent'
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

  const handleInputSubmit = async (data: ProjectInput) => {
    setInput(data)
    setStep('questions') // 분석 중 UI (questions 화면에서 로딩 표시)

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
      // 실패 시 빈 분석 결과로 진행
      setAnalysis({ detectedLayouts: [], detectedKpis: [], detectedProblems: [], questions: [] })
    }
  }

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
      setStep('questions') // 실패 시 질문 화면으로 돌아감
    }
  }

  if (step === 'generating') {
    return <GeneratingScreen title={input?.reportTitle ?? ''} />
  }

  // questions 단계이지만 analysis가 아직 없으면 분석 중
  if (step === 'questions' && input && !analysis) {
    return <GeneratingScreen title={`"${input.reportTitle}" 분석 중…`} />
  }

  if (step === 'questions' && input && analysis) {
    return (
      <PageShell step={2}>
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
    <PageShell step={1}>
      <InputForm onSubmit={handleInputSubmit} />
    </PageShell>
  )
}
