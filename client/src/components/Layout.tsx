import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import AmbientBackground from './AmbientBackground';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative isolate">
      <AmbientBackground />
      <div className="sticky top-4 z-10 mx-4 md:mx-auto md:max-w-4xl flex items-center justify-between">
        <Link to="/catalogue" className="liquid-glass rounded-pill px-5 py-2.5">
          <span
            className="text-white tracking-tight font-medium"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Begenarxiv
          </span>
        </Link>
        <Link
          to="/"
          className="liquid-glass rounded-pill w-10 h-10 flex items-center justify-center"
          aria-label="Back to home"
        >
          <Home size={16} className="text-white" />
        </Link>
      </div>
      <main className="max-w-4xl mx-auto px-6 md:px-10 py-10">{children}</main>
    </div>
  );
}