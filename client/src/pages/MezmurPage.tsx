import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, PlayCircle, Music, AlignLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurDetail, MezmurListItem } from '../types';
import TapToHearPlayer from '../components/TapToHearPlayer';
import DifficultyBar from '../components/DifficultyBar';
import SectionCard from '../components/SectionCard';
import HorizontalMezmurScroll from '../components/HorizontalMezmurScroll';
import Layout from '../components/Layout';
import IndiePageLoader from '../components/IndiePageLoader';
import PixelBegena from '../components/PixelBegena';
import { useTonePlayer, type BegenaTuneMode, BEGENA_TUNINGS } from '../hooks/useTonePlayer';

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function MezmurPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mezmur, setMezmur] = useState<MezmurDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreFromArtist, setMoreFromArtist] = useState<MezmurListItem[]>([]);
  const [moreInTune, setMoreInTune] = useState<MezmurListItem[]>([]);
  
  // Default mode is Tizita
  const [currentMode, setCurrentMode] = useState<BegenaTuneMode>('Tizita');
  const { pluckString } = useTonePlayer(currentMode);
  const [activeString, setActiveString] = useState<number | null>(null);

  const fetchSong = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.getMezmurById(id)
      .then(setMezmur)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSong();
  }, [id]);

  useEffect(() => {
    if (!mezmur) return;
    if (mezmur.artist_id) {
      api.getMezmursByArtist(mezmur.artist_id, mezmur.id)
        .then(setMoreFromArtist)
        .catch(() => {});
    }
    if (mezmur.tune_id) {
      api.getMezmursByTune(mezmur.tune_id, mezmur.id)
        .then(setMoreInTune)
        .catch(() => {});
    }
    // If tune name matches one of the 3 modes, adapt tuning mode
    if (mezmur.tune_name) {
      const lower = mezmur.tune_name.toLowerCase();
      if (lower.includes('selamta')) setCurrentMode('Selamta');
      else if (lower.includes('anchi')) setCurrentMode('Anchi-Hoye');
      else setCurrentMode('Tizita');
    }
  }, [mezmur]);

  const handleManualPluck = useCallback((pos: number) => {
    setActiveString(pos);
    pluckString(pos);
    setTimeout(() => setActiveString(null), 250);
  }, [pluckString]);

  // Keyboard shortcut listener: keys 1 to 5
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        handleManualPluck(parseInt(e.key, 10));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualPluck]);

  if (loading) {
    return (
      <Layout>
        <div className="py-16">
          <IndiePageLoader
            message="LOADING NOTATION..."
            subMessage="CALCULATING STRING HARMONICS"
          />
        </div>
      </Layout>
    );
  }

  if (error || !mezmur) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-16 p-6 rounded-xl border border-zinc-200 bg-zinc-50 text-center font-mono">
          <AlertCircle size={28} className="mx-auto text-zinc-950 mb-3" />
          <h3 className="font-bold text-sm text-zinc-950 mb-1">HYMN NOT FOUND</h3>
          <p className="text-xs text-zinc-500 mb-4">{error ?? 'Unable to find the requested song.'}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/catalogue"
              className="px-3 py-1.5 rounded bg-zinc-950 text-white text-xs font-mono"
            >
              Back to Catalogue
            </Link>
            <button
              onClick={fetchSong}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-zinc-300 text-zinc-900 text-xs font-mono cursor-pointer"
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const embedUrl = mezmur.youtube_url ? getYoutubeEmbedUrl(mezmur.youtube_url) : null;
  const currentTuningNotes = BEGENA_TUNINGS[currentMode];

  return (
    <Layout>
      {/* Breadcrumb Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-zinc-950 transition-colors"
        >
          <ChevronLeft size={14} /> CATALOGUE
        </Link>
        <span className="hidden sm:inline font-mono text-[10px] text-zinc-400">
          SHORTCUTS: [1-5] PLUCK · [SPACE] PLAY/PAUSE
        </span>
      </div>

      {/* Song Header Block */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs text-zinc-500">
              <span>{mezmur.artist_name ?? 'Unknown artist'}</span>
              <span>/</span>
              <span>{mezmur.tune_name ?? 'Tizita Mode'}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
              {mezmur.title}
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 font-mono text-xs">
            <DifficultyBar difficulty={mezmur.difficulty} />
            <div className="flex items-center gap-1">
              {(['Tizita', 'Selamta', 'Anchi-Hoye'] as BegenaTuneMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setCurrentMode(m)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                    currentMode === m
                      ? 'bg-zinc-950 text-white font-bold'
                      : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-400">
              {currentMode}: 1={currentTuningNotes[1]?.note} · 2={currentTuningNotes[2]?.note} · 3={currentTuningNotes[3]?.note} · 4={currentTuningNotes[4]?.note} · 5={currentTuningNotes[5]?.note}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Tap-to-Hear Player & Lyrics */}
        <div className="lg:col-span-8 space-y-6">
          <SectionCard
            icon={Music}
            title="Numbers Notation & Playback"
            description="Tap any number to hear that string, or press Play to hear the song in sync."
          >
            <TapToHearPlayer
              sequence={mezmur.sequence}
              mode={currentMode}
              onActiveStringChange={setActiveString}
            />
          </SectionCard>

          {mezmur.lyrics && (
            <SectionCard
              icon={AlignLeft}
              title="Mezmur Lyrics"
              description="Liturgical hymn lyrics aligned with the numbers notation."
            >
              <div className="p-4 bg-zinc-50 rounded border border-zinc-200 text-zinc-800 text-sm whitespace-pre-line leading-relaxed font-sans">
                {mezmur.lyrics}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right Column (4 Cols): Live Pixel Begena + Reference Video + Tuning */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live String Visualizer: 10-String Pixel Begena */}
          <div className="p-5 border border-zinc-200 rounded-lg bg-zinc-50/50 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-3 pb-2 border-b border-zinc-200">
              <span className="font-semibold text-zinc-900">10 PHYSICAL STRINGS</span>
              <span className="text-zinc-900 font-bold">
                {activeString
                  ? `STR ${activeString}: ${currentTuningNotes[activeString]?.note}`
                  : `${currentMode.toUpperCase()}`}
              </span>
            </div>

            <PixelBegena
              size="compact"
              activeString={activeString}
              onPluck={handleManualPluck}
              mode={currentMode}
            />
          </div>

          {/* Reference Video */}
          {embedUrl && (
            <SectionCard
              icon={PlayCircle}
              title="Reference Video"
              description="Performance reference to see and hear traditional phrasing."
            >
              <div className="aspect-video rounded overflow-hidden border border-zinc-200 bg-black">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={mezmur.title}
                />
              </div>
            </SectionCard>
          )}


        </div>
      </div>

      {/* Discovery Ribbons */}
      {(moreFromArtist.length > 0 || moreInTune.length > 0) && (
        <div className="mt-12 pt-8 border-t border-zinc-200">
          <HorizontalMezmurScroll
            title={`More from ${mezmur.artist_name ?? 'this artist'}`}
            items={moreFromArtist}
            onSelect={(mid) => navigate(`/mezmur/${mid}`)}
          />
          <HorizontalMezmurScroll
            title={`More in ${mezmur.tune_name ?? 'this tune'}`}
            items={moreInTune}
            onSelect={(mid) => navigate(`/mezmur/${mid}`)}
          />
        </div>
      )}
    </Layout>
  );
}
