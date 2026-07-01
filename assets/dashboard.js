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
      <button class="api-search-btn" onclick="searchByApi()">식약처 API 조회</button>
      <button class="key-btn" onclick="setupApiKey()">${getMfdsKey() ? '🔑 키설정됨' : '🔑 키미설정'}</button>
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
              <button id="mfds-lookup-btn" class="src-btn mfds-btn" onclick="triggerMfdsLookup()">식약처 API 조회</button>
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

// ── 식약처 화장품 제조업체 정보 API (data.go.kr) ──────────────────────────────
const MFDS_API = 'https://apis.data.go.kr/1471000/CsmtcsMfcrtrInfoService01/getCsmtcsMfcrtrInfoList01';

function getMfdsKey() { return localStorage.getItem('mfds_key') || ''; }
function setMfdsKey(k) { k ? localStorage.setItem('mfds_key', k) : localStorage.removeItem('mfds_key'); }

function setupApiKey() {
  const cur = getMfdsKey();
  const k = prompt(
    'data.go.kr에서 발급받은 "일반 인증키(Encoding)" 를 붙여넣으세요.\n' +
    '(Decoding 키가 아닌 %xx 형태의 Encoding 키여야 합니다)',
    cur || ''
  );
  if (k === null) return;
  setMfdsKey(k.trim());
  renderList();
}

async function lookupMfds(name) {
  const key = getMfdsKey();
  if (!key) return { error: 'no_key' };
  try {
    const url = `${MFDS_API}?serviceKey=${key}&numOfRows=100&pageNo=1&type=json&entpName=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const json = await res.json();
    const body = json?.body || json?.response?.body;
    if (!body) return { error: 'parse_fail', raw: JSON.stringify(json).slice(0, 400) };
    const items = body.items;
    if (!items) return { items: [], total: 0 };
    return { items: Array.isArray(items) ? items : [items], total: body.totalCount };
  } catch (e) {
    return { error: e.message };
  }
}

function rankMfdsItems(items, name) {
  const q = name.replace(/[()（）\s주식회사(유)]/g, '').toLowerCase();
  const exact = [], partial = [], similar = [];
  for (const it of items) {
    const n = (it.ENTP_NAME || '').replace(/[()（）\s주식회사(유)]/g, '').toLowerCase();
    if (n === q) exact.push(it);
    else if (n.includes(q) || q.includes(n)) partial.push(it);
    else similar.push(it);
  }
  return { exact, partial, similar };
}

function mfdsItemToEv(it, conf) {
  const nameVal = it.ENTP_NAME || '';
  const bizVal  = it.BIZRNO   || '';
  const bossVal = it.BOSS_NAME || '';
  const addrVal = it.FACTORY_ADDR || '';
  const dateVal = it.ENTP_PERMIT_DATE || '';
  return {
    src: '식품의약품안전처 공공데이터',
    color: conf === 'high' ? '#22b8cf' : conf === 'mid' ? '#eab308' : '#6b7689',
    conf,
    val: `${nameVal}${bossVal ? ' / 대표: ' + bossVal : ''}${bizVal ? ' / 사업자번호: ' + bizVal : ''}`,
    raw: [addrVal && `주소: ${addrVal}`, dateVal && `허가일: ${dateVal}`].filter(Boolean).join('\n'),
    link: '',
  };
}

function showMfdsResult(name, result) {
  if (result.error === 'no_key') { alert('API 키를 먼저 설정해주세요.'); return; }
  if (result.error) {
    openModal('API 조회 오류', [{
      src: '식약처 API', color: '#ef4444', conf: 'low',
      val: `오류: ${result.error}`,
      raw: result.error.toLowerCase().includes('fetch') || result.error.toLowerCase().includes('cors')
        ? 'CORS 차단으로 보입니다. 브라우저에서 직접 API 호출이 불가능합니다. ' +
          'python3 스크립트로 서버사이드 호출하거나 CORS 프록시가 필요합니다.'
        : result.raw || '',
      link: '',
    }]);
    return;
  }
  if (!result.items || !result.items.length) {
    openModal(`식약처 API — "${name}" (결과 없음)`, [{
      src: '식품의약품안전처 화장품 제조업체 정보', color: '#eab308', conf: 'mid',
      val: '검색 결과 없음',
      raw: '법인명 형태가 다를 수 있습니다. "(주)이손", "이손화학" 등 다른 형태로 재시도해보세요.',
      link: '',
    }]);
    return;
  }

  const { exact, partial, similar } = rankMfdsItems(result.items, name);
  const evItems = [];

  if (exact.length) {
    exact.forEach(it => evItems.push(mfdsItemToEv(it, 'high')));
  }
  if (partial.length) {
    if (evItems.length) evItems.push({ src: '── 유사 업체 ──', color: '#6b7689', conf: 'low', val: '', raw: '', link: '' });
    partial.slice(0, 5).forEach(it => evItems.push(mfdsItemToEv(it, 'mid')));
  }
  if (!exact.length && !partial.length && similar.length) {
    evItems.push({ src: `── 정확한 일치 없음 — 전체 결과 중 상위 ${Math.min(similar.length, 5)}건 ──`,
      color: '#eab308', conf: 'low', val: '', raw: '', link: '' });
    similar.slice(0, 5).forEach(it => evItems.push(mfdsItemToEv(it, 'low')));
  }

  const matchLabel = exact.length ? `정확 ${exact.length}건` :
    partial.length ? `유사 ${partial.length}건` : `전체 ${result.total}건 중 상위`;
  openModal(`식약처 API — "${name}" (${matchLabel})`, evItems);
}

async function searchByApi() {
  const name = (document.getElementById('search-input')?.value || '').trim();
  if (!name) { alert('검색창에 업체명을 입력한 뒤 누르세요.'); return; }
  if (!getMfdsKey()) {
    setupApiKey();
    if (!getMfdsKey()) return;
  }
  const btn = document.querySelector('.api-search-btn');
  if (btn) { btn.textContent = '조회 중…'; btn.disabled = true; }
  const result = await lookupMfds(name);
  if (btn) { btn.textContent = '식약처 API 조회'; btn.disabled = false; }
  showMfdsResult(name, result);
}

async function triggerMfdsLookup() {
  const company = window.__currentCompany;
  if (!company) return;

  if (!getMfdsKey()) {
    setupApiKey();
    if (!getMfdsKey()) return;
  }

  const btn = document.getElementById('mfds-lookup-btn');
  if (btn) { btn.textContent = '조회 중…'; btn.disabled = true; }

  const result = await lookupMfds(company.name);

  if (btn) { btn.textContent = '식약처 API 재조회'; btn.disabled = false; }

  showMfdsResult(company.name, result);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
