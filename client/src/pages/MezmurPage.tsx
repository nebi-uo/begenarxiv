import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, PlayCircle, Music, AlignLeft, Sparkles, Volume2, Disc, User, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurDetail, MezmurListItem } from '../types';
import TapToHearPlayer from '../components/TapToHearPlayer';
import DifficultyBar from '../components/DifficultyBar';
import SectionCard from '../components/SectionCard';
import HorizontalMezmurScroll from '../components/HorizontalMezmurScroll';
import Layout from '../components/Layout';
import IndiePageLoader from '../components/IndiePageLoader';
import { useTonePlayer, STRING_FREQUENCIES } from '../hooks/useTonePlayer';

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
  const { pluckString } = useTonePlayer();
  const [activeTestTone, setActiveTestTone] = useState<number | null>(null);

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
  }, [mezmur]);

  const handleTestTone = (pos: number) => {
    setActiveTestTone(pos);
    pluckString(pos);
    setTimeout(() => setActiveTestTone(null), 300);
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-16">
          <IndiePageLoader
            message="LOADING MEZMUR SEQUENCE..."
            subMessage="CALCULATING STRING HARMONICS"
          />
        </div>
      </Layout>
    );
  }

  if (error || !mezmur) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-16 p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <h3 className="font-bold text-rose-950 mb-1">Mezmur Not Found</h3>
          <p className="text-xs text-rose-700 mb-4">{error ?? 'Unable to find the requested song.'}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/catalogue"
              className="px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-medium cursor-pointer"
            >
              Back to Catalogue
            </Link>
            <button
              onClick={fetchSong}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-rose-300 text-rose-900 text-xs font-medium cursor-pointer"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const embedUrl = mezmur.youtube_url ? getYoutubeEmbedUrl(mezmur.youtube_url) : null;

  return (
    <Layout>
      {/* Breadcrumb Back Link */}
      <div className="mb-6">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-1 text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors"
        >
          <ChevronLeft size={14} /> Back to Catalogue
        </Link>
      </div>

      {/* Song Header Block */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200">
                <User size={12} className="text-zinc-500" />
                {mezmur.artist_name ?? 'Unknown artist'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200">
                <Disc size={12} className="text-zinc-500" />
                {mezmur.tune_name ?? 'Standard Tune'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">
              {mezmur.title}
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <DifficultyBar difficulty={mezmur.difficulty} />
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md">
              <Sparkles size={11} className="text-amber-500" />
              <span>Standard 5-String Tuning (C-D-E-G-A)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Player & Accompanying Material */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Tap-to-Hear Player & Lyrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tap-to-Hear Player Section */}
          <SectionCard
            icon={Music}
            iconColor="#D97706"
            title="Interactive Numbers Notation"
            description="Tap any number to hear its string. Press Play to step through the hymn with synchronized roll timing."
          >
            <TapToHearPlayer sequence={mezmur.sequence} />
          </SectionCard>

          {/* Lyrics Section */}
          {mezmur.lyrics && (
            <SectionCard
              icon={AlignLeft}
              iconColor="#059669"
              title="Liturgical Lyrics"
              description="Traditional hymn poetry aligned with the musical movements."
            >
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80">
                <p className="text-zinc-800 text-sm md:text-base whitespace-pre-line leading-relaxed font-sans">
                  {mezmur.lyrics}
                </p>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right Column (1 Col): Reference Video & Tuning Profile */}
        <div className="space-y-6">
          {/* Reference Video */}
          {embedUrl && (
            <SectionCard
              icon={PlayCircle}
              iconColor="#E11D48"
              title="Reference Video"
              description="Master vocal phrasing & fingering."
            >
              <div className="aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-black">
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

          {/* Quick String Tuning Frequency Preview */}
          <SectionCard
            icon={Volume2}
            iconColor="#D97706"
            title="String Tuning Reference"
            description="Reference pitch targets for tuning your Begena."
          >
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((pos) => {
                const info = STRING_FREQUENCIES[pos];
                const isActive = activeTestTone === pos;

                return (
                  <button
                    key={pos}
                    onClick={() => handleTestTone(pos)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-zinc-950 text-white font-mono font-bold text-xs flex items-center justify-center">
                        {pos}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900">
                        String {pos} ({info.note})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-400">{info.hz} Hz</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-600">
                        {isActive ? 'Playing' : 'Pluck'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Discovery Ribbons: More from Artist & More in Tune */}
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
