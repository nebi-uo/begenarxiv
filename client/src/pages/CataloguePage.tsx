import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { MezmurListItem } from '../types';

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

  if (loading) return <div className="min-h-screen bg-background p-6 text-muted">Loading…</div>;
  if (error) return <div className="min-h-screen bg-background p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-semibold text-ink mb-6">Mezmur Catalogue</h1>
      <div className="flex flex-col gap-4">
        {mezmurs.map((m) => (
          <Link
            key={m.id}
            to={`/mezmur/${m.id}`}
            className="bg-card rounded-card p-5 shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="text-ink font-medium">{m.title}</p>
              <p className="text-muted text-sm">
                {m.artist_name ?? 'Unknown artist'} · {m.tune_name ?? 'Unknown tune'}
              </p>
            </div>
            {m.difficulty && (
              <span className="text-xs text-muted bg-background px-3 py-1 rounded-pill">
                {m.difficulty}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}