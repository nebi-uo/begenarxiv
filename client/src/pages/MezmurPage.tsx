import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, PlayCircle, Music, AlignLeft, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurDetail, MezmurListItem } from '../types';
import TapToHearPlayer from '../components/TapToHearPlayer';
import DifficultyBar from '../components/DifficultyBar';
import SectionCard from '../components/SectionCard';
import HorizontalMezmurScroll from '../components/HorizontalMezmurScroll';
import Layout from '../components/Layout';

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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getMezmurById(id).then(setMezmur).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!mezmur) return;
    if (mezmur.artist_id) api.getMezmursByArtist(mezmur.artist_id, mezmur.id).then(setMoreFromArtist).catch(() => {});
    if (mezmur.tune_id) api.getMezmursByTune(mezmur.tune_id, mezmur.id).then(setMoreInTune).catch(() => {});
  }, [mezmur]);

  if (loading) return <Layout><p className="text-white/50 text-sm">Loading…</p></Layout>;
  if (error) return <Layout><p className="text-red-400 text-sm">{error}</p></Layout>;
  if (!mezmur) return null;

  const embedUrl = mezmur.youtube_url ? getYoutubeEmbedUrl(mezmur.youtube_url) : null;

  return (
    <Layout>
      <Link to="/catalogue" className="inline-flex items-center gap-1 text-white/70 text-sm mb-6">
        <ChevronLeft size={16} /> Catalogue
      </Link>

      {/* Header block — its own visual unit, independent of the content below */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {mezmur.title}
        </h2>
        <p className="text-white/70 mb-2">
          {mezmur.artist_name ?? 'Unknown artist'} · {mezmur.tune_name ?? 'Unknown tune'}
        </p>
        <DifficultyBar difficulty={mezmur.difficulty} />
        {mezmur.tuning_profile_id && (
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-pill liquid-glass text-white/70 text-sm">
            <Sparkles size={14} />
            Tune for this mezmur — coming soon
          </div>
        )}
      </div>

      {/* Main content — responsive: single column on mobile/tablet, two-column on desktop */}
      <div className="grid lg:grid-cols-2 gap-6">
        {embedUrl && (
          <SectionCard icon={PlayCircle} iconColor="#EF6461" title="Reference video">
            <div className="aspect-video rounded-card overflow-hidden">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </SectionCard>
        )}

        {mezmur.lyrics && (
          <SectionCard icon={AlignLeft} iconColor="#1FAE7A" title="Lyrics">
            <p className="text-white/90 whitespace-pre-line leading-relaxed">{mezmur.lyrics}</p>
          </SectionCard>
        )}
      </div>

      <div className="mt-6">
        <SectionCard icon={Music} iconColor="#F2A93B" title="Learn to play">
          <TapToHearPlayer sequence={mezmur.sequence} />
        </SectionCard>
      </div>

      {/* Discovery — visually distinct region: no glass card wrapper, divider above,
          horizontal-scroll pattern instead of the vertical stack used everywhere else */}
      {(moreFromArtist.length > 0 || moreInTune.length > 0) && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <HorizontalMezmurScroll
            title={`More from ${mezmur.artist_name}`}
            items={moreFromArtist}
            onSelect={(mid) => navigate(`/mezmur/${mid}`)}
          />
          <HorizontalMezmurScroll
            title={`More in ${mezmur.tune_name}`}
            items={moreInTune}
            onSelect={(mid) => navigate(`/mezmur/${mid}`)}
          />
        </div>
      )}
    </Layout>
  );
}