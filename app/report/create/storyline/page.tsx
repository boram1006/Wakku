'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { StorylineStep } from '@/components/input/StorylineStep'
import { PageShell } from '@/components/input/GeneratingScreen'
import { generateStorylineQuestions } from '@/agent/storylineQuestions'

export default function StorylinePage() {
  const router = useRouter()
  const {
    input, analysis, storylines, selectedStorylineId, answers,
    setAnalysis, setSelectedStorylineId,
  } = useAgentStore()

  useEffect(() => {
    if (storylines.length === 0) {
      router.replace('/report/create/input')
    }
  }, [storylines, router])

  if (!input || storylines.length === 0) return null

  const handleConfirm = () => {
    const selected = storylines.find((s) => s.id === selectedStorylineId)
    if (!selected) return

    const qs = generateStorylineQuestions(selected, input)
    const base = analysis ?? {
      detectedLayouts: [],
      detectedKpis: [],
      detectedProblems: [],
      questions: [],
    }
    setAnalysis({ ...base, questions: qs })

    if (qs.length === 0) {
      router.push('/report/create/generating')
    } else {
      router.push('/report/create/questions')
    }
  }

  return (
    <PageShell step={2}>
      <StorylineStep
        reportTitle={input.reportTitle}
        storylines={storylines}
        selectedId={selectedStorylineId}
        onSelect={setSelectedStorylineId}
        onConfirm={handleConfirm}
        onBack={() => router.back()}
      />
    </PageShell>
  )
}
