import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, PlayCircle, Music, AlignLeft, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurDetail } from '../types';
import TapToHearPlayer from '../components/TapToHearPlayer';
import DifficultyBar from '../components/DifficultyBar';
import SectionCard from '../components/SectionCard';
import Layout from '../components/Layout';

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function MezmurPage() {
  const { id } = useParams<{ id: string }>();
  const [mezmur, setMezmur] = useState<MezmurDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getMezmurById(id).then(setMezmur).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p className="text-muted text-sm">Loading…</p></Layout>;
  if (error) return <Layout><p className="text-red-600 text-sm">{error}</p></Layout>;
  if (!mezmur) return null;

  const embedUrl = mezmur.youtube_url ? getYoutubeEmbedUrl(mezmur.youtube_url) : null;

  return (
    <Layout>
      <Link to="/" className="inline-flex items-center gap-1 text-muted text-sm mb-6">
        <ChevronLeft size={16} /> Catalogue
      </Link>

      <h2 className="text-3xl text-ink mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        {mezmur.title}
      </h2>
      <p className="text-muted mb-2">
        {mezmur.artist_name ?? 'Unknown artist'} · {mezmur.tune_name ?? 'Unknown tune'}
      </p>
      <DifficultyBar difficulty={mezmur.difficulty} />

      {mezmur.tuning_profile_id && (
        <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-pill bg-background border border-border text-muted text-sm opacity-70">
          <Sparkles size={14} />
          Tune for this mezmur — coming soon
        </div>
      )}

      <div className="flex flex-col gap-8 mt-10">
        {embedUrl && (
          <SectionCard icon={PlayCircle} iconColor="#D9534F" title="Reference video">
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

        <SectionCard icon={Music} iconColor="#F2A93B" title="Learn to play">
          <TapToHearPlayer sequence={mezmur.sequence} />
        </SectionCard>

        {mezmur.lyrics && (
          <SectionCard icon={AlignLeft} iconColor="#1FAE7A" title="Lyrics">
            <p className="text-ink whitespace-pre-line leading-relaxed">{mezmur.lyrics}</p>
          </SectionCard>
        )}
      </div>
    </Layout>
  );
}