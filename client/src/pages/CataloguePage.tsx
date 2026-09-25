import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { MezmurListItem } from '../types';
import Layout from '../components/Layout';
import CatalogueHero, { type GroupMode } from '../components/CatalogueHero';
import SearchFilterBar from '../components/SearchFilterBar';
import MezmurCard from '../components/MezmurCard';
import SkeletonCard from '../components/SkeletonCard';

export default function CataloguePage() {
  const [mezmurs, setMezmurs] = useState<MezmurListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>('all');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getMezmurs().then(setMezmurs).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mezmurs;
    return mezmurs.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.artist_name?.toLowerCase().includes(q) ||
        m.tune_name?.toLowerCase().includes(q)
    );
  }, [mezmurs, query]);

  const artistCount = new Set(mezmurs.map((m) => m.artist_name).filter(Boolean)).size;
  const tuneCount = new Set(mezmurs.map((m) => m.tune_name).filter(Boolean)).size;

  const grouped: Record<string, MezmurListItem[]> =
    groupMode === 'all'
      ? { 'All mezmurs': filtered }
      : filtered.reduce((acc, m) => {
          const key = groupMode === 'artist' ? m.artist_name ?? 'Unknown artist' : m.tune_name ?? 'Unknown tune';
          acc[key] = acc[key] ? [...acc[key], m] : [m];
          return acc;
        }, {} as Record<string, MezmurListItem[]>);

  const handleRandom = () => {
    if (mezmurs.length === 0) return;
    const pick = mezmurs[Math.floor(Math.random() * mezmurs.length)];
    navigate(`/mezmur/${pick.id}`);
  };

  if (error) return <Layout><p className="text-red-400 text-sm">{error}</p></Layout>;

  return (
    <Layout>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <CatalogueHero
            total={mezmurs.length}
            artistCount={artistCount}
            tuneCount={tuneCount}
            groupMode={groupMode}
            onGroupChange={setGroupMode}
            onRandom={handleRandom}
          />
          <SearchFilterBar query={query} onQueryChange={setQuery} groupMode={groupMode} onGroupChange={setGroupMode} />

          {filtered.length === 0 ? (
            <p className="text-white/50 text-sm">No mezmurs match "{query}".</p>
          ) : (
            Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName} className="mb-12">
                {groupMode !== 'all' && (
                  <p className="text-xs text-white/60 uppercase tracking-wide mb-3">{groupName}</p>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((m) => (
                    <MezmurCard key={m.id} mezmur={m} onClick={() => navigate(`/mezmur/${m.id}`)} />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </Layout>
  );
}