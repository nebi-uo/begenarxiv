import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { MezmurDetail } from '../types';
import TapToHearPlayer from '../components/TapToHearPlayer';

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

  if (loading) return <div className="min-h-screen bg-background p-6 text-muted">Loading…</div>;
  if (error) return <div className="min-h-screen bg-background p-6 text-red-600">{error}</div>;
  if (!mezmur) return null;

  const embedUrl = mezmur.youtube_url ? getYoutubeEmbedUrl(mezmur.youtube_url) : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <Link to="/" className="text-muted text-sm mb-4 inline-block">← Back to catalogue</Link>

      <h1 className="text-2xl font-semibold text-ink mb-1">{mezmur.title}</h1>
      <p className="text-muted mb-6">
        {mezmur.artist_name ?? 'Unknown artist'} · {mezmur.tune_name ?? 'Unknown tune'}
      </p>

      {mezmur.tuning_profile_id && (
        <Link
          to={`/tuner/${mezmur.tuning_profile_id}`}
          className="inline-block bg-ink text-white text-sm px-5 py-2 rounded-pill mb-6"
        >
          Tune for this mezmur
        </Link>
      )}

      <div className="bg-card rounded-card p-5 shadow-sm mb-6">
        <h2 className="text-ink font-medium mb-3">Learn to play</h2>
        <TapToHearPlayer sequence={mezmur.sequence} />
      </div>

      {embedUrl && (
        <div className="bg-card rounded-card p-5 shadow-sm mb-6">
          <h2 className="text-ink font-medium mb-3">Reference video</h2>
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
        <div className="bg-card rounded-card p-5 shadow-sm">
          <h2 className="text-ink font-medium mb-3">Lyrics</h2>
          <p className="text-ink whitespace-pre-line leading-relaxed">{mezmur.lyrics}</p>
        </div>
      )}
    </div>
  );
}