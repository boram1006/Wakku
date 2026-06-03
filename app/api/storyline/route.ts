import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildStorylinePrompt } from '@/agent/storylinePrompt'
import { MockStorylineAgent } from '@/agent/mockStorylineAgent'
import type { ProjectInput, AnalysisResult } from '@/types/agent'
import type { Storyline } from '@/types/storyline'

const mock = new MockStorylineAgent()

function extractJson(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (fenced) return fenced[1]
  const arrStart = text.indexOf('[')
  if (arrStart !== -1) return text.slice(arrStart)
  return text
}

async function callOpenAI(
  input: ProjectInput,
  analysis?: AnalysisResult
): Promise<Storyline[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const prompt = buildStorylinePrompt(input, analysis)

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
  })

  const text = completion.choices[0]?.message?.content ?? ''
  const parsed = JSON.parse(extractJson(text)) as Storyline[]

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('LLM returned empty or non-array storylines')
  }

  return parsed
}

export async function POST(req: NextRequest) {
  const { input, analysis }: { input: ProjectInput; analysis?: AnalysisResult } =
    await req.json()

  if (process.env.OPENAI_API_KEY) {
    try {
      const storylines = await callOpenAI(input, analysis)
      return NextResponse.json(storylines)
    } catch (e) {
      console.error('[/api/storyline] OpenAI call failed, using mock fallback:', e)
    }
  } else {
    console.warn('[/api/storyline] OPENAI_API_KEY not set — using mock fallback')
  }

  const storylines = await mock.generateStorylines(input, analysis)
  return NextResponse.json(storylines)
}
