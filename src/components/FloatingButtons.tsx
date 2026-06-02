import { MessageCircle, Phone, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const FloatingButtons = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-3">
      {/* Phone Button */}
      <a
        href="tel:1588-9012"
        className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex justify-center items-center shadow-lg hover:scale-105 transition-transform"
        title="전화 상담 (1588-9012)"
      >
        <Phone className="w-5 h-5 md:w-6 md:h-6" />
      </a>

      {/* KakaoTalk Button */}
      <a
        href="http://pf.kakao.com/_PxmQG/chat"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 md:w-14 md:h-14 bg-[#FEE500] text-[#3C1E1E] rounded-full flex justify-center items-center shadow-lg hover:scale-105 transition-transform"
        title="카카오톡 상담"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      </a>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`w-12 h-12 md:w-14 md:h-14 bg-white text-slate-700 border border-slate-200 rounded-full flex justify-center items-center shadow-lg hover:bg-slate-50 transition-all ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="위로 가기"
      >
        <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
};

export default FloatingButtons;
