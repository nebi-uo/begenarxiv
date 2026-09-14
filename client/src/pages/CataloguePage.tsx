import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { MezmurListItem } from '../types';
import Layout from '../components/Layout';

export default function CataloguePage() {
  const [mezmurs, setMezmurs] = useState<MezmurListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMezmurs()
      .then(setMezmurs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><p className="text-muted">Loading…</p></Layout>;
  if (error) return <Layout><p className="text-red-600">{error}</p></Layout>;

  return (
    <Layout>
      <h2 className="text-xl text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Catalogue
      </h2>
      <p className="text-muted text-sm mb-6">{mezmurs.length} mezmurs</p>

      {mezmurs.length === 0 ? (
        <p className="text-muted text-sm">No mezmurs yet — check back soon.</p>
      ) : (
        <div className="divide-y divide-border border-t border-b border-border">
          {mezmurs.map((m) => (
            <Link
              key={m.id}
              to={`/mezmur/${m.id}`}
              className="flex items-center justify-between py-4"
            >
              <div>
                <p className="text-ink font-medium" style={{ fontFamily: 'var(--font-display)' }}>
                  {m.title}
                </p>
                <p className="text-muted text-sm mt-0.5">
                  {m.artist_name ?? 'Unknown artist'} · {m.tune_name ?? 'Unknown tune'}
                </p>
              </div>
              {m.difficulty && (
                <span className="text-xs text-accent">{m.difficulty}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}