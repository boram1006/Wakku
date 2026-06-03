'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { useReportStore } from '@/store/reportStore'
import { InputForm } from '@/components/input/InputForm'
import { AgentQuestions } from '@/components/input/AgentQuestions'
import { GeneratingScreen, PageShell } from '@/components/input/GeneratingScreen'
import { StorylineStep } from '@/components/input/StorylineStep'
import { MockStorylineAgent } from '@/agent/mockStorylineAgent'
import type { ProjectInput, AnalysisResult } from '@/types/agent'
import type { ReportData } from '@/types/report'
import { useEffect } from 'react'

const storylineAgent = new MockStorylineAgent()

export default function Home() {
  const router = useRouter()
  const {
    step, input, analysis, answers, storylines, selectedStorylineId,
    setStep, setInput, setAnalysis, setAnswer, setStorylines, setSelectedStorylineId,
  } = useAgentStore()
  const loadReport = useReportStore((s) => s.loadReport)

  useEffect(() => {
    if (step === 'editor') router.push('/editor')
  }, [step, router])

  // Step 1 → analysis loading → storyline selection
  const handleInputSubmit = async (data: ProjectInput) => {
    setInput(data)
    setStep('analysis')

    let result: AnalysisResult = { detectedLayouts: [], detectedKpis: [], detectedProblems: [], questions: [] }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      result = await res.json()
    } catch (e) {
      console.error('analyze failed:', e)
    }
    setAnalysis(result)

    const candidates = await storylineAgent.generateStorylines(data, result)
    setStorylines(candidates)
    setSelectedStorylineId(candidates[0]?.id ?? null)
    setStep('storyline')
  }

  // Storyline selected → questions (only what analysis couldn't infer, max 3)
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

  if (step === 'storyline' && input) {
    return (
      <PageShell step={2}>
        <StorylineStep
          reportTitle={input.reportTitle}
          storylines={storylines}
          selectedId={selectedStorylineId}
          onSelect={setSelectedStorylineId}
          onConfirm={handleStorylineContinue}
          onBack={() => setStep('input')}
        />
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
