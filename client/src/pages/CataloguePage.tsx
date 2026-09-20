import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { MezmurListItem } from '../types';
import Layout from '../components/Layout';
import CatalogueHero, { type GroupMode } from '../components/CatalogueHero';
import MezmurRow from '../components/MezmurRow';

export default function CataloguePage() {
  const [mezmurs, setMezmurs] = useState<MezmurListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.getMezmurs().then(setMezmurs).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><p className="text-muted text-sm">Loading…</p></Layout>;
  if (error) return <Layout><p className="text-red-600 text-sm">{error}</p></Layout>;

  const artistCount = new Set(mezmurs.map((m) => m.artist_name).filter(Boolean)).size;
  const tuneCount = new Set(mezmurs.map((m) => m.tune_name).filter(Boolean)).size;

  const grouped: Record<string, MezmurListItem[]> =
    groupMode === 'all'
      ? { 'All mezmurs': mezmurs }
      : mezmurs.reduce((acc, m) => {
          const key = groupMode === 'artist' ? m.artist_name ?? 'Unknown artist' : m.tune_name ?? 'Unknown tune';
          acc[key] = acc[key] ? [...acc[key], m] : [m];
          return acc;
        }, {} as Record<string, MezmurListItem[]>);

  const handleRandom = () => {
    if (mezmurs.length === 0) return;
    const pick = mezmurs[Math.floor(Math.random() * mezmurs.length)];
    navigate(`/mezmur/${pick.id}`);
  };

  return (
    <Layout>
      <CatalogueHero
        total={mezmurs.length}
        artistCount={artistCount}
        tuneCount={tuneCount}
        groupMode={groupMode}
        onGroupChange={setGroupMode}
        onRandom={handleRandom}
      />

      {mezmurs.length === 0 ? (
        <p className="text-muted text-sm">No mezmurs yet — check back soon.</p>
      ) : (
        Object.entries(grouped).map(([groupName, items]) => (
          <div key={groupName} className="mb-12">
            {groupMode !== 'all' && (
              <p className="text-xs text-muted uppercase tracking-wide mb-3">{groupName}</p>
            )}
            <div className="flex flex-col gap-4">
              {items.map((m, i) => (
                <MezmurRow key={m.id} mezmur={m} index={i} onClick={() => navigate(`/mezmur/${m.id}`)} />
              ))}
            </div>
          </div>
        ))
      )}
    </Layout>
  );
}