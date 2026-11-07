import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelBegena from './PixelBegena';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isCatalogue = location.pathname.startsWith('/catalogue');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center gap-3 md:gap-6 text-xs sm:text-sm font-mono">
            <Link
              to="/contribute"
              className={`hover:text-black font-semibold tracking-wider transition-colors px-2 sm:px-3 py-1.5 rounded hover:bg-zinc-100/60 ${
                location.pathname === '/contribute' ? 'text-black' : 'text-zinc-600'
              }`}
            >
              ADD A MEZMUR
            </Link>

            <Link
              to="/request"
              className={`hover:text-black font-semibold tracking-wider transition-colors px-2 sm:px-3 py-1.5 rounded hover:bg-zinc-100/60 ${
                location.pathname === '/request' ? 'text-black' : 'text-zinc-600'
              }`}
            >
              REQUEST A MEZMUR
            </Link>

            <Link
              to="/catalogue"
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-all duration-150 shadow-xs font-semibold ${
                location.pathname === '/catalogue'
                  ? 'bg-black text-white ring-2 ring-zinc-300'
                  : 'bg-black hover:bg-zinc-800 text-white'
              }`}
            >
              <span>CATALOGUE</span>
              <ArrowRight size={13} />
            </Link>
          </nav>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="sm:hidden p-2 rounded-lg text-zinc-800 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="sm:hidden border-b border-zinc-200/90 bg-white/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2 font-mono text-xs overflow-hidden"
            >
              <Link
                to="/catalogue"
                className={`flex items-center justify-between p-3 rounded-lg font-bold transition-colors ${
                  location.pathname === '/catalogue'
                    ? 'bg-black text-white'
                    : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                <span>CATALOGUE</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/contribute"
                className={`block p-3 rounded-lg font-semibold tracking-wider transition-colors ${
                  location.pathname === '/contribute'
                    ? 'bg-zinc-200 text-black'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                }`}
              >
                ADD A MEZMUR
              </Link>
              <Link
                to="/request"
                className={`block p-3 rounded-lg font-semibold tracking-wider transition-colors ${
                  location.pathname === '/request'
                    ? 'bg-zinc-200 text-black'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                }`}
              >
                REQUEST A MEZMUR
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
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
            <span>Beta · Free &amp; No Accounts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
