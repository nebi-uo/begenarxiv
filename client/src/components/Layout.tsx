import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, ArrowRight } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isCatalogue = location.pathname.startsWith('/catalogue');

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-zinc-950 text-white text-[11px] md:text-xs py-2 px-4 text-center font-medium border-b border-zinc-800">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Begenarxiv Beta 1.0 — The interactive archive for Begena players</span>
          <Link
            to="/catalogue"
            className="text-amber-300 hover:text-amber-200 underline underline-offset-2 ml-1 inline-flex items-center gap-0.5"
          >
            Explore <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Main SaaS Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              <Music size={16} className="text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-base text-zinc-950">
                Begenarxiv
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                archive
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link
              to="/catalogue"
              className={`hover:text-zinc-950 transition-colors ${
                isCatalogue ? 'text-zinc-950 font-semibold' : ''
              }`}
            >
              Song Catalogue
            </Link>
            <Link to="/#soundboard" className="hover:text-zinc-950 transition-colors">
              Soundboard
            </Link>
            <Link to="/#how-it-works" className="hover:text-zinc-950 transition-colors">
              How It Works
            </Link>
            <Link to="/#faq" className="hover:text-zinc-950 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs md:text-sm font-medium px-4 py-2 rounded-full shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Songs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Global Minimalist SaaS Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-zinc-950 text-white flex items-center justify-center">
                  <Music size={12} className="text-amber-400" />
                </div>
                <span className="font-bold text-sm text-zinc-950">Begenarxiv</span>
              </div>
              <p className="text-zinc-500 leading-relaxed text-xs">
                The open-source interactive learning platform and numbers notation archive for the Ethiopian Begena.
              </p>
            </div>

            <div>
              <p className="font-semibold text-zinc-900 mb-2.5 uppercase tracking-wider text-[11px]">
                Platform
              </p>
              <ul className="space-y-2 text-zinc-500">
                <li>
                  <Link to="/catalogue" className="hover:text-zinc-900 transition-colors">
                    Mezmur Catalogue
                  </Link>
                </li>
                <li>
                  <Link to="/#soundboard" className="hover:text-zinc-900 transition-colors">
                    Interactive Soundboard
                  </Link>
                </li>
                <li>
                  <Link to="/#how-it-works" className="hover:text-zinc-900 transition-colors">
                    Ornament Rolls & Notation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-zinc-900 mb-2.5 uppercase tracking-wider text-[11px]">
                Tuning Profiles
              </p>
              <ul className="space-y-2 text-zinc-500">
                <li>Standard C-D-E-G-A</li>
                <li>Tsehay Mode</li>
                <li>Ambassel Mode</li>
                <li>Bati Mode</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-zinc-900 mb-2.5 uppercase tracking-wider text-[11px]">
                Open Source
              </p>
              <ul className="space-y-2 text-zinc-500">
                <li>Free for all learners</li>
                <li>Self-contained Web Audio</li>
                <li>PostgreSQL + Express + Vite</li>
                <li className="text-[10px] text-zinc-400">Built for the Begena Community</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Begenarxiv. Open source project.</p>
            <p className="flex items-center gap-1 text-[11px]">
              <span>Handcrafted with</span>
              <span className="text-amber-600 font-medium">numbers notation</span>
              <span>for sacred preservation.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
