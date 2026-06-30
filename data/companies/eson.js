// (주)이손 — 화장품 제조업 (모발화장품 OEM·ODM) 사전조사 데이터
registerCompany({
  id: 'eson',
  name: '(주)이손',
  industry: '화장품 제조업 (모발화장품 OEM·ODM)',
  bizNo: null, // 미확인 — NICE/공정위 사업자정보 조회로 확정 필요 (동명법인 구분의 핵심 키)

  meta: [
    { label: '대표', value: '이정섭', evidenceKey: 'ceo' },
    { label: '설립', value: '2000.04.01', evidenceKey: 'found' },
    { label: '사원수', value: '26명', evidenceKey: 'emp' },
    { label: '자본금', value: '3억원', evidenceKey: 'cap' },
    { label: '소재', value: '인천 남동구 남동대로 345', evidenceKey: 'addr' },
  ],

  // 검색 과정에서 실제로 발견된 동명/관계사 혼동 리스크 — 데이터 기반으로 배너 렌더링
  aliasWarning: {
    title: '동명/관계사 주의',
    text: '검색 결과 (주)이손(화장품 제조, 26명)과 (주)이손화학(화장품 원료, 매출 66.5억/2023)은 별개 법인입니다. 홈페이지 esonchem.co.kr은 이손화학(원료사) 소유로 확인됩니다. 재무·매출 입력 시 반드시 사업자등록번호로 법인 일치 여부 확인 필요.',
  },

  categories: {
    capa: {
      evidenceKey: 'capa',
      rows: [
        { label: '생산 형태', value: 'OEM · ODM', confirmed: true },
        { label: '월 CAPA', value: null, note: '미확인 → 방문 실측' },
        { label: '제조 설비', value: null, note: '미확인' },
      ],
      badgeGroups: [
        { label: '생산 품목', cls: 't-form', evidenceKey: 'products',
          items: ['샴푸', '린스', '에센스', '트리트먼트', '염모제', '파마약'] },
      ],
      limitNote: '월 CAPA·설비 수치는 공개 자료에 없음. 방문 시 직접 확인 필요.',
    },

    finance: {
      evidenceKey: 'fin',
      rows: [
        { label: 'DART 공시', value: '없음 (비외감 추정)' },
        { label: '매출액', value: '⚠ 동명사 혼동 주의', danger: true },
      ],
      niceSlot: true, // NICE 반자동 조회 슬롯 표시
      limitNote: 'NICE 웹로그인 방식 → 담당자 수동 확인 후 입력(반자동).',
    },

    sanction: {
      evidenceKey: 'sanction',
      rows: [
        { label: '식약처 행정처분 이력', value: '일반 검색 기준 미발견', note: '공식 포털 직접 조회 필요' },
      ],
      limitNote: '일반 웹검색으로는 식약처 행정처분 통합공고 시스템의 회사별 결과가 색인되지 않음. 방문 전 mfds.go.kr에서 회사명/소재지로 직접 검색해 교차 확인 필요.',
    },

    clients: {
      evidenceKey: 'clients',
      rows: [
        { label: '해외 파트너십', value: '일본 사사키·산에이화학', confirmed: true },
        { label: '국내 거래처/브랜드', value: null, note: '공개 자료 없음' },
      ],
      limitNote: '국내 거래처·브랜드명은 공개 자료에서 확인 안 됨. 방문 시 주요 거래처/레퍼런스 문의 필요.',
    },

    patent: {
      evidenceKey: 'patent',
      rows: [
        { label: '특허 진행', value: '헤어 본딩케어 · 나노리포좀 원료 특허 (등록 진행)', confirmed: true },
      ],
      limitNote: '특허 출원/등록번호 미확인 — KIPRIS(kipris.or.kr)에서 출원인 "이손"으로 교차 확인 권장.',
    },

    cert: {
      evidenceKey: 'cert',
      badgeGroups: [
        { label: '인증', cls: 't-cert', items: ['CGMP 시설', 'ISO 22716', '기능성(탈모샴푸)'] },
        { label: '기술', cls: 't-tech', items: ['아미노산', '나노리포좀', 'EMACOL'] },
      ],
    },

    news: {
      evidenceKey: 'news',
      items: [
        { dot: 'grn', title: '원료+완제품 투트랙 성장 — OEM·ODM 확대', date: '코스모닝 · 이정섭 대표 인터뷰' },
        { dot: 'cyn', title: '헤어 본딩케어·나노리포좀 원료 특허 진행', date: '인코스메틱스 코리아' },
      ],
    },
  },

  visitChecklistExtra: [
    '식약처 행정처분 통합공고에서 "이손" 직접 검색해 미발견 결과 재확인',
    'KIPRIS에서 출원인 "이손" 특허 등록번호 확인',
  ],

  evidence: {
    ceo: { title: '대표자 — 이정섭', items: [
      { src: '잡코리아', color: '#22c55e', conf: 'high', val: '대표자: 이정섭',
        raw: '대표자 이정섭 · 화장품 제조 및 원료 제조', link: 'jobkorea.co.kr/company/44291817' },
      { src: '코스모닝', color: '#22b8cf', conf: 'high', val: "이정섭 대표 — '화장품 과학자', 연구원 10년·대표 25년",
        raw: "이정섭 (주)이손 대표의 아이덴티티는 '화장품 과학자'", link: 'cosmorning.com/news/article.html?no=50711' },
    ]},
    found: { title: '설립일 — 2000.04.01', items: [
      { src: '잡코리아', color: '#22c55e', conf: 'high', val: '설립일 2000.04.01 (26년차)',
        raw: '설립일 2000.04.01 (26년차) · 중소기업', link: 'jobkorea.co.kr' },
      { src: '비즈오케이', color: '#eab308', conf: 'mid', val: '설립 1999년4월 (자료별 상이)',
        raw: '설립일: 1999년4월 — 잡코리아(2000.04)와 1년 차이', link: 'bizok.incheon.go.kr' },
    ]},
    emp: { title: '사원수 — 26명', items: [
      { src: '국민연금', color: '#f97316', conf: 'high', val: '사원수 26명',
        raw: '국민연금 출처: 사원수 — 가입자 기준', link: 'saramin.co.kr' },
    ]},
    cap: { title: '자본금 — 3억원', items: [
      { src: '잡코리아', color: '#22c55e', conf: 'high', val: '자본금 3억원',
        raw: '자본금 3억원 · 중소기업', link: 'jobkorea.co.kr' },
    ]},
    addr: { title: '소재지', items: [
      { src: '비즈오케이(인천시)', color: '#22c55e', conf: 'high', val: '(21630) 인천 남동구 남동대로 345 (남촌동)',
        raw: '소재지: 인천광역시 남동구 남동대로 345 · 화장품 제조업(20433)', link: 'bizok.incheon.go.kr' },
    ]},
    capa: { title: 'CAPA·설비 근거', items: [
      { src: '잡코리아', color: '#22c55e', conf: 'mid', val: 'OEM·ODM 사업 운영',
        raw: 'OEM·ODM사업 파마먼트 웨이브, 스트레이트 크림, 샴푸, 린스, 에센스, 트리트먼트, 염모제',
        link: 'jobkorea.co.kr/Super/esonchem' },
      { src: '판단', color: '#eab308', conf: 'low', val: '월 CAPA·설비 수치는 공개자료 없음',
        raw: '홈페이지·뉴스·채용정보 어디에도 생산능력 수치 미기재 → 방문 실측 필요', link: '' },
    ]},
    products: { title: '생산 품목 출처', items: [
      { src: '잡코리아', color: '#22c55e', conf: 'high', val: '샴푸·린스·에센스·트리트먼트·염모제·파마약',
        raw: '파마먼트 웨이브, 스트레이트 크림, 샴푸, 린스, 에센스, 트리트먼트, 염모제 등의 의약외품류',
        link: 'jobkorea.co.kr/Super/esonchem' },
    ]},
    fin: { title: '재무·리스크 근거', items: [
      { src: 'DART', color: '#6b7689', conf: 'low', val: '공시 없음 (비외감 법인 추정)',
        raw: '외부감사 대상(자산 120억 등) 아니면 DART 공시 의무 없음 → 소기업이라 미공시 추정', link: '' },
      { src: '⚠ 동명사 경고', color: '#ef4444', conf: 'low', val: '매출 66.5억은 (주)이손화학 것 — (주)이손과 별개',
        raw: '인크루트: (주)이손화학 매출 66억5,133만(2023, 나이스디엔비). 이는 원료사로 (주)이손과 다른 법인. 혼동 금지.',
        link: 'incruit.com/company/3152867' },
    ]},
    sanction: { title: '행정처분·리콜 이력 근거', items: [
      { src: '웹 검색 (mfds.go.kr 일반조회)', color: '#6b7689', conf: 'low', val: '"(주)이손 화장품 행정처분" 검색 결과 회사명 매칭 없음',
        raw: '식약처 행정처분 통합공고 시스템은 회사명 검색 결과가 일반 검색엔진에 색인되지 않음. 미발견 ≠ 무혐의 — 포털에서 직접 재조회 필요.',
        link: 'mfds.go.kr/brd/m_546/list.do' },
    ]},
    clients: { title: '거래처·브랜드 근거', items: [
      { src: '코스모닝', color: '#22b8cf', conf: 'mid', val: '일본 사사키·산에이화학과 파트너십',
        raw: '원료·헤어케어 경쟁력 강화, OEM·ODM 확대. 일본 사사키·산에이화학 파트너십',
        link: 'cosmorning.com/news/article.html?no=50711' },
    ]},
    patent: { title: '특허·지식재산권 근거', items: [
      { src: '인코스메틱스 코리아', color: '#8b5cf6', conf: 'mid', val: '헤어 본딩케어·나노리포좀 원료 특허 등록 진행',
        raw: '헤어 본딩케어·나노-리포좀 특허등록 진행', link: '' },
      { src: '판단', color: '#eab308', conf: 'low', val: 'KIPRIS 등록번호 미확인',
        raw: '출원인 "이손"으로 KIPRIS 직접 검색 시 등록번호·청구항 교차확인 가능', link: 'kipris.or.kr' },
    ]},
    news: { title: '근황·기사 출처', items: [
      { src: '코스모닝', color: '#22b8cf', conf: 'high', val: '투트랙 성장 + 나노리포좀 특허',
        raw: '원료·헤어케어 경쟁력 강화, OEM·ODM 확대. 헤어 본딩케어·나노-리포좀 특허등록 진행. 일본 사사키·산에이화학 파트너십',
        link: 'cosmorning.com/news/article.html?no=50711' },
    ]},
    cert: { title: '인증·기술 출처', items: [
      { src: '잡코리아 연혁', color: '#22c55e', conf: 'high', val: 'CGMP·ISO22716·탈모샴푸 허가',
        raw: '2018 ISO22716 인증, 기능성화장품(탈모샴푸) 허가 / 2017 인천 남동공단 CGMP 시설 완료',
        link: 'jobkorea.co.kr' },
    ]},
  },
});
