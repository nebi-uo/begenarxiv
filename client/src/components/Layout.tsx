import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import AmbientBackground from './AmbientBackground';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative isolate">
      <AmbientBackground />
      <div className="sticky top-4 z-10 mx-4 md:mx-auto md:max-w-2xl">
        <header className="liquid-glass rounded-pill">
          <div className="px-6 py-3">
            <Link
              to="/"
              className="text-lg text-ink tracking-tight font-medium"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Begenarxiv
            </Link>
          </div>
        </header>
      </div>
      <main className="max-w-4xl mx-auto px-6 md:px-10 py-10">{children}</main>
    </div>
  );
}