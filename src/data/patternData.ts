// Sample data shapes — used by pattern components as default props
// Kept separate so future ReportBlock.type:'pattern' can import same data

export interface ActivityItem {
  id: string
  category: string        // e.g. "데이터 수집"
  activity: string        // activity name
  currentTime: number     // minutes
  reducedTime: number     // minutes after improvement
  automatable: boolean
  detail?: string         // shown on expand
}

export interface AsIsToBeItem {
  id: string
  dimension: string       // e.g. "처리 속도"
  asIs: string
  toBe: string
  impact: 'high' | 'medium' | 'low'
  detail?: string
}

export const SAMPLE_ACTIVITY_ITEMS: ActivityItem[] = [
  { id: 'a1', category: '데이터 수집', activity: '수동 데이터 입력', currentTime: 120, reducedTime: 10, automatable: true, detail: 'RPA 적용으로 90% 시간 단축 가능. 일 평균 120분 → 10분' },
  { id: 'a2', category: '데이터 수집', activity: '보고서 취합', currentTime: 90, reducedTime: 15, automatable: true, detail: '자동 집계 파이프라인 구축 시 취합 시간 80% 절감' },
  { id: 'a3', category: '검토/승인', activity: '1차 검토', currentTime: 60, reducedTime: 40, automatable: false, detail: '담당자 검토는 필수. 단 사전 AI 요약본 제공으로 40분 단축' },
  { id: 'a4', category: '검토/승인', activity: '승인 대기', currentTime: 180, reducedTime: 30, automatable: false, detail: '비동기 알림 시스템 도입으로 대기 시간 단축' },
  { id: 'a5', category: '배포', activity: '결과 배포', currentTime: 45, reducedTime: 5, automatable: true, detail: '자동 발송 시스템 연동 시 배포 즉시 처리' },
  { id: 'a6', category: '배포', activity: '피드백 수집', currentTime: 30, reducedTime: 20, automatable: false, detail: '설문 자동화로 수집 시간 단축, 분석은 수동 유지' },
]

export const SAMPLE_ASIS_TOBE_ITEMS: AsIsToBeItem[] = [
  { id: 't1', dimension: '처리 속도', asIs: '수동 처리로 평균 3일 소요', toBe: '자동화로 당일 처리 (2시간 이내)', impact: 'high', detail: '핵심 병목 제거. 배치 처리 → 실시간 스트리밍으로 전환' },
  { id: 't2', dimension: '오류율', asIs: '수작업 입력 오류 월 평균 12건', toBe: '자동 검증으로 오류 95% 감소', impact: 'high', detail: '입력 단계 validation + 이중 확인 로직 추가' },
  { id: 't3', dimension: '담당자 업무량', asIs: '주 20시간 반복 업무', toBe: '주 3시간 예외처리만 담당', impact: 'high', detail: 'RPA + AI 조합으로 루틴 업무 자동화' },
  { id: 't4', dimension: '가시성', asIs: '진행 상태 파악 불가 (수동 확인)', toBe: '실시간 대시보드 모니터링', impact: 'medium', detail: '관제 시스템 연동으로 전 단계 트래킹 가능' },
  { id: 't5', dimension: '확장성', asIs: '처리량 증가 시 인력 추가 필요', toBe: '서버 스케일아웃으로 대응', impact: 'medium', detail: '클라우드 인프라 전환으로 비용 효율적 확장' },
]
