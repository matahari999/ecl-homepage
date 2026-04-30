import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: '홈', path: '/' },
    { name: '서비스', path: '/services' },
    { name: '고객후기', path: '/testimonials' },
    { name: '블로그', path: '/blog' },
    { name: '상담신청', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="제대군인이음케어라이프" className="h-9 lg:h-11 w-auto" />
          <div className="hidden xl:flex flex-col">
            <span className="text-base font-extrabold text-blue-900 leading-tight tracking-tight whitespace-nowrap">
              제대군인이음케어라이프
            </span>
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
              후불제상조 · 요양병원 · 방문요양
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                link.path === '/contact'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <a
            href="tel:1588-9012"
            className="ml-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            📞 1588-9012
          </a>
        </nav>

        {/* Mobile Button */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          onClick={toggleMenu}
          aria-label="메뉴 열기"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white shadow-xl border-b border-gray-100 animate-fade-in">
          <div className="flex flex-col px-4 py-5 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-base font-semibold px-4 py-3 rounded-xl transition-colors ${
                  link.path === '/contact'
                    ? 'bg-blue-600 text-white mt-1'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="tel:1588-9012"
              className="mt-2 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-extrabold text-lg px-4 py-3 rounded-xl border border-blue-200"
              onClick={() => setIsOpen(false)}
            >
              📞 1588-9012
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
