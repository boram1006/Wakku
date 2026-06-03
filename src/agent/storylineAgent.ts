import type { ProjectInput, AnalysisResult } from '@/types/agent'
import type { Storyline } from '@/types/storyline'

// ── Interface ─────────────────────────────────────────────────────────────────

export interface StorylineAgent {
  generateStorylines(input: ProjectInput, analysis?: AnalysisResult): Promise<Storyline[]>
}

// ── LLM Agent ─────────────────────────────────────────────────────────────────

export class LlmStorylineAgent implements StorylineAgent {
  async generateStorylines(
    input: ProjectInput,
    analysis?: AnalysisResult
  ): Promise<Storyline[]> {
    const res = await fetch('/api/storyline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, analysis }),
    })
    if (!res.ok) throw new Error(`[LlmStorylineAgent] /api/storyline responded ${res.status}`)
    return res.json() as Promise<Storyline[]>
  }
}
