// 공용 렌더링 엔진 — 카테고리 스키마 + 회사 데이터만 있으면 어떤 업체든 동일하게 렌더링
const COLOR_BG = {
  red: 'rgba(239,68,68,.15)', yellow: 'rgba(234,179,8,.15)',
  cyan: 'rgba(34,184,207,.15)', violet: 'rgba(139,92,246,.15)',
  green: 'rgba(34,197,94,.15)', orange: 'rgba(249,115,22,.15)',
};
const PRIORITY_CLS = { 1: 'p1', 2: 'p2', 3: 'p3' };

function loadCompanies() {
  return Promise.all(COMPANY_FILES.map(id => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `data/companies/${id}.js`;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  })));
}

function init() {
  const params = new URLSearchParams(location.search);
  const biz = params.get('biz');
  if (biz && COMPANY_REGISTRY[biz]) {
    renderDetail(COMPANY_REGISTRY[biz]);
  } else {
    renderList();
  }
}

// ── 목록/검색 화면 ──────────────────────────────
function renderList() {
  const root = document.getElementById('app');
  const companies = Object.values(COMPANY_REGISTRY);
  root.innerHTML = `
    <div class="hdr">
      <h1>사전조사 대시보드 <small>방문 전 업체명으로 조회</small></h1>
    </div>
    <div class="search-box">
      <input id="search-input" type="text" placeholder="업체명으로 검색 (예: 이손)" autocomplete="off">
      <button class="api-search-btn" onclick="searchByApi()">식약처 조회</button>
    </div>
    <div class="company-list" id="company-list"></div>
  `;
  const listEl = document.getElementById('company-list');
  const renderCards = (q) => {
    const filtered = companies.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()));
    if (!filtered.length) {
      listEl.innerHTML = `<div class="empty-state">"${escapeHtml(q)}" 일치하는 업체가 없습니다. data/companies/ 에 신규 업체 데이터를 추가하세요.</div>`;
      return;
    }
    listEl.innerHTML = filtered.map(c => {
      const signal = computeSignal(c);
      return `
        <div class="company-card" onclick="location.search='?biz=${c.id}'">
          <div>
            <h3>${escapeHtml(c.name)}</h3>
            <div class="sub">${escapeHtml(c.industry || '')}</div>
          </div>
          <span class="signal signal-${signal.level}"><span class="signal-dot"></span>${signal.label}</span>
        </div>`;
    }).join('');
  };
  renderCards('');
  document.getElementById('search-input').addEventListener('input', e => renderCards(e.target.value));
}

// ── 상세 화면 ──────────────────────────────
function renderDetail(company) {
  const root = document.getElementById('app');
  const signal = computeSignal(company);
  root.innerHTML = `
    <a class="back-link" onclick="location.search=''">← 업체 목록으로</a>
    ${company.aliasWarning ? `
      <div class="warn-banner">
        <span class="ic">⚠️</span>
        <div><b>${escapeHtml(company.aliasWarning.title)}</b> — ${escapeHtml(company.aliasWarning.text)}</div>
      </div>` : ''}
    <div class="hdr">
      <div class="hdr-top">
        <div>
          <h1>${escapeHtml(company.name)} <small>방문 전 사전조사 · ${escapeHtml(company.industry || '')}</small></h1>
          <div class="hdr-meta">
            ${(company.meta || []).map(m => `
              <span>${escapeHtml(m.label)} <b>${escapeHtml(m.value ?? '미확인')}</b>
                ${m.evidenceKey ? `<button class="src-btn" onclick="showEv('${m.evidenceKey}')">출처</button>` : ''}
              </span>`).join('')}
            <span>사업자등록번호 <b>${company.bizNo ? escapeHtml(company.bizNo) : '미확인'}</b>
              <button id="mfds-lookup-btn" class="src-btn mfds-btn" onclick="triggerMfdsLookup()">식약처 조회</button>
            </span>
          </div>
        </div>
        <div style="text-align:right">
          <div class="signal signal-${signal.level}"><span class="signal-dot"></span> ${signal.label}</div>
          <div style="font-size:10px;color:var(--txt3);margin-top:6px">
            ${escapeHtml(signal.reason)}
            <button class="src-btn" onclick="showSignalReason()">판단근거</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid">
      <div>${CATEGORY_SCHEMA.filter((c, i) => i % 2 === 0).map(c => renderCategoryCard(c, company)).join('')}</div>
      <div>${CATEGORY_SCHEMA.filter((c, i) => i % 2 === 1).map(c => renderCategoryCard(c, company)).join('')}
        ${renderChecklistCard(company)}
      </div>
    </div>

    <div class="foot">
      <b>전체 데이터 출처 요약</b><br>
      각 항목 <button class="src-btn" onclick="return false">출처</button> 버튼 클릭 시
      원문·링크·신뢰도 표시. 모든 수치는 공개 자료 기반이며,
      <b>재무·CAPA·행정처분 등은 방문/공식 포털 확인 후 확정</b>됩니다.
    </div>
  `;
  window.__currentCompany = company;
  window.__currentSignal = signal;
}

function renderCategoryCard(catDef, company) {
  const data = company.categories[catDef.id];
  if (!data) return '';
  const rows = (data.rows || []).map(r => `
    <div class="row"><span class="k">${escapeHtml(r.label)}</span>
      <span class="v" style="${r.value ? (r.danger ? 'color:var(--red)' : '') : 'color:var(--txt3)'}">
        ${r.value ? escapeHtml(r.value) : escapeHtml(r.note || '미확인')}
      </span></div>`).join('');

  const badgeGroups = (data.badgeGroups || []).map(g => `
    <div style="margin-top:12px">
      <div style="font-size:11px;color:var(--txt3);margin-bottom:6px">${escapeHtml(g.label)}
        ${g.evidenceKey ? `<button class="src-btn" onclick="showEv('${g.evidenceKey}')">출처</button>` : ''}
      </div>
      <div class="badges">${g.items.map(i => `<span class="tag ${g.cls}">${escapeHtml(i)}</span>`).join('')}</div>
    </div>`).join('');

  const newsItems = (data.items || []).map(n => `
    <div class="news"><div class="news-dot" style="background:var(--${n.dot})"></div>
      <div><div class="news-title">${escapeHtml(n.title)}</div>
      <div class="news-date">${escapeHtml(n.date)}</div></div></div>`).join('');

  const niceSlot = data.niceSlot ? `
    <div class="nice-slot">
      <div style="font-size:11px;color:var(--org);font-weight:700;margin-bottom:8px">🔗 NICE 조회 필요 (DART 미공시)</div>
      <a href="#" class="nice-btn" onclick="return false">🔗 NICE에서 ${escapeHtml(company.name)} 열기</a>
      <div style="font-size:10px;color:var(--txt3);margin-top:8px">※ 사업자번호로 동명법인 구분 후 입력</div>
    </div>` : '';

  const limit = data.limitNote ? `<div class="limit"><b>⚠ 제한:</b> ${escapeHtml(data.limitNote)}</div>` : '';

  return `
    <div class="card">
      <div class="card-h">
        <div class="ic" style="background:${COLOR_BG[catDef.color] || COLOR_BG.cyan}">${catDef.icon}</div>
        <h2>${escapeHtml(catDef.label)}</h2>
        ${catDef.priority ? `<span class="priority ${PRIORITY_CLS[catDef.priority]}">${catDef.priority}순위</span>` : ''}
        ${data.evidenceKey ? `<button class="src-btn" onclick="showEv('${data.evidenceKey}')">근거</button>` : ''}
      </div>
      ${rows}${badgeGroups}${newsItems}${niceSlot}${limit}
    </div>`;
}

function renderChecklistCard(company) {
  const items = buildVisitChecklist(company);
  return `
    <div class="card">
      <div class="card-h">
        <div class="ic" style="background:${COLOR_BG.orange}">📋</div>
        <h2>방문 시 확인 체크리스트</h2>
      </div>
      <div class="checklist">
        ${items.map((t, i) => `
          <label onclick="this.classList.toggle('checked')">
            <input type="checkbox"><span>${escapeHtml(t)}</span>
          </label>`).join('')}
      </div>
    </div>`;
}

// ── 신호등(종합 신뢰도) 계산 — 카테고리 전반의 정보 충실도를 가중 반영 ──
function computeSignal(company) {
  const total = CATEGORY_SCHEMA.length;
  const withEvidence = CATEGORY_SCHEMA.filter(catDef => {
    const c = company.categories[catDef.id];
    if (!c) return false;
    const hasConfirmedRow = (c.rows || []).some(r => r.confirmed);
    const hasBadges = (c.badgeGroups || []).some(g => g.items && g.items.length);
    const hasNews = (c.items || []).length > 0;
    return hasConfirmedRow || hasBadges || hasNews;
  });
  const coverage = withEvidence.length / total;

  const sanctionCat = company.categories.sanction;
  const violationFound = sanctionCat && (sanctionCat.rows || []).some(r => r.violationFound === true);

  const financeCat = company.categories.finance;
  const financeConfirmed = financeCat && (financeCat.rows || []).some(r => r.financeConfirmed === true);

  if (violationFound) {
    return { level: 'red', label: '🔴 리스크 확인됨', reason: '행정처분/리콜 이력 확인됨 — 상세 확인 필요' };
  }
  if (financeConfirmed && coverage >= 0.7) {
    return { level: 'green', label: '🟢 정보 충분', reason: `${withEvidence.length}/${total} 카테고리 근거 확보 + 재무 확인됨` };
  }
  if (coverage >= 0.4) {
    return { level: 'yellow', label: '🟡 부분 확인', reason: `${withEvidence.length}/${total} 카테고리 근거 확보, 재무 미확정` };
  }
  return { level: 'gray', label: '⚪ 정보 부족', reason: `${withEvidence.length}/${total} 카테고리만 근거 확보` };
}

function buildVisitChecklist(company) {
  const items = [];
  CATEGORY_SCHEMA.forEach(catDef => {
    const c = company.categories[catDef.id];
    if (c && c.rows) {
      c.rows.forEach(r => {
        if (!r.value) items.push(`[${catDef.label}] ${r.label} 확인`);
      });
    }
  });
  return [...items, ...DEFAULT_VISIT_CHECKLIST, ...(company.visitChecklistExtra || [])];
}

// ── 근거자료 모달 ──────────────────────────────
function showEv(key) {
  const company = window.__currentCompany;
  const e = company && company.evidence[key];
  if (!e) return;
  openModal(e.title, e.items);
}

function showSignalReason() {
  const s = window.__currentSignal;
  if (!s) return;
  openModal('신호등 판단근거', [{
    src: '판정 로직', color: '#6b7689', conf: 'low', val: s.label, raw: s.reason, link: '',
  }]);
}

function openModal(title, items) {
  document.getElementById('modal-title').textContent = title;
  const body = document.getElementById('modal-body');
  body.innerHTML = items.map(it => `
    <div class="ev">
      <div class="ev-src">
        <span class="dot" style="background:${it.color}"></span>
        ${escapeHtml(it.src)}
        <span class="ev-conf conf-${it.conf}">${{ high: '신뢰도 높음', mid: '신뢰도 중간', low: '참고/추정' }[it.conf]}</span>
      </div>
      <div class="ev-val">${escapeHtml(it.val)}</div>
      ${it.raw ? `<div class="ev-raw">"${escapeHtml(it.raw)}"</div>` : ''}
      ${it.link ? `<span class="ev-link">🔗 ${escapeHtml(it.link)}</span>` : ''}
    </div>`).join('');
  document.getElementById('modal').classList.add('on');
}
function closeEv() { document.getElementById('modal').classList.remove('on'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEv(); });

// ── 식약처 제조업체 정적 인덱스 검색 ──────────────────────────────
// 이 API는 업체명 서버사이드 필터를 지원하지 않고 32,316건 전체를 반환합니다.
// tools/build-mfds-index.js 로 전체 데이터를 미리 내려받아 data/mfds-index.json 에 저장하고,
// 브라우저는 이 정적 파일을 로드해 클라이언트 사이드 즉시 검색합니다.

let _mfdsIndex = null;   // [{n, b, r, a, d, t}] — 로드 후 캐시
let _mfdsLoading = null; // 중복 fetch 방지

async function loadMfdsIndex() {
  if (_mfdsIndex) return _mfdsIndex;
  if (_mfdsLoading) return _mfdsLoading;
  _mfdsLoading = fetch('data/mfds-index.json')
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => { _mfdsIndex = data; return data; });
  return _mfdsLoading;
}

function normName(s) {
  return (s || '').replace(/[\s\(\)（）주식회사유한회사합자합명]/g, '').toLowerCase();
}

function searchMfdsIndex(index, name) {
  const q = normName(name);
  const exact = [], partial = [], other = [];
  for (const it of index) {
    const n = normName(it.n);
    if (n === q)                      exact.push(it);
    else if (n.includes(q) || q.includes(n)) partial.push(it);
    else                              other.push(it);
  }
  return { exact, partial, other };
}

function mfdsItemToEv(it, conf) {
  return {
    src: '식품의약품안전처 공공데이터 (mfds-index.json)',
    color: conf === 'high' ? '#22b8cf' : conf === 'mid' ? '#eab308' : '#6b7689',
    conf,
    val: `${it.n}${it.r ? ' / 대표: ' + it.r : ''}${it.b ? ' / 사업자번호: ' + it.b : ''}`,
    raw: [it.a && `주소: ${it.a}`, it.d && `허가일: ${it.d}`, it.t && `업종: ${it.t}`]
      .filter(Boolean).join('\n'),
    link: '',
  };
}

function showMfdsResult(name, { exact, partial, other, error, notBuilt }) {
  if (notBuilt) {
    openModal('식약처 인덱스 미생성', [{
      src: '안내', color: '#eab308', conf: 'low',
      val: 'data/mfds-index.json 파일이 없습니다',
      raw: '터미널에서 아래 명령을 실행한 뒤 커밋·푸시해 주세요:\n\n' +
           'node tools/build-mfds-index.js "YOUR_ENCODING_KEY"\n' +
           'git add data/mfds-index.json\n' +
           'git commit -m "식약처 제조업체 인덱스 생성"\n' +
           'git push',
      link: '',
    }]);
    return;
  }
  if (error) {
    openModal('인덱스 로드 오류', [{
      src: 'fetch', color: '#ef4444', conf: 'low',
      val: `오류: ${error}`, raw: '', link: '',
    }]);
    return;
  }
  if (!exact.length && !partial.length) {
    openModal(`식약처 조회 — "${name}" (결과 없음)`, [{
      src: '식품의약품안전처 공공데이터', color: '#eab308', conf: 'mid',
      val: '일치하는 업체 없음',
      raw: '"(주)이손", "이손화장품" 등 다른 형태로 재시도해보세요.',
      link: '',
    }]);
    return;
  }
  const evItems = [];
  exact.forEach(it => evItems.push(mfdsItemToEv(it, 'high')));
  if (partial.length) {
    if (evItems.length) evItems.push({ src: '── 유사 업체 ──', color: '#6b7689', conf: 'low', val: '', raw: '', link: '' });
    partial.slice(0, 8).forEach(it => evItems.push(mfdsItemToEv(it, 'mid')));
  }
  const label = exact.length
    ? `정확 ${exact.length}건${partial.length ? ` + 유사 ${partial.length}건` : ''}`
    : `유사 ${partial.length}건`;
  openModal(`식약처 조회 — "${name}" (${label})`, evItems);
}

async function searchMfds(name) {
  const btn = document.querySelector('.api-search-btn');
  const setBtnText = t => { if (btn) { btn.textContent = t; btn.disabled = t !== '식약처 조회'; } };
  setBtnText('로딩 중…');
  try {
    const index = await loadMfdsIndex();
    setBtnText('식약처 조회');
    const result = searchMfdsIndex(index, name);
    showMfdsResult(name, result);
  } catch (e) {
    setBtnText('식약처 조회');
    const notBuilt = e.message.includes('404') || e.message.includes('403');
    showMfdsResult(name, { exact: [], partial: [], other: [], error: notBuilt ? null : e.message, notBuilt });
  }
}

async function searchByApi() {
  const name = (document.getElementById('search-input')?.value || '').trim();
  if (!name) { alert('검색창에 업체명을 입력한 뒤 누르세요.'); return; }
  await searchMfds(name);
}

async function triggerMfdsLookup() {
  const company = window.__currentCompany;
  if (!company) return;
  await searchMfds(company.name);
}

// setupApiKey는 이제 사용 안 하지만 기존 버튼 onclick과 호환성 유지
function setupApiKey() {
  alert('이제 API 키가 필요 없습니다.\n' +
    'data/mfds-index.json 이 커밋돼 있으면 자동으로 로드됩니다.\n' +
    '없으면: node tools/build-mfds-index.js "YOUR_KEY"');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
