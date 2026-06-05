'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { AgentQuestions } from '@/components/input/AgentQuestions'
import { PageShell } from '@/components/input/GeneratingScreen'

export default function QuestionsPage() {
  const router = useRouter()
  const { input, analysis, answers, storylines, selectedStorylineId, setAnswer } = useAgentStore()

  const selectedStoryline = storylines.find((s) => s.id === selectedStorylineId)

  useEffect(() => {
    if (!input || !analysis || analysis.questions.length === 0) {
      router.replace('/report/create/storyline')
    }
  }, [input, analysis, router])

  if (!input || !analysis || analysis.questions.length === 0) return null

  return (
    <PageShell step={3}>
      <AgentQuestions
        reportTitle={input.reportTitle}
        analysis={analysis}
        selectedStoryline={selectedStoryline}
        answers={answers}
        onAnswer={setAnswer}
        onGenerate={() => router.push('/report/create/generating')}
        onBack={() => router.back()}
      />
    </PageShell>
  )
}
