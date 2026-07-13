import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Services = () => {
  const title = '요양병원 연결·방문요양서비스 신청 | 이음케어라이프';
  const description = '요양병원 매칭부터 방문요양서비스, 장기요양보험 등급 신청까지. 고양·일산·파주·김포 지역 24시간 무료 상담. 이음케어라이프.';
  const canonical = 'https://ecl.ai.kr/services';
  const ogImage = 'https://ecl.ai.kr/logo.png';

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen py-16">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="요양병원연결,방문요양서비스,장기요양보험,요양원,어르신돌봄,고양요양병원,일산요양병원,파주요양병원,이음케어라이프" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 text-center">서비스 소개</h1>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          이음케어라이프에서 제공하는 믿을 수 있는 3가지 주요 서비스를 안내해 드립니다.
        </p>

        <div className="space-y-12">
          {/* Service 1: 후불제 상조 */}
          <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <img 
                src="/sangjo-service-image.png" 
                alt="후불제 상조 서비스" 
                className="max-w-full h-auto rounded-xl shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Sangjo+Service';
                }}
              />
            </div>
            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🕊️</span>
                <h2 className="text-2xl font-bold text-slate-900">후불제 상조 서비스</h2>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                가입비, 월 납입금 없이 장례 발생 시에만 비용을 지불하는 투명한 후불제 상조 서비스입니다. 
                가족을 잃은 슬픔에만 집중하실 수 있도록 거품을 뺀 합리적인 가격과 정성스러운 의전 서비스를 제공합니다.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-center gap-2">✓ 가입비/월 납입금 0원</li>
                <li className="flex items-center gap-2">✓ 전국 24시간 장례 출동</li>
                <li className="flex items-center gap-2">✓ 전문 장례지도사 1:1 전담</li>
              </ul>
              <Link to="/services/postpaid-mutual-aid" className="inline-flex items-center gap-1 mt-6 text-blue-600 font-bold hover:gap-2 transition-all">
                자세히 보기 →
              </Link>
            </div>
          </div>

          {/* Service 2: 요양병원 연계 */}
          <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-full aspect-video bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <span className="text-5xl">🏥</span>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏥</span>
                <h2 className="text-2xl font-bold text-slate-900">요양병원 연계 컨설팅</h2>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                어르신의 질환 상태, 거주지, 경제적 여건 등을 종합적으로 고려하여 
                가장 적합한 요양병원을 추천해 드립니다. 직접 방문하여 확인한 신뢰할 수 있는 병원들만 연계합니다.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-center gap-2">✓ 어르신 맞춤형 병원 매칭</li>
                <li className="flex items-center gap-2">✓ 비용 및 시설 비교 분석 상담</li>
                <li className="flex items-center gap-2">✓ 입원 수속 및 이동 안내 지원</li>
              </ul>
              <Link to="/services/nursing-hospital" className="inline-flex items-center gap-1 mt-6 text-blue-600 font-bold hover:gap-2 transition-all">
                자세히 보기 →
              </Link>
            </div>
          </div>

          {/* Service 3: 방문요양 */}
          <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-full aspect-video bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                <span className="text-5xl">🏡</span>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏡</span>
                <h2 className="text-2xl font-bold text-slate-900">방문요양서비스 (장기요양)</h2>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                국가 지원 장기요양보험을 활용하여, 전문 요양보호사가 어르신 댁으로 직접 방문해 
                신체 활동 및 가사 활동을 지원합니다. 어르신이 익숙한 환경에서 편안하게 노후를 보내실 수 있도록 돕습니다.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-center gap-2">✓ 장기요양등급 인정 신청 대행</li>
                <li className="flex items-center gap-2">✓ 검증된 전문 요양보호사 파견</li>
                <li className="flex items-center gap-2">✓ 신체 활동 지원, 정서 지원, 가사 지원</li>
              </ul>
              <Link to="/services/home-care" className="inline-flex items-center gap-1 mt-6 text-blue-600 font-bold hover:gap-2 transition-all">
                자세히 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
