// 카테고리 스키마 — 모든 화장품 제조업체 사전조사에 공통 적용
// 신규 업체 추가 시 이 스키마를 수정할 필요 없이 data/companies/<id>.js 만 작성하면 됨
const CATEGORY_SCHEMA = [
  {
    id: 'capa',
    label: 'CAPA · 설비',
    icon: '🏭',
    color: 'red',
    priority: 1,
    sourceHint: '채용공고(잡코리아/사람인), 회사 홈페이지, 방문 실측',
  },
  {
    id: 'finance',
    label: '재무 · 신용리스크',
    icon: '💰',
    color: 'yellow',
    priority: 1,
    sourceHint: 'DART(dart.fss.or.kr) 공시, NICE평가정보(반자동 — 로그인 필요)',
  },
  {
    id: 'sanction',
    label: '행정처분 · 리콜 이력',
    icon: '🚨',
    color: 'red',
    priority: 1,
    sourceHint: '식약처 행정처분 통합공고(mfds.go.kr), 의약품안전나라 회수정보',
  },
  {
    id: 'clients',
    label: '거래처 · 브랜드 포트폴리오',
    icon: '🤝',
    color: 'cyan',
    priority: 2,
    sourceHint: '업계 매체 인터뷰, 채용공고 내 주요거래처 언급, 전시회 참가이력',
  },
  {
    id: 'patent',
    label: '특허 · 지식재산권',
    icon: '🔬',
    color: 'violet',
    priority: 2,
    sourceHint: 'KIPRIS(kipris.or.kr) 출원인 검색, 보도자료',
  },
  {
    id: 'cert',
    label: '인증 · 기술력',
    icon: '🎖',
    color: 'violet',
    priority: 2,
    sourceHint: '회사 홈페이지, 채용공고 연혁, 보도자료',
  },
  {
    id: 'news',
    label: '근황 · 기사',
    icon: '📰',
    color: 'cyan',
    priority: 3,
    sourceHint: '코스모닝, 인코스메틱스 코리아 등 업계 매체',
  },
];

// 공개 자료로 사실상 수집이 불가능한 항목(MOQ·리드타임·단가·인력구성 등)은
// 별도 카테고리 카드로 만들지 않고, 방문 시 확인할 "체크리스트" 항목으로만 다룬다.
// (data/companies/<id>.js 의 visitChecklistExtra 에서 업체별 항목 추가 가능)
const DEFAULT_VISIT_CHECKLIST = [
  'MOQ(최소발주수량) 확인',
  '리드타임(생산~출고) 확인',
  '단가표 / 견적 기준 확인',
  '품질관리(QC) 프로세스 및 불량 대응 확인',
  '클레임·리콜 대응 프로세스 확인',
  '설비 리스트 및 월 CAPA 실측',
  '사업자등록번호 확인 후 NICE/DART 동일 법인 여부 재확인',
];
