// Pattern data shapes and sample variants.
// Kept separate so future ReportBlock.type:'pattern' can import same data.
//
// Migration note (ReportBlock):
//   block.patternType: 'activity-reduction' | 'asis-tobe-transformation'
//   block.variantId: string  → look up in ACTIVITY_VARIANTS / ASIS_TOBE_VARIANTS
//   block.headline: string   → overrides variant default, stored as page.subtitle
//   block.items: ActivityItem[] | AsIsToBeItem[]  → future: user-editable via JSON
//
// For now: variantId stored on ReportPage.patternVariantId, headline on page.subtitle.

export interface ActivityItem {
  id: string
  category: string
  activity: string
  currentTime: number   // minutes
  reducedTime: number   // minutes after AI intervention
  automatable: boolean
  detail?: string
}

export interface AsIsToBeItem {
  id: string
  dimension: string
  asIs: string
  toBe: string
  impact: 'high' | 'medium' | 'low'
  detail?: string
}

export interface PatternVariant<T> {
  id: string
  label: string       // shown in picker chip
  headline: string    // 핵심 메시지 — displayed at top of pattern
  items: T[]
}

// ── Activity Reduction Variants ──────────────────────────────────────────────

const REPORT_ACTIVITY_ITEMS: ActivityItem[] = [
  { id: 'r1', category: '데이터 수집', activity: '수동 데이터 입력', currentTime: 120, reducedTime: 10, automatable: true, detail: 'RPA + AI OCR 적용 시 반복 입력 업무 90% 자동화. 예외 건만 수동 확인.' },
  { id: 'r2', category: '데이터 수집', activity: '부서별 보고서 취합', currentTime: 90, reducedTime: 15, automatable: true, detail: '자동 집계 파이프라인 구축 시 취합 시간 83% 절감. Slack/메일 수신 포함.' },
  { id: 'r3', category: '검토/승인', activity: 'AI 요약본 기반 1차 검토', currentTime: 60, reducedTime: 20, automatable: false, detail: '담당자 검토는 필수. 단 AI 사전 요약본 제공으로 컨텍스트 파악 시간 67% 단축.' },
  { id: 'r4', category: '검토/승인', activity: '승인 대기 및 알림 확인', currentTime: 180, reducedTime: 30, automatable: false, detail: '비동기 알림 시스템 + 모바일 승인 도입으로 평균 대기 3시간 → 30분.' },
  { id: 'r5', category: '배포', activity: '완료 보고서 배포', currentTime: 45, reducedTime: 5, automatable: true, detail: '자동 발송 + 배포 이력 기록. 수신자 목록 관리도 자동화 가능.' },
  { id: 'r6', category: '배포', activity: '피드백 수집 및 정리', currentTime: 30, reducedTime: 20, automatable: false, detail: '설문 발송은 자동화. 피드백 해석과 우선순위 결정은 수동 유지.' },
]

const UX_REVIEW_ACTIVITY_ITEMS: ActivityItem[] = [
  { id: 'u1', category: '리서치', activity: '사용자 인터뷰 분석', currentTime: 180, reducedTime: 30, automatable: true, detail: 'AI 클러스터링으로 발화 그룹화 자동화. 핵심 인사이트 추출 시간 83% 단축.' },
  { id: 'u2', category: '리서치', activity: 'UX 시나리오 초안 작성', currentTime: 120, reducedTime: 40, automatable: false, detail: 'AI가 인터뷰 기반 시나리오 초안 생성. 담당자는 검수·보완 역할로 전환.' },
  { id: 'u3', category: '설계', activity: 'GUI Draft 검토', currentTime: 90, reducedTime: 15, automatable: true, detail: 'AI가 디자인 시스템 위반·일관성 오류 자동 탐지. 담당자는 의도적 예외만 검토.' },
  { id: 'u4', category: '설계', activity: '디자인 피드백 정리', currentTime: 60, reducedTime: 10, automatable: true, detail: 'Figma 코멘트 → 구조화 피드백 자동 변환. 중복 의견 병합 포함.' },
  { id: 'u5', category: '의사결정', activity: '개선 우선순위 결정', currentTime: 45, reducedTime: 30, automatable: false, detail: '영향도 매트릭스 자동 생성. 최종 결정은 PO와 협의 필요.' },
  { id: 'u6', category: '의사결정', activity: 'QA 체크리스트 작성', currentTime: 30, reducedTime: 5, automatable: true, detail: '시나리오 기반 체크리스트 자동 생성. 신규 엣지케이스만 수동 추가.' },
]

const AD_COPY_ACTIVITY_ITEMS: ActivityItem[] = [
  { id: 'c1', category: '사전 조사', activity: '경쟁사 광고 크리에이티브 조사', currentTime: 90, reducedTime: 10, automatable: true, detail: 'AI 크롤링 + 요약으로 경쟁사 10개사 조사 시간 89% 단축. 트렌드 리포트 자동 생성.' },
  { id: 'c2', category: '사전 조사', activity: '타겟 오디언스 인사이트 분석', currentTime: 60, reducedTime: 15, automatable: true, detail: '1st party 데이터 기반 AI 세그먼트 분석. 수동 크로스탭 분석 대체.' },
  { id: 'c3', category: '제작', activity: '카피 초안 작성 (20개 변형)', currentTime: 120, reducedTime: 20, automatable: true, detail: 'LLM 기반 멀티 변형 카피 생성. 브랜드 톤 가이드 학습 후 품질 향상.' },
  { id: 'c4', category: '제작', activity: 'A/B 테스트 기획 및 설정', currentTime: 45, reducedTime: 20, automatable: false, detail: 'AI가 테스트 가설 추천. 최종 기획 및 예산 배분은 담당자 결정.' },
  { id: 'c5', category: '분석', activity: '캠페인 성과 리포트 작성', currentTime: 60, reducedTime: 5, automatable: true, detail: '광고 플랫폼 API 연동 → 자동 리포트 생성. 주요 수치 내러티브 자동화.' },
  { id: 'c6', category: '분석', activity: '인사이트 도출 및 제안', currentTime: 40, reducedTime: 25, automatable: false, detail: 'AI가 패턴과 이상값 탐지. 전략적 해석과 다음 캠페인 방향성은 수동 유지.' },
]

export const ACTIVITY_VARIANTS: PatternVariant<ActivityItem>[] = [
  {
    id: 'report-workflow',
    label: '보고서 생성',
    headline: '반복 보고 업무 6개 항목, AI 자동화로 주간 8.4시간 절감',
    items: REPORT_ACTIVITY_ITEMS,
  },
  {
    id: 'ux-review',
    label: 'UX 검토',
    headline: 'AI 보조 리뷰 도입으로 UX 검토 사이클 4일 → 1일로 단축',
    items: UX_REVIEW_ACTIVITY_ITEMS,
  },
  {
    id: 'ad-copy',
    label: '광고 카피',
    headline: 'AI 카피 생성으로 캠페인 1건당 제작 시간 73% 절감, 전략 집중 가능',
    items: AD_COPY_ACTIVITY_ITEMS,
  },
]

// ── As-Is / To-Be Variants ───────────────────────────────────────────────────

const DATA_PIPELINE_ITEMS: AsIsToBeItem[] = [
  { id: 'p1', dimension: '처리 속도', asIs: '수동 처리로 평균 3일 소요', toBe: '자동화로 당일 처리 (2시간 이내)', impact: 'high', detail: '핵심 병목 제거. 배치 처리 → 실시간 스트리밍으로 전환.' },
  { id: 'p2', dimension: '오류율', asIs: '수작업 입력 오류 월 평균 12건', toBe: '자동 검증으로 오류 95% 감소', impact: 'high', detail: '입력 단계 validation + AI 이중 확인 로직으로 휴먼 에러 차단.' },
  { id: 'p3', dimension: '담당자 업무량', asIs: '주 20시간 반복 입력·취합 업무', toBe: '주 3시간 예외처리 및 의사결정만', impact: 'high', detail: 'RPA + AI 조합으로 루틴 업무 자동화. 담당자는 판단이 필요한 건만 처리.' },
  { id: 'p4', dimension: '가시성', asIs: '진행 상태 파악 불가 (수동 확인 필요)', toBe: '실시간 대시보드 모니터링', impact: 'medium', detail: '관제 시스템 연동으로 전 단계 트래킹. 이상 발생 시 자동 알림.' },
  { id: 'p5', dimension: '확장성', asIs: '처리량 증가 시 인력 추가 필요', toBe: '서버 스케일아웃으로 탄력 대응', impact: 'medium', detail: '클라우드 인프라 전환으로 비용 효율적 확장. 피크 타임 자동 스케일링.' },
]

const UX_PROCESS_ITEMS: AsIsToBeItem[] = [
  { id: 'ux1', dimension: '검토 방식', asIs: '팀원 순차 수기 검토 (1인 완료 후 다음)', toBe: 'AI 1차 스크리닝 → 팀원 병렬 집중 검토', impact: 'high', detail: '직렬 → 병렬 전환으로 리드타임 75% 단축. AI가 명백한 이슈를 사전 분류.' },
  { id: 'ux2', dimension: '소요 기간', asIs: '평균 4일 (팀 일정·회의 의존)', toBe: '당일 처리 (Agent 비동기 병렬 검토)', impact: 'high', detail: '일정 의존성 제거. 24/7 Agent 검토로 병목 없는 흐름.' },
  { id: 'ux3', dimension: '피드백 형태', asIs: '구두 전달·Notion 메모 산재', toBe: '구조화 JSON 피드백 + 우선순위 자동 정렬', impact: 'medium', detail: '피드백 추적 가능. 이전 이슈와의 연관성 자동 연결.' },
  { id: 'ux4', dimension: '반복 이슈 처리', asIs: '매 스프린트 동일 이슈 수동 재확인', toBe: '패턴 기반 자동 플래그 + 히스토리 연결', impact: 'medium', detail: '과거 동일 지적 재발 방지. 이슈 데이터베이스 자동 축적.' },
  { id: 'ux5', dimension: '도구 통합', asIs: 'Figma·Notion·Slack 수동 크로스 연동', toBe: 'Wakku 통합 워크플로우 단일 진입', impact: 'low', detail: '컨텍스트 스위칭 제거. 모든 산출물이 단일 워크플로우에서 관리.' },
]

const AD_CAMPAIGN_ITEMS: AsIsToBeItem[] = [
  { id: 'ad1', dimension: '타겟 설정', asIs: '담당자 경험 기반 수동 오디언스 설정', toBe: 'AI 행동 데이터 기반 자동 타겟팅 + 유사 오디언스', impact: 'high', detail: '신규 캠페인 설정 시간 80% 단축. 데이터 기반으로 감이 아닌 근거로 결정.' },
  { id: 'ad2', dimension: '카피 생성', asIs: '카피라이터 1인 2일, 10개 변형 작성', toBe: 'AI 초안 30분 + 검수 30분, 50개 변형', impact: 'high', detail: '변형 수 5배 증가. 카피라이터는 방향성 설계와 최종 검수에 집중.' },
  { id: 'ad3', dimension: '성과 모니터링', asIs: '일 1회 수동 플랫폼 접속 확인', toBe: '실시간 대시보드 + 임계치 초과 시 자동 알림', impact: 'medium', detail: '이상 지표 즉각 대응 가능. 광고비 낭비 최소화.' },
  { id: 'ad4', dimension: '최적화 주기', asIs: '주 1회 수동 bid·예산 조정', toBe: '시간별 자동 bid 조정 (ROAS 목표 기반)', impact: 'medium', detail: '최적화 빈도 168배 증가. 피크 타임 자동 예산 증액.' },
  { id: 'ad5', dimension: '보고서 작성', asIs: '마케터 주 2시간, 수동 수치 취합', toBe: '자동 주간 레포트 + 인사이트 요약 발송', impact: 'low', detail: '레포트 작성 시간 zero. 마케터는 전략 수립에 집중 가능.' },
]

export const ASIS_TOBE_VARIANTS: PatternVariant<AsIsToBeItem>[] = [
  {
    id: 'data-pipeline',
    label: '데이터 파이프라인',
    headline: '수작업 중심 데이터 처리를 실시간 AI 파이프라인으로 전환',
    items: DATA_PIPELINE_ITEMS,
  },
  {
    id: 'ux-process',
    label: 'UX 검토 프로세스',
    headline: '직렬 수동 검토에서 Agent 기반 병렬 검토로 전환, 리드타임 75% 단축',
    items: UX_PROCESS_ITEMS,
  },
  {
    id: 'ad-campaign',
    label: '광고 캠페인 운영',
    headline: '수동 캠페인 관리에서 AI 자동 최적화 루프로 전환',
    items: AD_CAMPAIGN_ITEMS,
  },
]

// Convenience re-exports for section templates that need a default
export const SAMPLE_ACTIVITY_ITEMS = ACTIVITY_VARIANTS[0].items
export const SAMPLE_ASIS_TOBE_ITEMS = ASIS_TOBE_VARIANTS[0].items
