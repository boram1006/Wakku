import type { Report } from '@/types/report'

export const mockReport: Report = {
  brand: 'Sample Report',
  sections: [
    {
      id: 'scope',
      type: 'scope',
      kicker: '01 · 보고 범위',
      title: '진행 과제 현황과\n후속 판단 지점을 분리해 보고합니다',
      subtitle:
        '오늘은 현재 진행 중인 과제의 현황과 데모를 중심으로 보고하고, 추가 요청 범위는 별도 검토 대상으로 정리합니다.',
      isMuted: true,
      cards: [
        {
          label: '오늘 보고',
          labelAccent: true,
          title: '진행 현황 및 결과',
          desc: '현재까지의 실행 결과와 확인된 효과를 공유합니다.',
          emphasis: true,
        },
        {
          label: '후속 검토',
          title: '확대 적용 범위',
          desc: '추가 요청은 범위, 일정, 책임 기준을 분리해 검토합니다.',
        },
        {
          label: '판단 지점',
          title: '다음 단계 추진 여부',
          desc: '효과와 리스크를 기준으로 후속 추진 방향을 결정합니다.',
        },
      ],
    },
    {
      id: 'overview',
      type: 'overview',
      kicker: '02 · 개요',
      title: '세부 설명에 앞서,\n핵심 수치와 추진 방향만 먼저 봅니다',
      subtitle: '아래 수치는 프로젝트 1건 기준으로 산정한 예시값입니다.',
      isMuted: false,
      cards: [
        {
          kpiNum: '42',
          kpiUnit: 'h',
          title: '작업시간 절감',
          desc: '적용 구간 기준의 직접 절감 효과입니다.',
        },
        {
          kpiNum: '38',
          kpiUnit: '%',
          title: '개선 대상 절감률',
          desc: '개선 대상 업무 기준으로 환산한 값입니다.',
          emphasis: true,
        },
        {
          kpiNum: '12',
          kpiUnit: '%',
          title: '전체 기준 환산',
          desc: '전체 업무량 기준의 보수적 환산값입니다.',
        },
      ],
    },
    {
      id: 'problem',
      type: 'problem',
      kicker: '03 · 문제 정의',
      title: '현재 문제는 업무량보다,\n다음 단계로 이어지지 않는 산출물 구조입니다',
      subtitle:
        '단계가 많다는 사실보다, 사람이 다시 해석해야 하는 구조가 병목을 만듭니다.',
      isMuted: true,
      cards: [
        {
          label: 'Problem 01',
          title: '재해석이 필요한 중간 산출물',
          desc: '중간 결과가 다음 단계의 입력값으로 그대로 이어지지 않아 사람이 다시 해석합니다.',
        },
        {
          label: 'Problem 02',
          title: '업무 구조와 기준의 분리',
          desc: '역할별 산출물과 기준이 분리되어 반복 작업과 재작업이 발생합니다.',
        },
        {
          label: 'Problem 03',
          title: '데이터화되지 않은 지식',
          desc: '가이드, 체크리스트, 노하우가 시스템이 읽을 수 있는 형태로 준비되어 있지 않습니다.',
        },
      ],
    },
    {
      id: 'timeline',
      type: 'timeline',
      kicker: '04 · 추진 일정',
      title: '확정 일정과 검토 예정 일정을\n분리해 정리합니다',
      subtitle: '단계별 범위는 확정 후 즉시 업데이트합니다.',
      isMuted: false,
      rows: [
        { label: '1단계 · 6월', text: '현황 분석 및 입력 구조 정의. 기준 데이터 수집 범위 확정.' },
        { label: '2단계 · 7월', text: 'MVP 기능 구현 및 내부 검증. 반복 업무 초안 생성 자동화 적용.' },
        { label: '3단계 · 8월', text: '운영 적용 및 효과 측정. 산정 기준 문서화 및 피드백 반영.' },
        { label: '후속 검토', text: '확대 적용 범위 및 조직 R&R은 3단계 완료 후 별도 검토합니다.' },
      ],
    },
    {
      id: 'tobe',
      type: 'tobe',
      kicker: '05 · 개선 방향',
      title: '단순 자동화가 아니라,\nWorkflow가 이어지는 구조로 바꿉니다',
      subtitle:
        '입력과 산출물이 연결되고, 사람의 판단과 시스템 실행 범위가 분리되도록 구성합니다.',
      isMuted: true,
      steps: [
        {
          num: '01',
          title: '입력 구조 정리',
          desc: '업무 요청과 기준을 시스템이 읽을 수 있게 분리합니다.',
        },
        {
          num: '02',
          title: '중간 산출물 생성',
          desc: '검토 가능한 초안을 빠르게 확보합니다.',
        },
        {
          num: '03',
          title: '검토·수정·확정',
          desc: '현업 판단이 필요한 영역은 사람이 검증합니다.',
        },
      ],
      callout:
        '이 구조가 작동하려면 기능 구현과 함께 기준, 데이터, 운영 방식이 함께 준비되어야 합니다.',
    },
    {
      id: 'effect',
      type: 'effect',
      kicker: '06 · 기대효과',
      title: '직접 효과와 간접 효과를 분리해 설명합니다',
      subtitle:
        '단순 절감률뿐 아니라 후속 적용을 위한 조건과 판단 근거도 함께 제시합니다.',
      isMuted: false,
      cards: [
        {
          label: '직접 효과',
          labelAccent: true,
          title: '시간·리드타임·반복 업무 절감',
          desc: '현재 적용 범위에서 바로 기대할 수 있는 효과입니다. 반드시 산정 기준을 함께 표시합니다.',
          emphasis: true,
        },
        {
          label: '간접 효과',
          title: '후속 전개 조건 확보',
          desc: '운영 기준, 데이터 구조, 표준화 방식 등 다음 단계 의사결정에 필요한 조건을 확보합니다.',
        },
      ],
    },
  ],
}
