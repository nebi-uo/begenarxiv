import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { MezmurDetail } from '../types';
import TapToHearPlayer from '../components/TapToHearPlayer';
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
    api
      .getMezmurById(id)
      .then(setMezmur)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p className="text-muted">Loading…</p></Layout>;
  if (error) return <Layout><p className="text-red-600">{error}</p></Layout>;
  if (!mezmur) return null;

  const embedUrl = mezmur.youtube_url ? getYoutubeEmbedUrl(mezmur.youtube_url) : null;

  return (
    <Layout>
      <Link to="/" className="text-muted text-sm">← Catalogue</Link>

      <h2 className="text-2xl text-ink mt-3 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        {mezmur.title}
      </h2>
      <p className="text-muted mb-6">
        {mezmur.artist_name ?? 'Unknown artist'} · {mezmur.tune_name ?? 'Unknown tune'}
      </p>

      <div className="bg-card rounded-card p-5 shadow-sm mb-5 border border-border">
        <h3 className="text-ink font-medium mb-3">Sound Preview</h3>
        <TapToHearPlayer sequence={mezmur.sequence} />
      </div>

      {embedUrl && (
        <div className="bg-card rounded-card p-5 shadow-sm mb-5 border border-border">
          <h3 className="text-ink font-medium mb-3">Reference video</h3>
          <div className="aspect-video rounded-card overflow-hidden">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {mezmur.lyrics && (
        <div className="bg-card rounded-card p-5 shadow-sm border border-border">
          <h3 className="text-ink font-medium mb-3">Lyrics</h3>
          <p className="text-ink whitespace-pre-line leading-relaxed">{mezmur.lyrics}</p>
        </div>
      )}
    </Layout>
  );
}