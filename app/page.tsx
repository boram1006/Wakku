'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { useReportStore } from '@/store/reportStore'
import { analyzeInput, generateReport } from '@/agent/mockAgent'
import { InputForm } from '@/components/input/InputForm'
import { AgentQuestions } from '@/components/input/AgentQuestions'
import { GeneratingScreen, PageShell } from '@/components/input/GeneratingScreen'
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

