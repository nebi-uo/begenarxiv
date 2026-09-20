import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurDetail } from '../types';
import TapToHearPlayer from '../components/TapToHearPlayer';
import Button from '../components/Button';
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
      <Link to="/" className="inline-flex items-center gap-1 text-muted text-sm mb-5">
        <ChevronLeft size={16} /> Catalogue
      </Link>

      <h2 className="text-3xl text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        {mezmur.title}
      </h2>
      <p className="text-muted mb-4">
        {mezmur.artist_name ?? 'Unknown artist'} · {mezmur.tune_name ?? 'Unknown tune'}
      </p>

      {mezmur.tuning_profile_id && (
        <div className="mb-8">
          <Button variant="secondary">Tune for this mezmur</Button>
        </div>
      )}

      <div className="space-y-8">
        <section>
          <p className="text-xs text-muted uppercase tracking-wide mb-3">Learn to play</p>
          <TapToHearPlayer sequence={mezmur.sequence} />
        </section>

        {embedUrl && (
          <section>
            <p className="text-xs text-muted uppercase tracking-wide mb-3">Reference video</p>
            <div className="aspect-video rounded-card overflow-hidden">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {mezmur.lyrics && (
          <section>
            <p className="text-xs text-muted uppercase tracking-wide mb-3">Lyrics</p>
            <p className="text-ink whitespace-pre-line leading-relaxed">{mezmur.lyrics}</p>
          </section>
        )}
      </div>
    </Layout>
  );
}