import type { ProjectInput, AnalysisResult } from '@/types/agent'
import type { Storyline } from '@/types/storyline'
import { buildStorylinePrompt } from './storylinePrompt'

// ── Interface ─────────────────────────────────────────────────────────────────

export interface StorylineAgent {
  generateStorylines(input: ProjectInput, analysis?: AnalysisResult): Promise<Storyline[]>
}

// ── LLM Skeleton ──────────────────────────────────────────────────────────────

/**
 * LLM 기반 Storyline 생성 Agent (skeleton).
 *
 * 현재는 API 라우트 미연결 상태입니다.
 * 연결 방법:
 *   1. app/api/storyline/route.ts 를 생성합니다.
 *   2. route.ts 에서 서버사이드 환경변수로 Anthropic/OpenAI API를 호출합니다.
 *      (API key를 클라이언트 코드에 포함하지 마세요.)
 *   3. 아래 fetch 주석을 해제하고 에러 throw를 제거합니다.
 */
export class LlmStorylineAgent implements StorylineAgent {
  async generateStorylines(
    input: ProjectInput,
    analysis?: AnalysisResult
  ): Promise<Storyline[]> {
    const prompt = buildStorylinePrompt(input, analysis)

    // TODO: POST to /api/storyline (server route)
    //
    // const res = await fetch('/api/storyline', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ prompt }),
    // })
    // if (!res.ok) throw new Error(`Storyline API error: ${res.status}`)
    // const data: Storyline[] = await res.json()
    // return data

    console.debug('[LlmStorylineAgent] prompt built, length:', prompt.length)
    throw new Error(
      '[LlmStorylineAgent] API route not yet connected. ' +
      'Create app/api/storyline/route.ts and wire up the LLM call server-side. ' +
      'Use MockStorylineAgent for development.'
    )
  }
}
