import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

type Category = 'postpaid-mutual-aid' | 'nursing-hospital' | 'home-care';

interface ServiceDetailProps {
  category: Category;
}

const content: Record<Category, {
  title: string;
  description: string;
  emoji: string;
  heroTitle: string;
  heroSub: string;
  heroChecks: string[];
  sections: { badge: string; title: string; sub: string; checks: string[] }[];
}> = {
  'postpaid-mutual-aid': {
    title: '후불제 상조 서비스 안내 | 이음케어라이프',
    description: '선납금 없이 장례 발생 시에만 비용을 지불하는 후불제 상조 서비스. 공정거래위원회 등록 상조업체 이음케어라이프의 투명한 정산 방식을 안내해 드립니다.',
    emoji: '🕊️',
    heroTitle: '후불제 상조서비스',
    heroSub: '장례 후 실제 사용한 비용만 투명하게 정산합니다',
    heroChecks: [
      '선납 없이 장례 발생 시 서비스 제공',
      '실제 이용 항목만 사후 청구',
      '과도한 비용 걱정 없는 합리적 장례',
    ],
    sections: [
      {
        badge: 'POINT 01',
        title: '전문 장례 상담',
        sub: '경험 많은 전문 장례지도사가 처음부터 끝까지 함께합니다',
        checks: [
          '24시간 즉시 출동 상담 가능',
          '장례 절차 전 과정 1:1 밀착 안내',
          '가족의 뜻에 맞는 맞춤형 장례 설계',
        ],
      },
      {
        badge: 'POINT 02',
        title: '투명한 비용 정산',
        sub: '이음케어라이프는 사용한 서비스만 청구하는 후불제를 실천합니다',
        checks: [
          '항목별 세부 견적서 제공',
          '숨겨진 추가 비용 없음',
          '장례 후 실사용 금액만 정산',
        ],
      },
      {
        badge: 'POINT 03',
        title: '선불식 vs 후불식 상조서비스 비교',
        sub: '이음케어라이프 후불제상조로 현명하게 준비하세요',
        checks: [
          '월납입 부담 없는 후불제 방식',
          '계약 후 즉시 서비스 이용 가능',
          '투명한 정산으로 신뢰 보장',
        ],
      },
      {
        badge: 'POINT 04',
        title: '믿을 수 있는 이음케어라이프',
        sub: '가족의 마지막 길, 진심으로 함께하겠습니다',
        checks: [
          '공정거래위원회 등록 상조업체',
          '보전 의무 이행으로 안전한 서비스',
          '전국 네트워크 장례 서비스 제공',
        ],
      },
    ],
  },
  'nursing-hospital': {
    title: '좋은 요양병원 선택 5가지 기준 | 이음케어라이프',
    description: '요양병원 입소를 앞두고 확인해야 할 5가지 핵심 기준 — 전문 의료진, 시설 안전, 평가 등급, 생활 환경, 재활 프로그램까지 이음케어라이프가 안내해 드립니다.',
    emoji: '🏥',
    heroTitle: '좋은 요양병원 선택 5가지 기준',
    heroSub: '입소 전 반드시 확인해야 할 필수 체크리스트',
    heroChecks: [],
    sections: [
      {
        badge: 'CHECK 01',
        title: '전문 의료진 & 인력 충분성',
        sub: '전문의·간호사·재활치료사 비율 반드시 확인하세요',
        checks: [
          '전문의 상주 여부 확인',
          '간호사 1인당 환자 수 체크',
          '재활치료사·요양보호사 보유 현황',
        ],
      },
      {
        badge: 'CHECK 02',
        title: '시설 환경 & 안전 설비',
        sub: '쾌적하고 안전한 환경인지 직접 방문해 확인하세요',
        checks: [
          '채광·환기·청결·냄새 체크',
          '복도·화장실 안전바 설치 여부',
          '응급호출벨·미끄럼 방지 시설',
        ],
      },
      {
        badge: 'CHECK 03',
        title: '의료 서비스 질 & 평가 등급',
        sub: '건강보험심사평가원 적정성 평가 1~2등급 기관 우선',
        checks: [
          '심사평가원 적정성 평가 등급 조회',
          '의료기관 인증 여부 확인',
          '전문 특화 진료 분야 파악',
        ],
      },
      {
        badge: 'CHECK 04',
        title: '쾌적한 병실 & 생활 환경',
        sub: '부모님이 실제 생활할 공간을 직접 눈으로 확인하세요',
        checks: [
          '1~2인실 여부 및 독립 공간 확보',
          '세탁·위생 관리 상태 점검',
          '식단·영양 관리 프로그램 확인',
        ],
      },
      {
        badge: 'CHECK 05',
        title: '재활 프로그램 & 정서 케어',
        sub: '신체·인지·정서 통합 프로그램이 있는 병원을 선택하세요',
        checks: [
          '물리치료·작업치료 제공 여부',
          '인지재활·치매 프로그램 운영',
          '정기 가족 면담·소통 체계',
        ],
      },
    ],
  },
  'home-care': {
    title: '방문요양서비스 신청 절차 | 이음케어라이프',
    description: '장기요양등급 신청부터 방문 조사, 서비스 이용까지 방문요양서비스 신청 절차를 5단계로 안내해 드립니다.',
    emoji: '🏡',
    heroTitle: '방문요양서비스 신청 절차',
    heroSub: '어르신을 위한 방문요양 서비스, 이렇게 신청하세요',
    heroChecks: [],
    sections: [
      {
        badge: 'STEP 01',
        title: '어르신을 위한 방문요양 서비스',
        sub: '이렇게 신청하세요!',
        checks: [],
      },
      {
        badge: 'STEP 02',
        title: '서류 준비부터 함께 도와드립니다',
        sub: '장기요양등급 신청 · 필요 서류 준비',
        checks: [],
      },
      {
        badge: 'STEP 03',
        title: '따뜻한 돌봄으로 일상을 함께합니다',
        sub: '전화 상담 신청 · 방문 조사',
        checks: [],
      },
      {
        badge: 'STEP 04',
        title: '전문 요양사의 방문 서비스',
        sub: '방문 조사 / 심사 진행',
        checks: [],
      },
      {
        badge: 'STEP 05',
        title: '신뢰할 수 있는 케어 서비스',
        sub: '서비스 이용 시작',
        checks: [],
      },
    ],
  },
};

const paths: Record<Category, string> = {
  'postpaid-mutual-aid': '/services/postpaid-mutual-aid',
  'nursing-hospital': '/services/nursing-hospital',
  'home-care': '/services/home-care',
};

const ServiceDetail = ({ category }: ServiceDetailProps) => {
  const data = content[category];
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <Link to="/services" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            ← 서비스 전체 보기
          </Link>
        </div>

        <div className="text-center mb-14">
          <span className="text-5xl">{data.emoji}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 mb-3">{data.heroTitle}</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">{data.heroSub}</p>
          {data.heroChecks.length > 0 && (
            <ul className="mt-6 inline-flex flex-col gap-2 text-left">
              {data.heroChecks.map((c) => (
                <li key={c} className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="text-blue-600">✓</span> {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          {data.sections.map((s) => (
            <div key={s.badge} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                {s.badge}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 whitespace-pre-line">{s.title}</h2>
              <p className="text-slate-600 mb-4">{s.sub}</p>
              {s.checks.length > 0 && (
                <ul className="space-y-2 text-slate-700">
                  {s.checks.map((c) => (
                    <li key={c} className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span> {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 text-center bg-slate-900 rounded-3xl p-10">
          <p className="text-slate-300 mb-2">24시간 무료 상담</p>
          <a href="tel:1588-9012" className="text-3xl font-black text-white hover:text-blue-400 transition-colors">
            1588-9012
          </a>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors">
              상담 신청하기
            </Link>
            <Link to="/quote" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors">
              맞춤 견적 확인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
