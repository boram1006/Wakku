export type StorylineRuleCategory = 'structure' | 'message' | 'content' | 'language'

export interface StorylineRule {
  id: string
  category: StorylineRuleCategory
  rule: string
}

export const STORYLINE_RULES: StorylineRule[] = [
  // ── Structure ──────────────────────────────────────────────────────────────
  {
    id: 'SR01',
    category: 'structure',
    rule: '목차를 먼저 만들지 않는다. 보고받는 사람이 무엇을 납득해야 하는지부터 정의한다.',
  },
  {
    id: 'SR02',
    category: 'structure',
    rule: '페이지 순서는 고정 목차가 아니라 설득 흐름에 따라 달라진다.',
  },
  {
    id: 'SR03',
    category: 'structure',
    rule: '"개요 → As-Is → To-Be" 같은 일반 목차 구조를 그대로 쓰지 않는다.',
  },
  {
    id: 'SR04',
    category: 'structure',
    rule: '보고 범위 / 하지 않는 것 / 확정된 것 / 검토 중인 것을 반드시 분리한다.',
  },
  {
    id: 'SR05',
    category: 'structure',
    rule: '실행방안은 문제와 효과를 납득시킨 뒤 배치한다.',
  },
  {
    id: 'SR06',
    category: 'structure',
    rule: '한 페이지는 하나의 핵심 메시지만 가져야 한다.',
  },
  {
    id: 'SR07',
    category: 'structure',
    rule: '확정 범위와 후속 검토 범위를 분리한다.',
  },

  // ── Message ────────────────────────────────────────────────────────────────
  {
    id: 'SM01',
    category: 'message',
    rule: '단순 현황보다 "왜 바꿔야 하는가"를 먼저 설명한다.',
  },
  {
    id: 'SM02',
    category: 'message',
    rule: '전사 전략이나 상위 로드맵이 있으면 내 과제의 위치를 먼저 포지셔닝한다.',
  },
  {
    id: 'SM03',
    category: 'message',
    rule: '데모 보고는 설명보다 "무엇을 확인할 것인가"를 먼저 제시한다.',
  },
  {
    id: 'SM04',
    category: 'message',
    rule: 'reportContext(보고 맥락)은 이 보고가 왜 지금 필요한지, 보고 대상이 먼저 납득해야 할 전제를 담는 핵심 맥락이다.',
  },
  {
    id: 'SM05',
    category: 'message',
    rule: '보고 대상이 먼저 납득해야 할 전제를 명확히 정의한다.',
  },

  // ── Content ────────────────────────────────────────────────────────────────
  {
    id: 'SC01',
    category: 'content',
    rule: '효과는 직접 효과와 간접 효과로 구분한다.',
  },
  {
    id: 'SC02',
    category: 'content',
    rule: '숫자는 반드시 산정 기준과 함께 제시한다.',
  },
  {
    id: 'SC03',
    category: 'content',
    rule: 'To-Be는 이상향이 아니라 무엇이 어떻게 바뀌는지 보여준다.',
  },
  {
    id: 'SC04',
    category: 'content',
    rule: '역할/R&R은 단순 담당자 나열이 아니라 왜 그 역할 구분이 필요한지 설명한다.',
  },

  // ── Language ───────────────────────────────────────────────────────────────
  {
    id: 'SL01',
    category: 'language',
    rule: '"검토, 지원, 확산, 고도화, 기준, 체계" 같은 추상어는 가능하면 구체화한다.',
  },
  {
    id: 'SL02',
    category: 'language',
    rule: 'AI스럽고 일률적인 문장을 피한다.',
  },
  {
    id: 'SL03',
    category: 'language',
    rule: '카드 제목과 본문이 같은 말을 반복하지 않는다.',
  },
  {
    id: 'SL04',
    category: 'language',
    rule: '보고자료는 예쁜 것보다 메시지가 선명해야 한다.',
  },
]

/** Prompt 삽입용 plain text */
export const RULES_TEXT = STORYLINE_RULES.map((r) => `[${r.id}] ${r.rule}`).join('\n')

/** 카테고리별 그룹 */
export function getRulesByCategory(category: StorylineRuleCategory): StorylineRule[] {
  return STORYLINE_RULES.filter((r) => r.category === category)
}
