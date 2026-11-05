import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, AlertCircle, RefreshCw, Tag } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurListItem } from '../types';
import Layout from '../components/Layout';
import CatalogueHero, { type GroupMode } from '../components/CatalogueHero';
import SearchFilterBar from '../components/SearchFilterBar';
import MezmurCard from '../components/MezmurCard';
import IndiePageLoader from '../components/IndiePageLoader';

export default function CataloguePage() {
  const [mezmurs, setMezmurs] = useState<MezmurListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>('all');
  const [query, setQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [artistFilter, setArtistFilter] = useState<string>('all');
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

  const availableArtists = useMemo(() => {
    const set = new Set<string>();
    mezmurs.forEach((m) => {
      if (m.artist_name && m.artist_name.trim()) set.add(m.artist_name.trim());
    });
    return Array.from(set).sort();
  }, [mezmurs]);

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

      const matchesMode =
        modeFilter === 'all' ||
        (m.tune_name && m.tune_name.toLowerCase().includes(modeFilter.toLowerCase()));

      const matchesArtist =
        artistFilter === 'all' ||
        (m.artist_name && m.artist_name.toLowerCase() === artistFilter.toLowerCase());

      return matchesQuery && matchesDifficulty && matchesMode && matchesArtist;
    });
  }, [mezmurs, query, difficultyFilter, modeFilter, artistFilter]);

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
        <div className="max-w-md mx-auto my-16 p-6 rounded-xl border border-zinc-200 bg-zinc-50 text-center font-mono">
          <AlertCircle size={28} className="mx-auto text-zinc-950 mb-3" />
          <h3 className="font-bold text-sm text-zinc-950 mb-1">UNABLE TO LOAD CATALOGUE</h3>
          <p className="text-xs text-zinc-500 mb-4">{error}</p>
          <button
            onClick={fetchSongs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-950 text-white text-xs font-mono cursor-pointer"
          >
            <RefreshCw size={11} /> RETRY
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {loading ? (
        <div className="py-12">
          <IndiePageLoader
            message="FETCHING REPERTOIRE..."
            subMessage="CONNECTING TO 10-STRING DATABASE"
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

          {/* Mode & Difficulty & Artist Filter Chips Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 font-mono text-xs">
            {/* 3 Modes Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-zinc-400 text-[11px] uppercase mr-1">Mode:</span>
              {['all', 'tizita', 'selamta', 'anchi-hoye'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-2.5 py-1 rounded text-xs capitalize transition-colors cursor-pointer ${
                    modeFilter === m
                      ? 'bg-zinc-950 text-white font-bold'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                  }`}
                >
                  {m === 'all' ? 'All Modes' : m}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Artist Tag Filter */}
              {availableArtists.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                    <Tag size={11} /> Artist:
                  </span>
                  <select
                    value={artistFilter}
                    onChange={(e) => setArtistFilter(e.target.value)}
                    className="px-2.5 py-1 rounded text-xs bg-white text-zinc-900 border border-zinc-200 focus:border-black outline-hidden cursor-pointer font-sans"
                  >
                    <option value="all">All Artists ({availableArtists.length})</option>
                    {availableArtists.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-zinc-400 flex items-center gap-1 mr-1 text-[11px]">
                  <Filter size={11} /> Level:
                </span>
                {['all', 'practice', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficultyFilter(lvl)}
                    className={`px-2.5 py-1 rounded text-xs uppercase transition-colors cursor-pointer ${
                      difficultyFilter === lvl
                        ? 'bg-zinc-950 text-white font-medium'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SearchFilterBar
            query={query}
            onQueryChange={setQuery}
            groupMode={groupMode}
            onGroupChange={setGroupMode}
          />

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-xs">
              <p className="text-zinc-950 font-bold mb-1">NO MATCHING HYMNS</p>
              <p className="text-zinc-500 text-[11px]">
                Try adjusting your search query, mode filter, or difficulty level.
              </p>
              {(query || difficultyFilter !== 'all' || modeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setDifficultyFilter('all');
                    setModeFilter('all');
                  }}
                  className="mt-4 px-3 py-1.5 rounded bg-zinc-950 text-white text-xs cursor-pointer"
                >
                  RESET FILTERS
                </button>
              )}
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName} className="mb-10">
                {groupMode !== 'all' && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-200 font-mono">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      {groupName}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      / {items.length} {items.length === 1 ? 'hymn' : 'hymns'}
                    </span>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
