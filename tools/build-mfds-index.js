#!/usr/bin/env node
/**
 * 식약처 화장품 제조업체 전체 목록을 내려받아 data/mfds-index.json 생성
 *
 * 사용법:
 *   node tools/build-mfds-index.js "YOUR_ENCODING_SERVICE_KEY"
 *
 * - data.go.kr에서 발급받은 "일반 인증키(Encoding)" 를 그대로 붙여넣기
 * - 약 4회 API 호출 (10,000건 × 4페이지), 30~60초 소요
 * - 결과: data/mfds-index.json (약 3MB, gzip 시 ~700KB)
 * - 커밋 후 GitHub Pages에서 정적으로 서빙 → 런타임에 API 키 불필요
 */

const https = require('https');
const fs   = require('fs');
const path = require('path');

const KEY = process.argv[2];
if (!KEY) {
  console.error('사용법: node tools/build-mfds-index.js "Encoding_serviceKey"');
  process.exit(1);
}

const BASE = 'https://apis.data.go.kr/1471000/CsmtcsMfcrtrInfoService01/getCsmtcsMfcrtrInfoList01';
const ROWS = 10000;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(new Error('JSON 파싱 실패: ' + e.message)); }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('타임아웃')));
  });
}

async function fetchPage(page) {
  const url = `${BASE}?serviceKey=${KEY}&numOfRows=${ROWS}&pageNo=${page}&type=json`;
  const json = await get(url);
  const body = json?.body || json?.response?.body;
  if (!body) throw new Error('응답 구조 오류: ' + JSON.stringify(json).slice(0, 200));
  return body;
}

async function main() {
  console.log('▶ 1페이지 조회 중...');
  const first = await fetchPage(1);
  const total = first.totalCount;
  const pages = Math.ceil(total / ROWS);
  console.log(`  총 ${total.toLocaleString()}건 / ${pages}페이지`);

  const items = Array.isArray(first.items) ? [...first.items] : [first.items];

  for (let p = 2; p <= pages; p++) {
    console.log(`▶ ${p}/${pages} 페이지 조회 중...`);
    const body = await fetchPage(p);
    const pageItems = Array.isArray(body.items) ? body.items : [body.items];
    items.push(...pageItems);
  }

  console.log(`  수집 완료: ${items.length.toLocaleString()}건`);

  // 압축 포맷: 각 필드를 단일 문자 키로 축약
  const list = items
    .filter(it => it && it.ENTP_NAME)
    .map(it => ({
      n: it.ENTP_NAME        || '',   // 업체명
      b: it.BIZRNO           || '',   // 사업자번호
      r: it.BOSS_NAME        || '',   // 대표자
      a: it.FACTORY_ADDR     || '',   // 주소
      d: it.ENTP_PERMIT_DATE || '',   // 허가일
      t: it.INDUTY           || '',   // 업종구분
    }));

  const outPath = path.join(__dirname, '..', 'data', 'mfds-index.json');
  fs.writeFileSync(outPath, JSON.stringify(list));
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`✅ data/mfds-index.json 저장 완료 (${list.length.toLocaleString()}건 / ${kb}KB)`);
  console.log('   다음 단계: git add data/mfds-index.json && git commit && git push');
}

main().catch(e => { console.error('❌ 오류:', e.message); process.exit(1); });
