import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurListItem } from '../types';
import Layout from '../components/Layout';

const difficultyColor: Record<string, string> = {
  beginner: '#7BA05B',
  intermediate: '#A67C3D',
  advanced: '#B5555A',
};

export default function CataloguePage() {
  const [mezmurs, setMezmurs] = useState<MezmurListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getMezmurs().then(setMezmurs).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><p className="text-muted text-sm">Loading…</p></Layout>;
  if (error) return <Layout><p className="text-red-600 text-sm">{error}</p></Layout>;

  return (
    <Layout>
      <p className="text-xs text-muted uppercase tracking-wide mb-3">Catalogue</p>

      {mezmurs.length === 0 ? (
        <p className="text-muted text-sm">No mezmurs yet — check back soon.</p>
      ) : (
        <div className="bg-card rounded-card overflow-hidden">
          {mezmurs.map((m, i) => (
            <Link
              key={m.id}
              to={`/mezmur/${m.id}`}
              className={`flex items-center justify-between px-5 py-4 active:bg-background transition-colors ${
                i !== mezmurs.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {m.difficulty && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: difficultyColor[m.difficulty] }}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-ink font-medium truncate" style={{ fontFamily: 'var(--font-display)' }}>
                    {m.title}
                  </p>
                  <p className="text-muted text-sm truncate">
                    {m.artist_name ?? 'Unknown artist'} · {m.tune_name ?? 'Unknown tune'}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-muted shrink-0" size={18} />
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}