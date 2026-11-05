import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import ArtistSelector from '../components/ArtistSelector';
import { api } from '../api/client';
import type { MezmurRequest } from '../types';

export default function RequestPage() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Existing requests
  const [requests, setRequests] = useState<MezmurRequest[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    setLoadingList(true);
    api.getRequests()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a hymn title.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createRequest({
        title: title.trim(),
        artist: artist.trim() || undefined,
        youtube_url: youtubeUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        requester_name: requesterName.trim() || undefined,
        requester_email: requesterEmail.trim() || undefined,
      });

      setSubmittedSuccess(true);
      setTitle('');
      setArtist('');
      setYoutubeUrl('');
      setNotes('');
      // Refresh list
      api.getRequests().then(setRequests).catch(() => {});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit request';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-4">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-black transition-colors"
          >
            <ChevronLeft size={14} /> CATALOGUE
          </Link>
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold border border-zinc-200">
            DECODE REQUESTS
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-6 shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black mb-2">
            Request a Mezmur
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-xl leading-relaxed">
            Can't find a hymn in the archive? Submit a request with a reference YouTube link. Our curation team will decode the numbers notation and publish it to the repertoire.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="bg-white border border-black rounded-xl p-8 sm:p-10 shadow-sm text-center font-mono mb-8">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">
              Request Added to Queue!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed mb-6 font-sans">
              Thank you for helping grow the archive. We will review the recording, decode the notation, and notify you when it's live.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubmittedSuccess(false)}
                className="px-4 py-2 rounded text-xs font-mono border border-zinc-300 hover:border-black transition-colors cursor-pointer"
              >
                Request Another Mezmur
              </button>
              <Link to="/catalogue">
                <Button variant="primary" className="text-xs">
                  Browse Repertoire
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4 mb-8">
            {error && (
              <div className="p-3 bg-zinc-100 rounded text-xs font-mono text-black border border-zinc-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                Mezmur Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. በገናዬም መጣሁ (Begenayem Metahu)"
                className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ArtistSelector
                value={artist}
                onChange={setArtist}
                label="Artist / Performer Tag"
                placeholder="e.g. Alemu Aga or Traditional"
              />

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                  Reference YouTube Video Link
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="e.g. Yohannes"
                  className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                  Your Email (for notification when live)
                </label>
                <input
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  placeholder="yohannes@example.com"
                  className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                Notes / Verses / Comments
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific recording or part of the hymn you want transcribed..."
                className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-3 text-xs font-mono mt-2"
            >
              {isSubmitting ? 'Submitting...' : 'SUBMIT DECODE REQUEST'}
            </Button>
          </form>
        )}

        {/* Existing Community Requests Queue Preview */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs font-mono">
          <div className="flex items-center justify-between pb-2 mb-4 border-b border-zinc-100 text-xs">
            <span className="font-bold text-black uppercase">
              Community Decode Queue ({requests.length})
            </span>
            <span className="text-zinc-500 text-[11px]">
              {loadingList ? 'Loading...' : 'Pending Curation'}
            </span>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              No requests currently in queue. Be the first to request a hymn!
            </p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {requests.slice(0, 8).map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-zinc-950 flex items-center gap-2">
                      <span>{req.title}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded ${
                          req.status === 'completed'
                            ? 'bg-zinc-100 text-zinc-500 line-through'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    {req.artist && <span className="text-zinc-500 text-[11px]">{req.artist}</span>}
                  </div>

                  {req.youtube_url && (
                    <a
                      href={req.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-black shrink-0"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

