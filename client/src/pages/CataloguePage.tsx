import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurListItem } from '../types';
import Layout from '../components/Layout';
import CatalogueHero, { type GroupMode } from '../components/CatalogueHero';
import SearchFilterBar from '../components/SearchFilterBar';
import MezmurCard from '../components/MezmurCard';
import CatalogueHeroBanner from '../components/CatalogueHeroBanner';
import IndiePageLoader from '../components/IndiePageLoader';

export default function CataloguePage() {
  const [mezmurs, setMezmurs] = useState<MezmurListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>('all');
  const [query, setQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const navigate = useNavigate();

  const fetchSongs = () => {
    setLoading(true);
    setError(null);
    api.getMezmurs()
      .then(setMezmurs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mezmurs.filter((m) => {
      const matchesQuery =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.artist_name?.toLowerCase().includes(q) ||
        m.tune_name?.toLowerCase().includes(q);

      const matchesDifficulty =
        difficultyFilter === 'all' || m.difficulty === difficultyFilter;

      return matchesQuery && matchesDifficulty;
    });
  }, [mezmurs, query, difficultyFilter]);

  const artistCount = new Set(mezmurs.map((m) => m.artist_name).filter(Boolean)).size;
  const tuneCount = new Set(mezmurs.map((m) => m.tune_name).filter(Boolean)).size;

  const grouped: Record<string, MezmurListItem[]> =
    groupMode === 'all'
      ? { 'All mezmurs': filtered }
      : filtered.reduce((acc, m) => {
          const key =
            groupMode === 'artist'
              ? m.artist_name ?? 'Unknown artist'
              : m.tune_name ?? 'Unknown tune';
          acc[key] = acc[key] ? [...acc[key], m] : [m];
          return acc;
        }, {} as Record<string, MezmurListItem[]>);

  const handleRandom = () => {
    if (mezmurs.length === 0) return;
    const pick = mezmurs[Math.floor(Math.random() * mezmurs.length)];
    navigate(`/mezmur/${pick.id}`);
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-16 p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <h3 className="font-bold text-rose-950 mb-1">Unable to Load Catalogue</h3>
          <p className="text-xs text-rose-700 mb-4">{error}</p>
          <button
            onClick={fetchSongs}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-900 text-white text-xs font-medium cursor-pointer hover:bg-rose-800"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <CatalogueHeroBanner />

      {loading ? (
        <div className="py-12">
          <IndiePageLoader
            message="FETCHING MEZMUR ARCHIVE..."
            subMessage="SYNCING WITH POSTGRESQL NOTATION ENGINE"
          />
        </div>
      ) : (
        <>
          <CatalogueHero
            total={mezmurs.length}
            artistCount={artistCount}
            tuneCount={tuneCount}
            onRandom={handleRandom}
          />

          {/* Difficulty Filter Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-zinc-400 font-mono flex items-center gap-1 mr-1">
                <Filter size={12} /> Level:
              </span>
              {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficultyFilter(lvl)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${
                    difficultyFilter === lvl
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200/60'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-zinc-500">
              Showing {filtered.length} of {mezmurs.length} songs
            </span>
          </div>

          <SearchFilterBar
            query={query}
            onQueryChange={setQuery}
            groupMode={groupMode}
            onGroupChange={setGroupMode}
          />

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <Music size={28} className="mx-auto text-zinc-400 mb-2" />
              <p className="text-zinc-900 font-semibold text-sm">No mezmurs match your search</p>
              <p className="text-zinc-500 text-xs mt-1">
                Try searching a different artist, tune, or clearing your difficulty filter.
              </p>
              {(query || difficultyFilter !== 'all') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setDifficultyFilter('all');
                  }}
                  className="mt-4 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-medium cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName} className="mb-12">
                {groupMode !== 'all' && (
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-800">
                      {groupName}
                    </h3>
                    <span className="text-xs font-mono text-zinc-400">
                      ({items.length} {items.length === 1 ? 'song' : 'songs'})
                    </span>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {items.map((m, i) => (
                    <MezmurCard
                      key={m.id}
                      mezmur={m}
                      index={i}
                      onClick={() => navigate(`/mezmur/${m.id}`)}
                    />
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
