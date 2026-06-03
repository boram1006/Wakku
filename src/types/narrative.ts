import type { StorylinePageRole } from './storyline'
import type { LayoutType } from './report'

export interface NarrativePage {
  id: string
  order: number
  sectionLabel: string
  role: StorylinePageRole
  purpose: string
  layoutType: LayoutType
}

export interface NarrativePlan {
  nature: string
  persuasionFlow: string[]
  pages: NarrativePage[]
  excludedTopics: string[]
}
