import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, PlayCircle, Music, AlignLeft, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import type { MezmurDetail } from '../types';
import TapToHearPlayer from '../components/TapToHearPlayer';
import DifficultyBar from '../components/DifficultyBar';
import SectionCard from '../components/SectionCard';
import Layout from '../components/Layout';
import { Users, Repeat2 } from 'lucide-react';
import MezmurRow from '../components/MezmurRow';
import type { MezmurListItem } from '../types';
import { useNavigate } from 'react-router-dom';

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function MezmurPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
    if (mezmur.artist_id) {
      api.getMezmursByArtist(mezmur.artist_id, mezmur.id).then(setMoreFromArtist).catch(() => {});
    }
    if (mezmur.tune_id) {
      api.getMezmursByTune(mezmur.tune_id, mezmur.id).then(setMoreInTune).catch(() => {});
    }
  }, [mezmur]);

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

        {moreFromArtist.length > 0 && (
          <SectionCard icon={Users} iconColor="#4F86C6" title={`More from ${mezmur.artist_name}`}>
            <div className="flex flex-col gap-3">
              {moreFromArtist.map((m, i) => (
                <MezmurRow key={m.id} mezmur={m} index={i} onClick={() => navigate(`/mezmur/${m.id}`)} />
              ))}
            </div>
          </SectionCard>
        )}

        {moreInTune.length > 0 && (
          <SectionCard icon={Repeat2} iconColor="#8A6FD4" title={`More in ${mezmur.tune_name}`}>
            <div className="flex flex-col gap-3">
              {moreInTune.map((m, i) => (
                <MezmurRow key={m.id} mezmur={m} index={i} onClick={() => navigate(`/mezmur/${m.id}`)} />
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </Layout>
  );
}