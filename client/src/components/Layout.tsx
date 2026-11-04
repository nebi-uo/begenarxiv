import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PixelBegena from './PixelBegena';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isCatalogue = location.pathname.startsWith('/catalogue');

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans selection:bg-zinc-950 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo with Pixel Begena Icon */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-zinc-950 text-white flex items-center justify-center">
              <PixelBegena size="icon" />
            </div>
            <span className="font-semibold tracking-tight text-sm text-zinc-950">
              Begenarxiv
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
              v1.0
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-500">
            <Link
              to="/catalogue"
              className={`hover:text-zinc-950 transition-colors ${
                isCatalogue ? 'text-zinc-950 font-bold' : ''
              }`}
            >
              CATALOGUE
            </Link>
            <Link to="/#studio" className="hover:text-zinc-950 transition-colors">
              STUDIO
            </Link>
            <Link to="/#rolls" className="hover:text-zinc-950 transition-colors">
              ROLL_LAB
            </Link>
            <Link to="/#faq" className="hover:text-zinc-950 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-[10px] font-mono text-zinc-400">
              KEYS [1-5]: PLUCK
            </span>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-mono px-3 py-1.5 rounded transition-colors"
            >
              <span>Repertoire</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {children}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-zinc-900 font-semibold">
            <div className="w-5 h-5 rounded bg-zinc-950 text-white flex items-center justify-center">
              <PixelBegena size="icon" />
            </div>
            <span>Begenarxiv</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500 font-normal">Ethiopian Begena Notation &amp; Audio Archive</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/catalogue" className="hover:text-zinc-950 transition-colors">
              Catalogue
            </Link>
            <Link to="/#studio" className="hover:text-zinc-950 transition-colors">
              Studio
            </Link>
            <span>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
