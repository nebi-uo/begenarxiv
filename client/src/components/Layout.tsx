import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1
            className="text-lg text-ink tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Begenarxiv
          </h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}