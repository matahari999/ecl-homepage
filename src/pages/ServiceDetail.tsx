import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

type Category = 'postpaid-mutual-aid' | 'nursing-hospital' | 'home-care';

interface ServiceDetailProps {
  category: Category;
}

const CheckItem = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="flex items-start gap-3">
    <span className="text-blue-600 mt-0.5">✓</span>
    <div>
      <p className="font-semibold text-slate-900">{title}</p>
      {sub && <p className="text-sm text-slate-500">{sub}</p>}
    </div>
  </div>
);

const StepGrid = ({ steps }: { steps: { title: string; sub?: string }[] }) => (
  <div className={`grid gap-6 ${steps.length > 5 ? 'md:grid-cols-3 lg:grid-cols-6' : steps.length === 5 ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
    {steps.map((step, i) => (
      <div key={step.title} className="text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-xl font-bold text-blue-600">{i + 1}</span>
        </div>
        <h4 className="font-semibold text-slate-900 text-sm mb-1">{step.title}</h4>
        {step.sub && <p className="text-xs text-slate-500">{step.sub}</p>}
      </div>
    ))}
  </div>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 ${className}`}>{children}</div>
);

const paths: Record<Category, string> = {
  'postpaid-mutual-aid': '/services/postpaid-mutual-aid',
  'nursing-hospital': '/services/nursing-hospital',
  'home-care': '/services/home-care',
};

const meta: Record<Category, { title: string; description: string; emoji: string; heroTitle: string; heroSub: string; serviceArea: string; features: string[]; process: string[] }> = {
  'postpaid-mutual-aid': {
    title: '후불제 상조 서비스 요금표·절차 안내 | 이음케어라이프',
    description: '선불금 없는 이음케어후불제상조. 플랫폼 300/360 요금표, 선불제 vs 후불제 비교, 24시간 접수부터 사후 정리까지 전 과정을 안내합니다.',
    emoji: '🕊️',
    heroTitle: '이음케어 후불제상조',
    heroSub: '갑작스러운 이별을 위한 후불제 상조서비스로 경제적 부담 없이 정성스럽게 모시겠습니다.',
    serviceArea: '전국 서비스',
    features: ['후불제 상조 서비스', '24시간 콜센터 운영', '전국 장례식장 연계', '장례용품 완비', '전문 장례지도사'],
    process: ['24시간 접수 및 상담', '장례식장 예약 및 준비', '장례 절차 진행', '행정 업무 대행', '사후 정리 지원'],
  },
  'nursing-hospital': {
    title: '요양병원 연계 상담·입소 절차 안내 | 이음케어라이프',
    description: '고양·파주·김포·의정부 지역 요양병원 매칭부터 입원 절차, 장기요양보험 본인부담률까지 전문 상담으로 안내해 드립니다.',
    emoji: '🏥',
    heroTitle: '요양병원 상담',
    heroSub: '환자 상태에 맞는 최적의 요양병원 선택과 입원 절차를 전문적으로 안내드립니다.',
    serviceArea: '고양, 파주, 김포, 의정부 지역',
    features: ['지역 내 요양병원 정보 제공', '입원 절차 대행 서비스', '요양병원 전문 상담', '보험 처리 지원', '24시간 상담 가능'],
    process: ['상담 신청 및 상황 파악', '적합한 요양병원 추천', '현장 방문 및 상담', '입원 절차 진행', '사후 관리 서비스'],
  },
  'home-care': {
    title: '방문요양서비스 신청 절차·등급별 시간 안내 | 이음케어라이프',
    description: '장기요양등급 신청부터 방문 조사, 케어플랜 수립까지 6단계 방문요양서비스 신청 절차와 등급별 서비스 시간을 안내합니다.',
    emoji: '🏡',
    heroTitle: '방문요양서비스',
    heroSub: '집에서 편안하게 받는 전문 방문요양 서비스로 어르신의 일상생활을 전문적으로 지원합니다.',
    serviceArea: '서울전역, 고양, 파주, 김포 지역',
    features: ['맞춤형 케어플랜 수립', '전문 요양보호사 파견', '신체활동 지원 서비스', '가사 및 일상지원 서비스', '정서적 지원 및 안전관리'],
    process: ['상담 신청 및 상황 파악', '케어플랜 수립 및 상담', '전문 요양보호사 매칭', '방문요양 서비스 시작', '정기 모니터링 및 관리'],
  },
};

const postpaidVsPrepaid = {
  problems: [
    { title: '1. 상조회사의 부도 위험', desc: '상조회사가 부도나 폐업할 경우, 이미 납부한 금액을 돌려받지 못하거나 일부만 환급받는 사례가 발생할 수 있습니다.' },
    { title: '2. 서비스 품질 저하', desc: '계약 당시 약속한 서비스와 실제 제공되는 서비스가 다를 수 있습니다. 장례 시점에 업체가 약속한 품목이나 품질을 제대로 제공하지 않는 경우가 많습니다.' },
    { title: '3. 환급 및 해지의 어려움', desc: '중도 해지 시 환급금이 적거나, 해지 절차가 복잡해 소비자가 불이익을 겪는 경우가 많습니다.' },
    { title: '4. 물가 상승 및 서비스 변화 미반영', desc: '장기간에 걸쳐 납부하는 상품 특성상, 실제 장례 시점에 물가 상승이나 서비스 변화가 반영되지 않아 실질적인 혜택이 줄어들 수 있습니다.' },
    { title: '5. 강매 및 과장 광고', desc: '일부 상조회사는 공격적인 마케팅, 과장 광고, 강매 등으로 소비자를 유인하는 사례가 있습니다.' },
    { title: '6. 오래 전 상품에 추가요금 부과', desc: '"10년이 지나도 처음 가격 그대로 장례를 치러준다"고 광고하지만, 실제로는 시간이 지난 뒤 장례가 발생하면 추가요금을 요구하는 사례가 많습니다.' },
  ],
  advantages: [
    { title: '초기 비용 부담 없음', desc: '미리 돈을 낼 필요가 없어 경제적 부담이 없습니다. 장례가 발생한 후 실제로 서비스를 이용한 만큼만 비용을 지불합니다.' },
    { title: '환불·계약 분쟁 위험 없음', desc: '선불금이 없으므로 환불 문제나 해지 시 손해를 볼 위험이 없습니다.' },
    { title: '서비스 선택의 자유', desc: '유족이 필요한 서비스만 선택할 수 있어 불필요한 지출을 줄일 수 있습니다. 미사용 품목은 모두 공제되어 실제 사용한 만큼만 비용을 냅니다.' },
    { title: '투명한 비용 구조', desc: '각 서비스의 비용이 명확하게 공개되어 예산 관리가 쉽습니다.' },
    { title: '저렴한 가격', desc: '선불제 상조에 비해 평균적으로 저렴한 가격(100~360만 원대)으로 이용할 수 있습니다.' },
    { title: '부도·폐업 위험 없음', desc: '장례 후에 비용을 지불하므로 상조회사가 부도나 폐업해도 납입금 피해가 발생하지 않습니다.' },
  ],
};

const pricingTable: { category: string; item: string; p300: string; p360: string }[] = [
  { category: '인력지원', item: '장례지도사: 1명/3일간 장례일정 진행', p300: '', p360: '동일' },
  { category: '인력지원', item: '장례예식사: 2명/염습 및 입관', p300: '', p360: '동일' },
  { category: '인력지원', item: '장례도우미: 4명/1일/10시간', p300: '', p360: '6명/1일/10시간' },
  { category: '고인용품', item: '관: 화장용 오동나무1단 1.0', p300: '', p360: '동일' },
  { category: '고인용품', item: '수의: 화장용 저마 수의 저마 100%', p300: '', p360: '특상 명품수의 대마 100%, 국내산' },
  { category: '고인용품', item: '입관용품: 고깔, 관보, 소창, 보공, 알코올 등 일체', p300: '', p360: '동일' },
  { category: '고인용품', item: '유골함: 고급 유골함 제공(종교별)', p300: '', p360: '동일' },
  { category: '의전용품', item: '남상복: 4세트 대여(현대식)', p300: '', p360: '6세트' },
  { category: '의전용품', item: 'Y셔츠, 넥타이: 4세트 대여(현대식)', p300: '', p360: '6세트' },
  { category: '의전용품', item: '여상복: 계량한복 직계 필요량', p300: '', p360: '동일' },
  { category: '차량지원', item: '고인리무진: 200km(초과 시 2,400원/km)', p300: '', p360: '300km(초과 시 2,400원/km)' },
  { category: '차량지원', item: '운구이송 및 장식: 실비제공 및 근조리본장식', p300: '', p360: '동일' },
  { category: '기타', item: '제단장식: 헌화 30송이', p300: '', p360: '동일' },
  { category: '기타', item: '부고알림: 제공', p300: '', p360: '동일' },
];

const nursingHospitalAdmission = [
  { name: '만성질환자', desc: '당뇨, 고혈압 등 지속적인 관리가 필요한 분', color: 'bg-blue-50 text-blue-800' },
  { name: '재활치료 필요자', desc: '뇌졸중, 치매 등 재활치료가 필요한 분', color: 'bg-green-50 text-green-800' },
  { name: '수술 후 회복', desc: '수술 후 지속적인 관찰과 관리가 필요한 분', color: 'bg-purple-50 text-purple-800' },
];

const hospitalTypes = [
  { name: '일반 요양병원', items: ['일상생활 지원', '건강 관리', '여가 프로그램', '사회활동 지원'] },
  { name: '치매 전문', items: ['치매 전문 프로그램', '인지 치료', '안전 관리', '가족 상담'] },
  { name: '고급 요양병원', items: ['프리미엄 시설', '개별 맞춤 케어', '문화 프로그램', '의료진 상주'] },
];

const regionalNetwork = [
  { name: '서울·경기', desc: '서울 전 지역 및 경기도 주요 지역 요양병원' },
  { name: '충청·강원', desc: '대전, 청주, 춘천 등 주요 도시 요양병원' },
  { name: '영남·호남', desc: '주요 광역시 및 도시 지역 요양병원' },
];

const hospitalAdmissionSteps = [
  { title: '상담 신청', sub: '전화 상담 및 상황 파악' },
  { title: '등급 판정', sub: '장기요양 등급 신청' },
  { title: '시설 선택', sub: '적합한 요양병원 추천' },
  { title: '계약 체결', sub: '입소 계약 및 서류' },
  { title: '입소 완료', sub: '입원 수속 및 사후 관리' },
];

const careGradeHours = [
  { grade: '1등급 (가장 중증)', hours: '월 209시간', desc: '전면적인 도움 필요, 거의 모든 일상활동에 지원', color: 'border-red-500 bg-red-50 text-red-800' },
  { grade: '2등급', hours: '월 149시간', desc: '상당한 도움 필요, 대부분의 일상활동에 지원', color: 'border-orange-500 bg-orange-50 text-orange-800' },
  { grade: '3등급', hours: '월 89시간', desc: '부분적 도움 필요, 일부 일상활동에 지원', color: 'border-yellow-500 bg-yellow-50 text-yellow-800' },
  { grade: '4등급', hours: '월 69시간', desc: '최소한의 도움 필요, 기본적인 일상활동 지원', color: 'border-green-500 bg-green-50 text-green-800' },
  { grade: '5등급', hours: '월 51시간', desc: '경증, 간헐적 도움 필요', color: 'border-blue-500 bg-blue-50 text-blue-800' },
  { grade: '인지지원등급', hours: '월 51시간', desc: '치매 초기, 인지기능 저하자', color: 'border-purple-500 bg-purple-50 text-purple-800' },
];

const homeCareApplicationSteps = [
  { title: '상담 신청', sub: '전화 상담' },
  { title: '등급 신청', sub: '국민건강보험공단' },
  { title: '방문 조사', sub: '등급 판정 조사' },
  { title: '등급 판정', sub: '1~5등급 결정' },
  { title: '계획 수립', sub: '케어 플랜 작성' },
  { title: '서비스 시작', sub: '' },
];

const homeCareTargets = [
  { title: '장기요양 1~5등급 어르신', desc: '장기요양보험 등급 판정을 받은 어르신께서 이용 가능합니다.' },
  { title: '일상생활 도움이 필요한 어르신', desc: '세면, 목욕, 식사, 옷 갈아입기 등 일상생활에서 도움이 필요한 경우' },
  { title: '가사지원이 필요한 어르신', desc: '청소, 세탁, 식사준비 등 가사활동에서 도움이 필요한 경우' },
];

const homeCareServices = [
  { title: '신체활동 지원', desc: '세면, 구강관리, 머리감기기, 목욕, 식사도움, 옷 갈아입히기, 체위변경 등' },
  { title: '가사활동 지원', desc: '청소, 세탁, 식사준비, 생필품 구매, 약물복용 도움 등' },
  { title: '정서적 지원', desc: '말벗, 산책, 외출 동행, 인지활동 지원' },
];

const serviceRegions = [
  { name: '서울 전역', desc: '25개 자치구 전체' },
  { name: '고양시', desc: '덕양구, 일산동구, 일산서구' },
  { name: '파주시', desc: '운정신도시, 금촌 등' },
  { name: '김포시', desc: '김포신도시, 장기동 등' },
];

const CONSULT_PHONE = '010-2069-8223';
const MAIN_PHONE = '1588-9012';

const ServiceDetail = ({ category }: ServiceDetailProps) => {
  const data = meta[category];
  const canonical = `https://ecl.ai.kr${paths[category]}`;

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen py-16">
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.description} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <nav className="flex mb-8 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">홈</Link>
          <span className="mx-2">/</span>
          <Link to="/services" className="hover:text-slate-700">서비스</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{data.heroTitle}</span>
        </nav>

        <div className="text-center mb-14">
          <span className="text-5xl">{data.emoji}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 mb-3">{data.heroTitle}</h1>
          <p className="text-slate-600 max-w-2xl mx-auto mb-4">{data.heroSub}</p>
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full">
            📍 서비스 지역: {data.serviceArea}
          </span>
        </div>

        {/* Features + Process */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">✓ 서비스 특징</h2>
            <ul className="space-y-3">
              {data.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-slate-700">
                  <span className="text-blue-600">✓</span> {f}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">진행 과정</h2>
            <ol className="space-y-3">
              {data.process.map((p, i) => (
                <li key={p} className="flex items-start gap-3 text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* ── POSTPAID-MUTUAL-AID ── */}
        {category === 'postpaid-mutual-aid' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">선불제 vs 후불제 상조 비교</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <Card className="border-2 border-red-200">
                <h3 className="text-xl font-bold text-red-700 text-center mb-6">⚠️ 선불제 상조의 문제점</h3>
                <div className="space-y-4">
                  {postpaidVsPrepaid.problems.map((p) => (
                    <div key={p.title}>
                      <p className="font-semibold text-slate-900">{p.title}</p>
                      <p className="text-sm text-slate-600">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <h3 className="text-xl font-bold text-green-800 text-center mb-6">✓ 후불제 상조의 장점</h3>
                <div className="space-y-4">
                  {postpaidVsPrepaid.advantages.map((a) => (
                    <CheckItem key={a.title} title={a.title} sub={a.desc} />
                  ))}
                </div>
                <div className="mt-6 p-3 bg-green-100 rounded-lg text-center text-sm font-medium text-green-800">
                  💡 신사방TV 회원 특별 혜택 적용
                </div>
              </Card>
            </div>

            <Card className="mb-10">
              <h2 className="text-2xl font-bold text-center text-slate-900 mb-1">이음케어 후불제상조 서비스 요금표</h2>
              <p className="text-center text-slate-500 mb-6">투명하고 합리적인 요금 체계 — 플랫폼 300 / 플랫폼 360</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-blue-700 p-3 text-left font-bold">구분</th>
                      <th className="border border-blue-700 p-3 text-left font-bold">항목</th>
                      <th className="border border-blue-700 p-3 text-center font-bold">플랫폼 300</th>
                      <th className="border border-blue-700 p-3 text-center font-bold">플랫폼 360</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTable.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                        <td className="border border-slate-200 p-2 font-semibold text-slate-700 whitespace-nowrap">{row.category}</td>
                        <td className="border border-slate-200 p-2 text-slate-700">{row.item}</td>
                        <td className="border border-slate-200 p-2 text-center text-slate-500">기본</td>
                        <td className="border border-slate-200 p-2 text-center text-slate-700">{row.p360}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="mb-10 text-center">
              <p className="text-lg font-bold text-blue-800 mb-6">
                이음케어라이프는 전국 어디에서나 가족까지 찾아가는 상조복지 플랫폼이 되겠습니다.
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-md mx-auto">
                <div className="bg-slate-50 p-6 rounded-lg">
                  <p className="text-sm font-semibold text-slate-600 mb-1">장례 전문 지도사</p>
                  <p className="text-3xl font-bold text-blue-600 mb-2">2,560명</p>
                  <p className="text-xs text-slate-500">오랜 기간 숙련된 장례기획 및 지식을 습득한 장례의식 책임자</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <p className="text-sm font-semibold text-slate-600 mb-1">전국 지사망</p>
                  <p className="text-3xl font-bold text-blue-600 mb-2">16곳</p>
                  <p className="text-xs text-slate-500">전국 각 지역을 대표하는 경력 25년 이상 지사장</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ── NURSING-HOSPITAL ── */}
        {category === 'nursing-hospital' && (
          <>
            <Card className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 text-center mb-6">전문적인 의료진과 시설을 갖춘 요양병원</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">요양병원 특징</h3>
                  <ul className="space-y-3">
                    {['24시간 의료진 상주', '전문 재활치료 프로그램', '건강보험 적용', '지역별 맞춤 병원 추천'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-slate-700"><span className="text-green-600">✓</span> {f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">입원 대상</h3>
                  <div className="space-y-3">
                    {nursingHospitalAdmission.map((a) => (
                      <div key={a.name} className={`p-3 rounded-lg ${a.color}`}>
                        <p className="font-semibold">{a.name}</p>
                        <p className="text-sm opacity-80">{a.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 text-center mb-6">요양병원 유형별 안내</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {hospitalTypes.map((t) => (
                  <div key={t.name} className="p-6 bg-slate-50 rounded-lg border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-3">{t.name}</h3>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {t.items.map((i) => <li key={i}>• {i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 text-center mb-6">요양병원 입소 절차</h2>
              <StepGrid steps={hospitalAdmissionSteps} />
            </Card>

            <Card className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 text-center mb-6">지역별 요양병원 네트워크</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {regionalNetwork.map((r) => (
                  <div key={r.name} className="text-center p-6 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">{r.name}</h3>
                    <p className="text-sm text-slate-600">{r.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 text-center mb-6">장기요양보험 적용</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-4">본인부담률</h3>
                  <div className="space-y-2 text-sm">
                    {['1등급', '2등급', '3등급', '4~5등급'].map((g) => (
                      <div key={g} className="flex justify-between">
                        <span className="text-slate-700">{g}</span>
                        <span className="font-semibold text-slate-900">20%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-4">추가 비용</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-700">식비</span><span className="font-semibold text-slate-900">월 43만원</span></div>
                    <div className="flex justify-between"><span className="text-slate-700">상급침실료</span><span className="font-semibold text-slate-900">시설별 상이</span></div>
                    <div className="flex justify-between"><span className="text-slate-700">기타 비용</span><span className="font-semibold text-slate-900">개별 상담</span></div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ── HOME-CARE ── */}
        {category === 'home-care' && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <Card className="border-2 border-purple-200">
                <h2 className="text-lg font-bold text-purple-700 text-center mb-6">방문요양서비스 대상자</h2>
                <div className="space-y-4">
                  {homeCareTargets.map((t) => (
                    <CheckItem key={t.title} title={t.title} sub={t.desc} />
                  ))}
                </div>
              </Card>
              <Card className="border-2 border-green-200">
                <h2 className="text-lg font-bold text-green-700 text-center mb-6">제공 서비스 내용</h2>
                <div className="space-y-4">
                  {homeCareServices.map((s) => (
                    <CheckItem key={s.title} title={s.title} sub={s.desc} />
                  ))}
                </div>
              </Card>
            </div>

            <Card className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 text-center mb-6">서비스 제공 지역</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {serviceRegions.map((r) => (
                  <div key={r.name} className="text-center p-6 bg-purple-50 rounded-lg border border-purple-100">
                    <h3 className="font-semibold text-slate-900 mb-2">{r.name}</h3>
                    <p className="text-sm text-slate-600">{r.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 text-center mb-6">장기요양등급별 서비스 시간</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {careGradeHours.map((g) => (
                  <div key={g.grade} className={`p-4 rounded-lg border-l-4 ${g.color}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{g.grade}</span>
                      <span className="text-lg font-bold">{g.hours}</span>
                    </div>
                    <p className="text-sm mt-1 opacity-80">{g.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 text-center mb-6">방문요양 신청 절차</h2>
              <StepGrid steps={homeCareApplicationSteps} />
            </Card>
          </>
        )}

        {/* CTA */}
        <div className="mt-4 text-center bg-slate-900 rounded-3xl p-10">
          <p className="text-slate-300 mb-2">전문 상담 직통</p>
          <a href={`tel:${CONSULT_PHONE}`} className="text-3xl font-black text-white hover:text-blue-400 transition-colors">
            {CONSULT_PHONE}
          </a>
          <p className="text-slate-400 text-sm mt-2">24시간 대표 상담 {MAIN_PHONE}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors">
              상담 신청하기
            </Link>
            <a href="http://pf.kakao.com/_PxmQG/chat" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#FEE500] hover:bg-[#f5da00] text-[#3C1E1E] rounded-xl font-bold text-sm transition-colors">
              💬 카카오톡 상담하기
            </a>
            {category === 'postpaid-mutual-aid' && (
              <Link to="/quote" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors">
                맞춤 견적 확인하기
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/services" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            ← 서비스 전체 보기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
