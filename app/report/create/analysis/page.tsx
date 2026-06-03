'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { GeneratingScreen } from '@/components/input/GeneratingScreen'
import { LlmStorylineAgent } from '@/agent/storylineAgent'
import type { AnalysisResult } from '@/types/agent'

const storylineAgent = new LlmStorylineAgent()

export default function AnalysisPage() {
  const router = useRouter()
  const { input, setAnalysis, setStorylines, setSelectedStorylineId } = useAgentStore()

  useEffect(() => {
    if (!input) {
      router.replace('/report/create/input')
      return
    }

    let cancelled = false

    async function run() {
      let result: AnalysisResult = {
        detectedLayouts: [],
        detectedKpis: [],
        detectedProblems: [],
        questions: [],
      }

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        result = await res.json()
      } catch (e) {
        console.error('analyze failed:', e)
      }

      if (cancelled) return
      setAnalysis(result)

      const candidates = await storylineAgent.generateStorylines(input!, result)
      if (cancelled) return

      setStorylines(candidates)
      setSelectedStorylineId(candidates[0]?.id ?? null)
      router.replace('/report/create/storyline')
    }

    run()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GeneratingScreen
      heading="자료를 분석하고 있습니다"
      title={input?.reportTitle ?? ''}
    />
  )
}
