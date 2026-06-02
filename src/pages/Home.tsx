import { useState, useEffect } from 'react';
import QuoteCalculator from '../components/QuoteCalculator';
import { 
  Heart, 
  Building2, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  Star, 
  Clock, 
  Users, 
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const Home = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  // 상세 페이지 열기 핸들러 (외부 네이버 블로그 등은 새창, 내부는 모달로)
  const handleOpenDetail = (url: string) => {
    if (url.startsWith('http') && !url.includes(window.location.hostname)) {
      window.open(url, '_blank');
    } else {
      setModalUrl(url);
    }
  };

  // 외부(index.html 영상배너)에서 견적 모달 열기
  useEffect(() => {
    const handler = () => setIsQuoteOpen(true);
    window.addEventListener('open-quote-modal', handler);
    return () => window.removeEventListener('open-quote-modal', handler);
  }, []);

  const testimonials = [
    {
      id: 1,
      name: '김*호 님',
      service: '후불제 상조',
      content: '갑작스러운 아버님의 상에 경황이 없었는데, 새벽에 연락드렸음에도 바로 달려와 주시고 모든 절차를 내 가족처럼 꼼꼼히 챙겨주셔서 정말 큰 위로가 되었습니다. 비용도 처음에 안내받은 그대로라 부담이 덜했습니다.',
      date: '2025. 02. 15',
      rating: 5
    },
    {
      id: 2,
      name: '이*영 님',
      service: '요양병원 연계',
      content: '치매가 있으신 어머님을 모실 병원을 찾느라 막막했는데, 집에서 가깝고 시설 좋은 곳을 여러 군데 비교해서 추천해 주신 덕분에 안심하고 모실 수 있었습니다. 직접 방문해서 확인까지 시켜주시는 꼼꼼함에 감동했습니다.',
      date: '2025. 01. 22',
      rating: 5
    },
    {
      id: 3,
      name: '박*수 님',
      service: '방문요양서비스',
      content: '등급 신청하는 방법조차 몰랐는데 처음부터 끝까지 다 알아서 해주셨어요. 지금 오시는 요양보호사 선생님도 너무 친절하시고 부모님 말벗도 잘 되어주셔서 제가 마음 편히 직장생활을 할 수 있게 되었습니다.',
      date: '2024. 11. 08',
      rating: 5
    }
  ];

  const blogPosts = [
    {
      id: 1,
      title: '방문재가서비스 신청 가이드',
      excerpt: '방문재가서비스 신청부터 이용까지, 절차와 혜택을 알기 쉽게 안내해 드립니다. 방문요양·방문목욕·방문간호 서비스 이용 가이드.',
      date: '2025. 02. 20',
      category: '방문재가',
      iframe: '/bangmun_slideshow.html',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 2,
      title: '좋은 요양병원을 선택하는 5가지 기준',
      excerpt: '수많은 요양병원 중 우리 부모님께 딱 맞는 곳을 고르기 위해 반드시 확인해야 할 체크리스트를 공유합니다.',
      date: '2025. 02. 10',
      category: '요양병원',
      iframe: '/yoyangbyungwon_guide.html',
      image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 3,
      title: '선불제 상조 vs 후불제 상조, 차이점은?',
      excerpt: '장례 준비를 앞두고 고민하시는 분들을 위해 선불제 상조와 후불제 상조의 장단점을 명확하게 비교해 드립니다.',
      date: '2025. 01. 25',
      category: '상조 정보',
      iframe: '/ieum_carelife_slideshow.html',
      image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="flex flex-col w-full bg-[#0a0f1e] text-slate-200 overflow-x-hidden">


      {/* 상세정보 슬라이드 모달 */}
      {modalUrl && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" onClick={() => setModalUrl(null)}>
          <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalUrl(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center z-10 border border-white/40 text-xl font-bold">✕</button>
            <iframe src={modalUrl} className="w-full rounded-xl" style={{aspectRatio:'16/9',border:'none'}} title="상세정보" />
          </div>
        </div>
      )}
      
      {/* ── Section 1: Hero ── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-8 leading-[1.1] text-white">
              종합 케어 서비스<br />
              <span className="text-blue-500">이음케어라이프</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-xl">
              어르신의 삶과 가족의 마음을 이어주는<br />
              후불제상조 · 요양병원 · 방문요양 서비스 전문 상담
            </p>
            
            <div className="flex flex-wrap gap-4 mb-16">
              <a href="#consult-form" className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-2xl shadow-blue-900/40 text-lg">
                지금 무료상담 받기
              </a>
              <a href="/services" className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-all border border-slate-700 text-lg">
                서비스 둘러보기
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-lg">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
                <div className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">24시간</div>
                <div className="text-2xl font-black text-white">무료 상담</div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
                <div className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">1,000+</div>
                <div className="text-2xl font-black text-white">가족 만족</div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
                <div className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">98%</div>
                <div className="text-2xl font-black text-white">만족도</div>
              </div>
            </div>


          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-slate-900 shadow-3xl shadow-black/60 aspect-[4/3]">
              <img 
                src="/center-team.jpg" 
                alt="이음케어라이프 팀" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 right-6 bg-green-500 p-3 rounded-2xl shadow-xl">
                <Heart className="text-white w-8 h-8 fill-white/20" />
              </div>
            </div>
            {/* Floating stats card */}
            <div className="absolute -bottom-10 -left-10 bg-orange-500 p-8 rounded-[2rem] shadow-3xl shadow-orange-900/40 border-[6px] border-slate-900 hidden md:block">
              <Award className="text-white w-12 h-12 mb-2" />
              <div className="text-white font-black text-xl">25년 경력</div>
              <div className="text-orange-100 text-sm">전문가 그룹</div>
            </div>
            {/* 맞춤상조 견적내기 - 이미지 하단 */}
            <button
              onClick={() => setIsQuoteOpen(true)}
              className="mt-6 w-full group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-900/30 via-amber-800/20 to-yellow-900/30 p-5 text-left transition-all hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-900/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[50px] rounded-full"></div>
              <div className="relative flex items-center gap-4">
                <div className="shrink-0 w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500 transition-colors duration-500">
                  <Calculator className="w-6 h-6 text-amber-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-amber-400 text-xs font-black mb-0.5 uppercase tracking-[0.2em]">CUSTOM QUOTE</div>
                  <div className="text-lg font-black text-white tracking-tight">맞춤상조 견적내기</div>
                  <div className="text-slate-400 text-xs mt-0.5">기본 <span className="text-amber-400 font-bold">99만원</span>부터 · 옵션별 실시간 계산</div>
                </div>
                <ArrowRight className="shrink-0 w-5 h-5 text-amber-500/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 2: YouTube | Naver Blog 2분할 ── */}
      <section className="py-10 bg-[#0a0f1e]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* 유튜브 카드 */}
            <div className="bg-slate-900/70 border border-red-500/20 rounded-2xl p-6 flex flex-col gap-4 hover:border-red-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                  <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.862.51 9.387.51 9.387.51s7.524 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-red-400 text-xs font-black uppercase tracking-widest">YouTube</div>
                  <div className="text-white font-black text-base">신사방TV</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">
                신사방TV 회원 여러분께 드리는 이음케어라이프만의 특별한 약속입니다.<br/>
                <span className="text-slate-500 text-xs">신사방TV를 통해 만나게 된 소중한 인연, 더욱 특별한 케어 서비스로 보답하겠습니다.</span>
              </p>
              <a href="https://www.youtube.com/@sinsabangTV" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-[#e53e3e] hover:bg-[#c53030] text-white rounded-xl font-bold text-sm transition-all active:scale-95">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.862.51 9.387.51 9.387.51s7.524 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                신사방TV 유튜브 채널 바로가기
              </a>
            </div>

            {/* 네이버 블로그 카드 */}
            <div className="bg-slate-900/70 border border-green-500/20 rounded-2xl p-6 flex flex-col gap-4 hover:border-green-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shrink-0">
                  <svg className="w-5 h-5 fill-[#03C75A]" viewBox="0 0 24 24"><path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>
                </div>
                <div>
                  <div className="text-green-400 text-xs font-black uppercase tracking-widest">Naver Blog</div>
                  <div className="text-white font-black text-base">이음케어 공식 블로그</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">
                후불제 상조, 요양병원, 방문요양 등 시니어 케어에 꼭 필요한 최신 정보를 블로그에서 먼저 확인하세요.<br/>
                <span className="text-slate-500 text-xs">MOU 협약 소식 및 서비스 안내도 블로그에서 만나보실 수 있습니다.</span>
              </p>
              <a href="https://blog.naver.com/sinabro7500" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-[#03C75A] hover:bg-[#02a84b] text-white rounded-xl font-bold text-sm transition-all active:scale-95">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>
                네이버 블로그 방문하기
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 3: Core Services ── */}
      <section className="py-32 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">종합 케어 서비스</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">어르신의 편안한 노후와 존엄한 마지막을 위해<br />가장 신뢰할 수 있는 세 가지 핵심 서비스를 제공합니다.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Card 1: 상조 */}
            <div className="premium-dark-card p-12 text-center group">
              <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-orange-500/20 group-hover:bg-orange-500 transition-colors duration-500">
                <Heart className="text-orange-500 w-10 h-10 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight">후불제 상조</h4>
              <p className="text-slate-400 leading-relaxed mb-10">
                거품 없는 가격과 정직한 의전으로<br />이별의 순간을 가장 아름답게 준비합니다.
              </p>
              <ul className="space-y-4 text-left mb-12">
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-orange-500" /> 월 납입금 일절 없음</li>
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-orange-500" /> 24시간 즉시 출동 시스템</li>
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-orange-500" /> 전문 장례지도사 전담 케어</li>
              </ul>
              <button onClick={() => handleOpenDetail('/ieum_carelife_slideshow.html')} className="text-blue-500 font-black flex items-center gap-2 mx-auto hover:gap-4 transition-all">
                상세 정보 보기 <ArrowRight size={20} />
              </button>
            </div>

            {/* Card 2: 요양병원 */}
            <div className="premium-dark-card p-12 text-center group">
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-blue-500/20 group-hover:bg-blue-500 transition-colors duration-500">
                <Building2 className="text-blue-500 w-10 h-10 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight">요양병원 연계</h4>
              <p className="text-slate-400 leading-relaxed mb-10">
                어르신의 질환과 상황에 최적화된<br />우수 요양병원을 전문적으로 추천합니다.
              </p>
              <ul className="space-y-4 text-left mb-12">
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-blue-500" /> 수도권 우수 병원 네트워킹</li>
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-blue-500" /> 입원 수속 및 이동 원스톱 지원</li>
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-blue-500" /> 시설 및 비용 정밀 분석</li>
              </ul>
              <button onClick={() => handleOpenDetail('/yoyangbyungwon_guide.html')} className="text-blue-500 font-black flex items-center gap-2 mx-auto hover:gap-4 transition-all">
                상세 정보 보기 <ArrowRight size={20} />
              </button>
            </div>

            {/* Card 3: 방문요양 */}
            <div className="premium-dark-card p-12 text-center group">
              <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-purple-500/20 group-hover:bg-purple-500 transition-colors duration-500">
                <FileText className="text-purple-500 w-10 h-10 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight">방문요양 서비스</h4>
              <p className="text-slate-400 leading-relaxed mb-10">
                국가 지원 혜택을 통해 집에서 편안하게<br />전문 요양보호사의 케어를 받으세요.
              </p>
              <ul className="space-y-4 text-left mb-12">
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-purple-500" /> 등급 신청 전 과정 무료 대행</li>
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-purple-500" /> 엄선된 전문 요양보호사 파견</li>
                <li className="flex items-center gap-3 text-slate-300 font-bold"><CheckCircle2 className="w-5 h-5 text-purple-500" /> 장기요양보험 활용 극대화</li>
              </ul>
              <button onClick={() => handleOpenDetail('/bangmun_slideshow.html')} className="text-blue-500 font-black flex items-center gap-2 mx-auto hover:gap-4 transition-all">
                상세 정보 보기 <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Partner Showcase ── */}
      <section className="py-32 bg-slate-900/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-10 tracking-tight leading-tight">
              가장 믿을 수 있는<br />
              <span className="text-blue-500">최상의 케어 파트너</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed">
              이음케어라이프는 단순히 서비스를 연결하는 것을 넘어,<br />
              어르신의 건강과 가족의 평안을 끝까지 책임지는 든든한 동반자입니다.
            </p>

            <div className="space-y-10 mb-16">
              {[
                { icon: ShieldCheck, color: 'blue', title: '정직한 투명성', desc: '불필요한 끼워팔기나 추가 비용 없이, 정해진 가격 그대로 정성을 다합니다.' },
                { icon: Clock, color: 'orange', title: '24시 즉시 대응', desc: '위급한 순간, 가장 먼저 닿을 수 있도록 365일 24시간 상담 센터를 운영합니다.' },
                { icon: Users, color: 'green', title: '전문가 전담제', desc: '25년 경력의 시니어 케어 전문가가 초기 상담부터 사후 관리까지 책임집니다.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className={`shrink-0 w-14 h-14 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center border border-${item.color}-500/20 group-hover:bg-${item.color}-500 transition-colors duration-500`}>
                    <item.icon className={`text-${item.color}-500 w-7 h-7 group-hover:text-white transition-colors`} />
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-white mb-2">{item.title}</h5>
                    <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-10 bg-slate-900 rounded-[2rem] border border-slate-700 shadow-3xl">
              <div className="text-slate-500 font-black text-sm mb-2 tracking-widest">상담 및 가입 예약</div>
              <div className="text-5xl font-black text-white mb-4">1588-9012</div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                24시간 365일 상담사 즉시 연결 가능
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[3rem] overflow-hidden border-[1px] border-white/10 shadow-3xl">
              <img 
                src="/mou/mou-collage.jpg" 
                alt="이음케어라이프 활동" 
                className="w-full h-auto"
                onError={(e) => { (e.target as HTMLImageElement).src = '/center-team.jpg'; }}
              />
            </div>
            {/* Floating metrics */}
            <div className="absolute -bottom-12 right-0 left-0 md:left-auto md:-right-12 bg-slate-900/90 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-3xl max-w-sm">
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <div className="text-blue-500 text-4xl font-black mb-1">25+</div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">현장 실무 경력</div>
                </div>
                <div>
                  <div className="text-orange-500 text-4xl font-black mb-1">1,500+</div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">누적 상담 수</div>
                </div>
                <div className="col-span-2 pt-8 border-t border-white/5">
                  <div className="text-green-500 text-4xl font-black mb-1">98.7%</div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">고객 서비스 만족도</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Real Reviews ── */}
      <section className="py-32 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">진심이 담긴 고객 후기</h2>
          <p className="text-slate-400 text-lg mb-20 max-w-2xl mx-auto">어려운 시기를 함께 이겨낸 가족분들의 소중한 목소리를 들려드립니다.</p>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((review) => (
              <div key={review.id} className="premium-dark-card p-10 text-left flex flex-col">
                <div className="flex text-yellow-500 mb-8">
                  {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-10 flex-grow">
                  "{review.content}"
                </p>
                <div className="flex items-center gap-5 pt-8 border-t border-white/5">
                  <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center font-black text-blue-500 text-xl border border-blue-500/20">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-black text-lg">{review.name}</div>
                    <div className="text-slate-500 font-bold text-sm">{review.service} 이용</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <button className="text-blue-500 font-black text-lg flex items-center gap-3 mx-auto hover:gap-5 transition-all">
              모든 후기 읽어보기 <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 6: Knowledge Blog ── */}
      <section className="py-32 bg-slate-900/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-left mb-16">
            <h2 className="text-4xl font-black text-white mb-4">케어 정보 블로그</h2>
            <p className="text-slate-500 text-lg">시니어 케어에 꼭 필요한 최신 정보를 전해드립니다.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-20">
            {blogPosts.map((post) => (
              <article key={post.id} className="premium-dark-card overflow-hidden group cursor-pointer border border-white/5" onClick={() => handleOpenDetail((post as any).iframe || 'https://blog.naver.com/sinabro7500')}>
                <div className="aspect-[16/10] overflow-hidden">
                  {(post as any).iframe ? (
                    <iframe
                      src={(post as any).iframe}
                      className="w-full h-full border-0 pointer-events-none"
                      title={post.title}
                      scrolling="no"
                    />
                  ) : (
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                </div>
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-blue-500 text-xs font-black uppercase tracking-widest">{post.category}</span>
                    <span className="text-slate-600 text-xs font-bold tracking-widest">{post.date}</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-5 group-hover:text-blue-500 transition-colors leading-tight tracking-tight">
                    {post.title}
                  </h4>
                  <p className="text-slate-500 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Final CTA ── */}
      <section className="py-40 bg-black relative text-center">
        <div className="absolute inset-0 bg-blue-900/10 blur-[150px] rounded-full"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight">
            당신의 가족처럼<br />끝까지 함께합니다.
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 mb-16 leading-relaxed font-medium">
            어렵고 막막한 시니어 케어의 모든 고민,<br />
            이음케어라이프가 해답이 되어 드리겠습니다.
          </p>
          <a href="#consult-form" className="inline-block px-14 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-2xl transition-all shadow-3xl shadow-blue-900/50 scale-100 hover:scale-105 active:scale-95">
            24시간 무료 상담 시작하기
          </a>
        </div>
      </section>

      {/* ── Sidebar Drawer ── */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] transition-opacity duration-500 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[500px] bg-[#0d152b] z-[2001] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-12 h-full overflow-y-auto custom-scrollbar">
          <button onClick={() => setIsDrawerOpen(false)} className="mb-12 p-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-all">
            <ChevronRight size={32} />
          </button>
          
          <div className="inline-block px-5 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black mb-6 tracking-[0.2em] uppercase">Lifetime Membership</div>
          <h2 className="text-4xl font-black text-white mb-6 leading-tight tracking-tight">회원 전용 서비스 및<br />혜택 상세 안내</h2>
          <p className="text-slate-400 text-lg mb-12">이음케어라이프만의 프리미엄 평생 케어 솔루션</p>

          <div className="space-y-8 mb-12">
            <div className="flex gap-5 items-start p-8 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/20">
                <Heart className="text-orange-500 w-7 h-7" />
              </div>
              <div>
                <h4 className="text-white font-black text-xl mb-2">후불제 상조 멤버십</h4>
                <p className="text-slate-400">월 납입금 없이, 필요할 때만 비용 정산. 24시간 전담 케어로 가족의 마지막 순간을 함께합니다.</p>
              </div>
            </div>
            <div className="flex gap-5 items-start p-8 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20">
                <Building2 className="text-blue-500 w-7 h-7" />
              </div>
              <div>
                <h4 className="text-white font-black text-xl mb-2">요양병원 우선 연계</h4>
                <p className="text-slate-400">회원 가입 시 수도권 협력 요양병원 우선 배정 및 특별 할인 혜택이 제공됩니다.</p>
              </div>
            </div>
            <div className="flex gap-5 items-start p-8 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/20">
                <FileText className="text-purple-500 w-7 h-7" />
              </div>
              <div>
                <h4 className="text-white font-black text-xl mb-2">방문요양 우선 배정</h4>
                <p className="text-slate-400">장기요양등급 신청 대행부터 우수 요양보호사 우선 배정까지, 회원 전용 혜택을 누리세요.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-8 bg-blue-600/10 rounded-3xl border border-blue-500/20 mb-12">
            <ShieldCheck className="w-8 h-8 shrink-0" />
            <p className="leading-relaxed font-medium">
              <strong className="text-blue-500 text-lg">필수 안내사항</strong><br />
              멤버십 등록 시 정식 회원가입증권이 발행되며, 장례/요양 연계 시 회원 전용 특별 할인 및 프리미엄 의전 서비스를 평생 우선적으로 제공받으실 수 있습니다.
            </p>
          </div>

          <a href="#consult-form" onClick={() => setIsDrawerOpen(false)} className="block w-full py-6 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-3xl font-black text-xl transition-all shadow-2xl shadow-blue-900/30 mb-12 active:scale-95">
            지금 바로 신청하기
          </a>
        </div>
      </div>

      {/* Floating Membership Button */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-32 right-8 z-[1000] w-20 h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] flex flex-col items-center justify-center shadow-3xl border-2 border-white/20 transition-all hover:scale-110 active:scale-90 animate-bounce group"
      >
        <Users size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-black mt-1.5 uppercase tracking-widest">멤버십</span>
      </button>

      {/* 맞춤상조 견적내기 모달 */}
      <QuoteCalculator isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
};

export default Home;
