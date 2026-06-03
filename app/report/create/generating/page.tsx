'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { useReportStore } from '@/store/reportStore'
import { GeneratingScreen } from '@/components/input/GeneratingScreen'
import { generatePagesFromStoryline } from '@/agent/storylinePageGenerator'

export default function GeneratingPage() {
  const router = useRouter()
  const { input, storylines, selectedStorylineId, answers } = useAgentStore()
  const loadReport = useReportStore((s) => s.loadReport)

  useEffect(() => {
    const selected = storylines.find((s) => s.id === selectedStorylineId)
    if (!selected || !input) {
      router.replace('/report/create/storyline')
      return
    }

    const timer = setTimeout(() => {
      try {
        const pages = generatePagesFromStoryline(selected, input, answers)
        loadReport({ brand: input.reportTitle, pages })
        router.replace('/editor')
      } catch (e) {
        console.error('page generation failed:', e)
        router.replace('/report/create/storyline')
      }
    }, 600)

    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GeneratingScreen
      heading="보고자료를 생성하고 있습니다"
      title={input?.reportTitle ?? ''}
    />
  )
}
