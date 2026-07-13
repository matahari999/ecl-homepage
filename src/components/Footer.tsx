const Footer = () => {
  return (
    <footer style={{ background: '#0a0f1e', color: '#f8fafc', padding: '100px 20px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '80px', marginBottom: '80px' }}>

          {/* 기업 정보 */}
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="로고" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">이음케어라이프</span>
            </div>
            <p style={{ color: '#64748b', lineHeight: '2', fontSize: '0.95rem' }}>
              어르신의 삶과 가족의 마음을 이어주는<br />종합 케어 서비스 전문가 집단입니다.<br />
              후불제상조 · 요양병원 · 방문요양
            </p>
          </div>

          {/* 파트너사 */}
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>파트너사 바로가기</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li><a href="http://1san.co.kr" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }} className="hover:text-blue-500 transition-colors">일산 MG새마을금고</a></li>
              <li><a href="https://pjkfcc.co.kr" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }} className="hover:text-blue-500 transition-colors">파주중앙 MG새마을금고</a></li>
              <li><a href="https://goyangnuri.co.kr" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }} className="hover:text-blue-500 transition-colors">고양누리 MG새마을금고</a></li>
              <li><a href="https://songpo.nonghyup.com" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }} className="hover:text-blue-500 transition-colors">송포농협</a></li>
              <li><a href="https://gyea.kr/wp/" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }} className="hover:text-blue-500 transition-colors">국제청년연합회 (GYEA)</a></li>
            </ul>
          </div>

          {/* 연락처 */}
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>고객 지원 센터</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px', fontWeight: 700 }}>24시간 긴급 상담 및 예약</p>
            <a href="tel:1588-9012" style={{ color: '#3b82f6', fontSize: '2.5rem', fontWeight: 900, textDecoration: 'none', letterSpacing: '-0.02em' }} className="hover:scale-105 inline-block transition-transform">1588-9012</a>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '20px', fontWeight: 600 }}>경기도 고양시 일산서구 · 365일 무휴 상담</p>
            <div style={{ marginTop: '20px' }}>
              <a href="https://www.youtube.com/@sinsabangTV" target="_blank" rel="noopener noreferrer"
                style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                className="hover:text-red-500 transition-colors">
                ▶ 신사방TV (유튜브)
              </a>
            </div>
          </div>

        </div>

        <div style={{ paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600, lineHeight: '1.8', marginBottom: '12px' }}>
            이음케어라이프 · 대표: 김경무 · 사업자등록번호: 398-57-01031<br />
            경기 고양 일산서구 산현로17번길
          </p>
          <p style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 700 }}>&copy; 2025 이음케어라이프. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
