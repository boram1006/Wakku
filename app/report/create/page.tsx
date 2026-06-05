'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { useReportStore } from '@/store/reportStore'
import { InputForm } from '@/components/input/InputForm'
import { AgentQuestions } from '@/components/input/AgentQuestions'
import { GeneratingScreen, PageShell } from '@/components/input/GeneratingScreen'
import { StorylineStep } from '@/components/input/StorylineStep'
import { LlmStorylineAgent } from '@/agent/storylineAgent'
import { generateStorylineQuestions } from '@/agent/storylineQuestions'
import { generatePagesFromStoryline } from '@/agent/storylinePageGenerator'
import type { ProjectInput, AnalysisResult, AgentAnswers } from '@/types/agent'
import { useEffect } from 'react'

const storylineAgent = new LlmStorylineAgent()

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

  // Client-side page generation — brief generating screen for UX
  function generateAndLoad(currentAnswers: AgentAnswers) {
    const selectedStoryline = storylines.find((s) => s.id === selectedStorylineId)
    if (!selectedStoryline || !input) return

    setStep('generating')

    setTimeout(() => {
      try {
        const pages = generatePagesFromStoryline(selectedStoryline, input, currentAnswers)
        loadReport({ brand: input.reportTitle, pages })
        setStep('editor')
      } catch (e) {
        console.error('page generation failed:', e)
        setStep('storyline')
      }
    }, 600)
  }

  // Storyline confirmed → generate storyline-specific questions
  // If 0 questions: skip directly to generating
  const handleStorylineContinue = () => {
    const selectedStoryline = storylines.find((s) => s.id === selectedStorylineId)
    if (!selectedStoryline || !input) return

    const qs = generateStorylineQuestions(selectedStoryline, input)
    const base = analysis ?? { detectedLayouts: [], detectedKpis: [], detectedProblems: [], questions: [] }
    setAnalysis({ ...base, questions: qs })

    if (qs.length === 0) {
      generateAndLoad(answers)
    } else {
      setStep('questions')
    }
  }

  // Questions answered → generate
  const handleGenerate = () => {
    generateAndLoad(answers)
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
