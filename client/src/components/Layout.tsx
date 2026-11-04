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
      {/* Top Navbar: Transparent at top, glassmorphic on scroll */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-zinc-200/80 shadow-xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo with Scaled-Down Begena on Transparent Background */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-8 flex items-center justify-center shrink-0">
              <PixelBegena size="icon" interactive={false} />
            </div>
            <span className="font-bold tracking-tight text-base text-zinc-950">
              Begenarxiv
            </span>
          </Link>

          {/* Navigation Links: On /catalogue, no unnecessary buttons. On /mezmur/:id, only CATALOGUE */}
          {!isCatalogue && (
            <nav className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
              <Link
                to="/catalogue"
                className="hover:text-black text-zinc-600 transition-colors"
              >
                CATALOGUE
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {children}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-200/80 bg-white/70 backdrop-blur-[2px] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-zinc-900 font-semibold">
            <div className="w-6 h-8 flex items-center justify-center shrink-0">
              <PixelBegena size="icon" interactive={false} />
            </div>
            <span>Begenarxiv</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500 font-normal">Ethiopian Begena Archive</span>
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
            <span>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
