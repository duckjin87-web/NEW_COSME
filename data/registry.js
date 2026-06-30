// 업체 데이터 레지스트리 — 데이터(회사별 .js)와 템플릿(assets/dashboard.js)을 분리하기 위한 등록 창구
const COMPANY_REGISTRY = {};

function registerCompany(company) {
  if (!company || !company.id) {
    console.error('registerCompany: id 누락', company);
    return;
  }
  COMPANY_REGISTRY[company.id] = company;
}
