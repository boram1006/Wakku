'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useReportStore } from '@/store/reportStore'
import { ReportViewer } from '@/components/ReportViewer'

export default function EditorPage() {
  const router = useRouter()
  const pages = useReportStore((s) => s.pages)

  useEffect(() => {
    if (pages.length === 0) {
      router.replace('/report/create/input')
    }
  }, [pages, router])

  if (pages.length === 0) return null

  return <ReportViewer />
}
