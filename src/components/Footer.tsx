import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">제대군인이음케어라이프</h3>
          <p className="text-slate-400 text-sm mb-4">
            어르신의 삶과 가족의 마음을 이어주는 종합 케어 서비스.<br />
            후불제 상조부터 요양병원 연결, 방문요양서비스 컨설팅까지.
          </p>
          <div className="flex flex-col gap-2 text-sm text-slate-300">
            {/* Address removed as per request */}
            <p className="flex items-center gap-2">
              <span className="font-semibold text-white">대표전화:</span> 1588-9012
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-white">이메일:</span> contact@ecl.ai.kr
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-blue-400 transition-colors">홈</Link></li>
            <li><Link to="/services" className="hover:text-blue-400 transition-colors">서비스 소개</Link></li>
            <li><Link to="/testimonials" className="hover:text-blue-400 transition-colors">고객 후기</Link></li>
            <li><Link to="/blog" className="hover:text-blue-400 transition-colors">블로그</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">상담 신청</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">운영 시간</h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li><span className="text-white">평일:</span> 09:00 - 18:00</li>
            <li><span className="text-white">주말/공휴일:</span> 휴무</li>
            <li className="mt-2 text-blue-400 font-semibold">장례/상조 긴급 전화는 24시간 운영됩니다.</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        <p>© 2025 제대군인이음케어라이프. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
