import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '서비스', href: '#membership-main-section' },
    { name: '후기', href: '#testimonials-section' },
    { name: '정보센터', href: 'https://blog.naver.com/sinabro7500', isExternal: true },
    { name: '견적내기', href: '/quote' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${isScrolled ? 'h-20 bg-[#0a0f1e]/90 backdrop-blur-xl shadow-2xl border-b border-white/5' : 'h-24 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <img src="/logo.png" alt="로고" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white leading-none tracking-tighter">이음케어라이프</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">후불제상조 · 요양병원 · 방문요양</span>
            </div>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              target={link.isExternal ? '_blank' : '_self'}
              rel={link.isExternal ? 'noopener noreferrer' : ''}
              className="text-slate-300 hover:text-white font-bold text-sm transition-colors tracking-tight"
            >
              {link.name}
            </a>
          ))}
          <a href="#consult-form" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-900/20">
            상담문의
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[#0d152b] border-b border-white/5 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 py-6' : 'max-h-0'}`}>
        <div className="flex flex-col gap-4 px-6">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-slate-300 font-bold text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#consult-form" 
            className="w-full py-4 bg-blue-600 text-white text-center rounded-xl font-black"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            상담문의
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
