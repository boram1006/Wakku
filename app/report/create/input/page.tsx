'use client'

import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/agentStore'
import { InputForm } from '@/components/input/InputForm'
import { PageShell } from '@/components/input/GeneratingScreen'
import type { ProjectInput } from '@/types/agent'

export default function InputPage() {
  const router = useRouter()
  const setInput = useAgentStore((s) => s.setInput)

  const handleSubmit = (data: ProjectInput) => {
    setInput(data)
    router.push('/report/create/analysis')
  }

  return (
    <PageShell step={1}>
      <InputForm onSubmit={handleSubmit} />
    </PageShell>
  )
}
