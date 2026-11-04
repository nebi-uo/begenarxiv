import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PixelBegena from './PixelBegena';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isCatalogue = location.pathname.startsWith('/catalogue');

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 flex flex-col font-sans selection:bg-zinc-950 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo with Scaled-Down Begena */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-8 rounded bg-black text-white flex items-center justify-center p-0.5 shrink-0">
              <PixelBegena size="icon" interactive={false} />
            </div>
            <span className="font-bold tracking-tight text-base text-zinc-950">
              Begenarxiv
            </span>
          </Link>

          {/* Navigation Links - Only Necessary Ones */}
          <nav className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
            <Link
              to="/catalogue"
              className={`hover:text-black transition-colors ${
                isCatalogue ? 'text-black font-bold' : 'text-zinc-600'
              }`}
            >
              CATALOGUE
            </Link>

            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-mono px-3.5 py-1.5 rounded transition-colors"
            >
              <span>Repertoire</span>
              <ArrowRight size={12} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {children}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-200 bg-white/80 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-zinc-900 font-semibold">
            <div className="w-6 h-7 rounded bg-black text-white flex items-center justify-center p-0.5 shrink-0">
              <PixelBegena size="icon" interactive={false} />
            </div>
            <span>Begenarxiv</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500 font-normal">Ethiopian Begena Archive</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/catalogue" className="hover:text-zinc-950 transition-colors">
              Catalogue
            </Link>
            <span className="text-zinc-300">·</span>
            <span>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
