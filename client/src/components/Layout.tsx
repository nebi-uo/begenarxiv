import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-2xl mx-auto px-6 pt-8 pb-2">
        <h1 className="text-2xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Begenarxiv
        </h1>
        <p className="text-muted text-sm">Learn Begena, The Right Way.</p>
      </header>
      <main className="max-w-2xl mx-auto px-6 pb-16">{children}</main>
    </div>
  );
}