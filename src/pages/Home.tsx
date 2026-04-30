import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col w-full">

      {/* ── Hero Section ── */}
      <section className="relative w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 lg:py-36 overflow-hidden flex items-center justify-center">
        {/* 배경 배지 – z-0, 낮은 opacity */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
          <img
            src="/membership_certificate_icon.png"
            alt=""
            aria-hidden="true"
            className="w-64 md:w-[480px] max-w-full object-contain opacity-10 select-none"
          />
        </div>

        {/* 콘텐츠 – z-20으로 배지 위 */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase border border-blue-500/30">
            제대군인이음케어라이프
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            어르신의 삶과<br className="hidden sm:block" />
            <span className="text-blue-400"> 가족의 마음을 잇다</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
            후불제 상조 · 요양병원 연결 · 방문요양서비스<br className="hidden sm:block" />
            전문 상담사가 24시간 무료로 안내해 드립니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mt-2">
            <a
              href="tel:1588-9012"
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 w-full sm:w-auto"
            >
              📞 1588-9012 무료 상담
            </a>
            <Link
              to="/services"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-lg px-8 py-4 rounded-xl border border-white/20 transition-all w-full sm:w-auto"
            >
              서비스 자세히 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── 신뢰 통계 배너 ── */}
      <section className="bg-blue-600 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-4 text-center text-white">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold">24시간</p>
            <p className="text-xs sm:text-sm font-medium text-blue-100 mt-1">무료 상담</p>
          </div>
          <div className="border-x border-blue-400/50">
            <p className="text-2xl sm:text-3xl font-extrabold">1,000+</p>
            <p className="text-xs sm:text-sm font-medium text-blue-100 mt-1">상담 실적</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold">98%</p>
            <p className="text-xs sm:text-sm font-medium text-blue-100 mt-1">고객 만족도</p>
          </div>
        </div>
      </section>

      {/* ── 주요 서비스 ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">주요 서비스</h2>
            <p className="text-slate-500">전문적인 컨설팅을 통해 어르신과 가족에게 최적의 솔루션을 제안합니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🕊️',
                color: 'bg-blue-50',
                iconColor: 'bg-blue-100',
                title: '후불제 상조',
                desc: '거품을 뺀 합리적인 가격의 후불제 상조 서비스로 유가족의 경제적 부담을 최소화합니다.',
                link: '/services',
              },
              {
                icon: '🏥',
                color: 'bg-green-50',
                iconColor: 'bg-green-100',
                title: '요양병원 연계',
                desc: '어르신의 건강 상태와 거주지, 경제적 상황에 맞는 최적의 요양병원을 안내해 드립니다.',
                link: '/services',
              },
              {
                icon: '🏡',
                color: 'bg-orange-50',
                iconColor: 'bg-orange-100',
                title: '방문요양서비스',
                desc: '장기요양등급 신청부터 전문 요양보호사 매칭까지, 어르신이 댁에서 편안하게 생활하실 수 있도록 돕습니다.',
                link: '/services',
              },
            ].map((s) => (
              <div
                key={s.title}
                className={`${s.color} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col`}
              >
                <div className={`w-14 h-14 ${s.iconColor} rounded-xl flex justify-center items-center mb-5`}>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-grow">{s.desc}</p>
                <Link
                  to={s.link}
                  className="mt-5 text-blue-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
                >
                  자세히 보기 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 신사방TV 특별 혜택 ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
            <p className="text-red-500 font-bold text-sm mb-2 tracking-wide">📺 신사방TV 회원 특별 혜택</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
              신사방TV 회원 여러분께 드리는<br />특별한 약속입니다.
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              신사방TV를 통해 만나게 된 소중한 인연, 더욱 특별한 케어 서비스로 보답하겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.youtube.com/@sinsabangTV"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                <span>▶</span> 신사방TV 유튜브 채널
              </a>
              <a
                href="tel:1588-9012"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                📞 특별 상담 신청
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 상담 CTA ── */}
      <section className="py-20 bg-blue-700">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">지금 바로 무료 상담 받으세요</h2>
          <p className="text-blue-100 mb-8">
            24시간 언제든지, 전화 한 통으로 전문 상담사가 친절하게 안내해 드립니다.
          </p>
          <a
            href="tel:1588-9012"
            className="inline-block bg-white text-blue-700 font-extrabold text-xl px-12 py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all transform hover:-translate-y-1"
          >
            📞 1588-9012
          </a>
        </div>
      </section>

    </div>
  );
};

export default Home;
