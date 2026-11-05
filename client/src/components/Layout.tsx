import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PixelBegena from './PixelBegena';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isCatalogue = location.pathname.startsWith('/catalogue');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 flex flex-col font-sans selection:bg-zinc-950 selection:text-white">
      {/* Top Navbar: Scaled up, sticky top, glassmorphic on scroll */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-zinc-200/90 shadow-xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo with Scaled-Up Begena on Transparent Background */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-9 h-11 sm:w-10 sm:h-12 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <PixelBegena size="icon" interactive={false} />
            </div>
            <span className="font-bold tracking-tight text-xl sm:text-2xl text-zinc-950">
              Begenarxiv
            </span>
          </Link>

          {/* Navigation Links: Catalogue, Add a Mezmur, Request a Mezmur */}
          <nav className="flex items-center gap-1.5 sm:gap-4 md:gap-6 text-xs sm:text-sm font-mono">
            <Link
              to="/catalogue"
              className={`hover:text-black font-semibold tracking-wider transition-colors px-2 sm:px-3 py-1.5 rounded hover:bg-zinc-100/60 ${
                location.pathname === '/catalogue' ? 'text-black' : 'text-zinc-600'
              }`}
            >
              CATALOGUE
            </Link>

            <Link
              to="/contribute"
              className={`hover:text-black font-semibold tracking-wider transition-colors px-2 sm:px-3 py-1.5 rounded hover:bg-zinc-100/60 ${
                location.pathname === '/contribute' ? 'text-black' : 'text-zinc-600'
              }`}
            >
              <span className="hidden sm:inline">ADD A MEZMUR</span>
              <span className="sm:hidden">ADD</span>
            </Link>

            <Link
              to="/request"
              className={`hover:text-black font-semibold tracking-wider transition-colors px-2 sm:px-3 py-1.5 rounded hover:bg-zinc-100/60 ${
                location.pathname === '/request' ? 'text-black' : 'text-zinc-600'
              }`}
            >
              <span className="hidden sm:inline">REQUEST A MEZMUR</span>
              <span className="sm:hidden">REQUEST</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {children}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-zinc-900 font-semibold">
            <div className="w-7 h-9 flex items-center justify-center shrink-0">
              <PixelBegena size="icon" interactive={false} />
            </div>
            <span className="text-sm font-bold">Begenarxiv</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500 font-normal">A free home for Begena learners</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {!isCatalogue && (
              <>
                <Link to="/catalogue" className="hover:text-zinc-950 transition-colors">
                  Catalogue
                </Link>
                <span className="text-zinc-300">·</span>
              </>
            )}
            <Link to="/portal" className="hover:text-zinc-950 transition-colors">
              Portal
            </Link>
            <span className="text-zinc-300">·</span>
            <span>Beta · Free &amp; No Accounts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
