import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Play,
  Square,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { api } from '../api/client';
import { useTonePlayer, type BegenaTuneMode } from '../hooks/useTonePlayer';
import type { MezmurRequest } from '../types';

interface ParsedToken {
  text: string;
  isRoll: boolean;
  isValid: boolean;
  positions: number[];
}

interface ParsedLine {
  lineNumber: number;
  tokens: ParsedToken[];
}

export default function PortalPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active tab: 'decode' | 'requests' | 'request-form'
  const [activeTab, setActiveTab] = useState<'decode' | 'requests' | 'request-form'>(
    (searchParams.get('tab') as 'decode' | 'requests' | 'request-form') || 'decode'
  );

  // Form states for decoding / publishing
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tune, setTune] = useState<BegenaTuneMode>('Tizita');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [rawNotation, setRawNotation] = useState('');

  // Audio preview player states
  const { pluckString } = useTonePlayer(tune);
  const [playingTokenKey, setPlayingTokenKey] = useState<string | null>(null);
  const [isAuditioning, setIsAuditioning] = useState(false);
  const auditionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopAuditionRef = useRef(false);

  // Submission / Loading / Error states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<{ mezmurId: number; title: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Requests queue states
  const [requests, setRequests] = useState<MezmurRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [linkedRequestId, setLinkedRequestId] = useState<number | null>(null);

  // New Request Form states
  const [reqTitle, setReqTitle] = useState('');
  const [reqArtist, setReqArtist] = useState('');
  const [reqYoutube, setReqYoutube] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [reqSuccess, setReqSuccess] = useState(false);
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Fetch requests on mount or tab change
  const fetchRequests = useCallback(() => {
    setLoadingRequests(true);
    api.getRequests()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (auditionTimeoutRef.current) clearTimeout(auditionTimeoutRef.current);
    };
  }, []);

  // Parse raw notation into structured lines and tokens in real time
  const parsedLines: ParsedLine[] = useMemo(() => {
    if (!rawNotation.trim()) return [];
    const lines = rawNotation.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    return lines.map((lineStr, lineIdx) => {
      const rawTokens = lineStr.split(/[\s,]+/).filter(Boolean);
      const tokens: ParsedToken[] = rawTokens.map((tok) => {
        const digits = tok.split('').map((d) => parseInt(d, 10));
        const isValid = digits.length > 0 && digits.every((d) => d >= 1 && d <= 5);
        return {
          text: tok,
          isRoll: tok.length > 1,
          isValid,
          positions: digits,
        };
      });
      return {
        lineNumber: lineIdx + 1,
        tokens,
      };
    });
  }, [rawNotation]);

  const totalTokens = useMemo(() => {
    return parsedLines.reduce((acc, l) => acc + l.tokens.length, 0);
  }, [parsedLines]);

  const hasInvalidTokens = useMemo(() => {
    return parsedLines.some((l) => l.tokens.some((t) => !t.isValid));
  }, [parsedLines]);

  // Stop current audition
  const stopAudition = useCallback(() => {
    stopAuditionRef.current = true;
    setIsAuditioning(false);
    setPlayingTokenKey(null);
    if (auditionTimeoutRef.current) clearTimeout(auditionTimeoutRef.current);
  }, []);

  // Play a single parsed token (solo pluck or fast 35ms roll)
  const playToken = useCallback(
    (token: ParsedToken, key: string) => {
      if (!token.isValid) return;
      setPlayingTokenKey(key);

      if (token.isRoll) {
        // Fast 35ms ornament roll
        token.positions.forEach((pos, i) => {
          setTimeout(() => {
            pluckString(pos, 220);
          }, i * 35);
        });
      } else {
        pluckString(token.positions[0], 500);
      }

      setTimeout(() => {
        setPlayingTokenKey((curr) => (curr === key ? null : curr));
      }, token.isRoll ? 250 : 350);
    },
    [pluckString]
  );

  // Audition the full sequence continuously in real-time
  const playFullAudition = useCallback(() => {
    if (parsedLines.length === 0) return;
    stopAuditionRef.current = false;
    setIsAuditioning(true);

    const allItems: { token: ParsedToken; key: string }[] = [];
    parsedLines.forEach((line) => {
      line.tokens.forEach((tok, tIdx) => {
        allItems.push({ token: tok, key: `${line.lineNumber}-${tIdx}` });
      });
    });

    const step = (idx: number) => {
      if (stopAuditionRef.current || idx >= allItems.length) {
        setIsAuditioning(false);
        setPlayingTokenKey(null);
        return;
      }

      const item = allItems[idx];
      playToken(item.token, item.key);

      const nextDelay = item.token.isRoll ? 280 : 480;
      auditionTimeoutRef.current = setTimeout(() => {
        step(idx + 1);
      }, nextDelay);
    };

    step(0);
  }, [parsedLines, playToken]);

  // Handle publishing to database
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setPublishError('Please enter a mezmur title.');
      return;
    }
    if (parsedLines.length === 0) {
      setPublishError('Please enter at least one line of numbers notation.');
      return;
    }
    if (hasInvalidTokens) {
      setPublishError('Some tokens contain invalid numbers. Begena only uses strings 1 through 5.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const res = await api.createMezmur({
        title: title.trim(),
        artist: artist.trim() || 'Traditional',
        tune,
        difficulty,
        youtube_url: youtubeUrl.trim(),
        lyrics: lyrics.trim(),
        raw_notation: rawNotation.trim(),
      });

      setPublishSuccess({ mezmurId: res.mezmurId, title: res.title });

      // If this was linked to a request, mark it completed
      if (linkedRequestId) {
        await api.updateRequestStatus(linkedRequestId, 'completed').catch(() => {});
        setLinkedRequestId(null);
        fetchRequests();
      }

      // Reset notation and title
      setTitle('');
      setYoutubeUrl('');
      setLyrics('');
      setRawNotation('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish mezmur';
      setPublishError(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  // Pre-fill decoder from request
  const handleLoadRequest = (req: MezmurRequest) => {
    setTitle(req.title);
    setArtist(req.artist || '');
    setYoutubeUrl(req.youtube_url || '');
    setLyrics(req.notes || '');
    setLinkedRequestId(req.id);
    setActiveTab('decode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit request form
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;

    setReqSubmitting(true);
    try {
      await api.createRequest({
        title: reqTitle.trim(),
        artist: reqArtist.trim() || undefined,
        youtube_url: reqYoutube.trim() || undefined,
        notes: reqNotes.trim() || undefined,
      });

      setReqSuccess(true);
      setReqTitle('');
      setReqArtist('');
      setReqYoutube('');
      setReqNotes('');
      fetchRequests();
    } catch (e) {
      console.error(e);
    } finally {
      setReqSubmitting(false);
    }
  };

  const loadSampleHymn = () => {
    setTitle('በገናዬም መጣሁ (Begenayem Metahu)');
    setArtist('Alemu Aga');
    setTune('Tizita');
    setDifficulty('beginner');
    setYoutubeUrl('https://www.youtube.com/watch?v=sample');
    setLyrics('በገናዬም መጣሁ ምስጋና ላቀርብ\nየሰራዊት ጌታ እግዚአብሔርን ላከብር\nበገናዬም መጣሁ...');
    setRawNotation('1 3 2 4 2 1\n42 2 1 3 1\n1 3 2 4 2 1\n13 3 1');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        {/* Breadcrumb / Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-black transition-colors"
          >
            <ChevronLeft size={14} /> BACK TO CATALOGUE
          </Link>
          <span className="font-mono text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded font-bold">
            ADMIN PORTAL
          </span>
        </div>

        {/* Portal Header */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Population Portal
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-mono mt-1">
                Fast mezmur decoder studio, live notation audition, and request queue.
              </p>
            </div>

            {/* Quick Sample Button */}
            <button
              onClick={loadSampleHymn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 hover:border-black text-xs font-mono text-zinc-700 hover:text-black transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={13} />
              <span>Load Template</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-100 font-mono text-xs">
            <button
              onClick={() => setActiveTab('decode')}
              className={`px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'decode'
                  ? 'bg-black text-white font-bold'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              DECODE &amp; PUBLISH
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-black text-white font-bold'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              <span>DECODE REQUESTS</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 text-zinc-800 text-[10px] font-bold">
                {requests.filter((r) => r.status === 'pending').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('request-form')}
              className={`px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'request-form'
                  ? 'bg-black text-white font-bold'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              SUBMIT REQUEST
            </button>
          </div>
        </div>

        {/* TAB 1: DECODE & PUBLISH */}
        {activeTab === 'decode' && (
          <form onSubmit={handlePublish} className="space-y-6">
            {/* Success Message Banner */}
            {publishSuccess && (
              <div className="p-4 rounded-xl bg-zinc-950 text-white flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-white" />
                  <span>
                    Successfully published <strong>"{publishSuccess.title}"</strong> to the catalogue!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/mezmur/${publishSuccess.mezmurId}`)}
                  className="inline-flex items-center gap-1 bg-white text-black px-3 py-1 rounded font-bold hover:bg-zinc-200 cursor-pointer"
                >
                  <span>VIEW HYMN</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}

            {/* Error Message Banner */}
            {publishError && (
              <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-black flex items-center gap-2.5 font-mono text-xs">
                <AlertCircle size={18} className="text-black shrink-0" />
                <span>{publishError}</span>
              </div>
            )}

            {linkedRequestId && (
              <div className="p-3 bg-zinc-100 rounded-lg border border-zinc-300 flex items-center justify-between font-mono text-xs">
                <span>Linked to Decode Request #{linkedRequestId}</span>
                <button
                  type="button"
                  onClick={() => setLinkedRequestId(null)}
                  className="text-zinc-500 hover:text-black text-[11px]"
                >
                  Unlink
                </button>
              </div>
            )}

            {/* Step 1: Hymn Metadata Block */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
                1. Hymn Metadata
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                    Hymn Title *
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

                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                    Artist / Performer
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Alemu Aga or Traditional"
                    className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                    Tuning Mode (Qenet)
                  </label>
                  <select
                    value={tune}
                    onChange={(e) => setTune(e.target.value as BegenaTuneMode)}
                    className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-mono text-xs bg-white"
                  >
                    <option value="Tizita">Tizita (1=E, 2=C, 3=D, 4=A, 5=G)</option>
                    <option value="Selamta">Selamta (1=F, 2=C, 3=D, 4=A, 5=G)</option>
                    <option value="Anchi-Hoye">Anchi-Hoye (1=F, 2=C, 3=C#, 4=A, 5=F#)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-mono text-xs bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                    Reference YouTube URL
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

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                  Liturgical Lyrics (Optional)
                </label>
                <textarea
                  rows={3}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Paste hymn lyrics line by line..."
                  className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* Step 2: Raw Numbers Notation Input */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                  2. Fast Notation Input (Type / Paste Space-Separated Numbers)
                </h2>
                <span className="font-mono text-[11px] text-zinc-500">
                  {totalTokens} TOKENS DETECTED
                </span>
              </div>

              <p className="text-xs text-zinc-500 font-mono">
                Type numbers separated by spaces. Each line in the textarea creates one musical phrase.
                Grouped digits (like <code className="bg-zinc-100 px-1 py-0.5 rounded font-bold text-black">42</code>)
                become fast 35ms ornament rolls. Active Begena strings: <strong>1, 2, 3, 4, 5</strong>.
              </p>

              <textarea
                rows={5}
                required
                value={rawNotation}
                onChange={(e) => setRawNotation(e.target.value)}
                placeholder={'1 3 2 4 2 1\n42 2 1 3 1\n1 3 2 4 2 1'}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-black outline-hidden font-mono text-sm tracking-widest leading-loose"
              />

              {hasInvalidTokens && (
                <div className="p-3 bg-zinc-50 border border-zinc-300 rounded font-mono text-xs text-black flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>Warning: One or more tokens have invalid digits outside 1–5.</span>
                </div>
              )}
            </div>

            {/* Step 3: Interactive Real-Time Audition Player */}
            {parsedLines.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Volume2 size={15} />
                    <span className="font-bold text-black">
                      3. LIVE NOTATION AUDITION ({tune.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAuditioning ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={stopAudition}
                        className="text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Square size={12} className="fill-current" />
                        <span>Stop Audition</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={playFullAudition}
                        className="text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Play Full Audition</span>
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-mono text-zinc-500">
                  Tap any number below to audition its sound. Dashed borders indicate fast two-string rolls.
                </p>

                {/* Parsed Visual Grid */}
                <div className="space-y-3 font-mono">
                  {parsedLines.map((line) => (
                    <div
                      key={line.lineNumber}
                      className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 flex flex-wrap items-center gap-2"
                    >
                      <span className="text-[10px] text-zinc-400 font-bold mr-2">
                        L{line.lineNumber}:
                      </span>

                      {line.tokens.map((tok, tIdx) => {
                        const key = `${line.lineNumber}-${tIdx}`;
                        const isPlaying = playingTokenKey === key;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => playToken(tok, key)}
                            className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                              tok.isRoll
                                ? 'border border-dashed border-zinc-400'
                                : 'border border-zinc-200 bg-white'
                            } ${
                              isPlaying
                                ? 'bg-black text-white border-black scale-105'
                                : tok.isValid
                                ? 'text-black hover:border-black'
                                : 'bg-red-50 text-red-600 border-red-300'
                            }`}
                            title={`Tap to hear ${tok.text}`}
                          >
                            {tok.text}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isPublishing || parsedLines.length === 0 || hasInvalidTokens}
                className="w-full py-3.5 text-sm font-mono flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <span>Publishing to Database...</span>
                ) : (
                  <>
                    <span>PUBLISH MEZMUR TO ARCHIVE</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: DECODE REQUESTS QUEUE */}
        {activeTab === 'requests' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 font-mono text-xs">
              <span className="font-bold text-black uppercase">
                Incoming Mezmur Requests ({requests.length})
              </span>
              <button
                onClick={fetchRequests}
                disabled={loadingRequests}
                className="text-zinc-500 hover:text-black cursor-pointer text-xs"
              >
                {loadingRequests ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-zinc-500">
                No decode requests in the queue yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 font-mono">
                {requests.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-black">{req.title}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            req.status === 'completed'
                              ? 'bg-zinc-100 text-zinc-500 line-through'
                              : 'bg-black text-white'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500">
                        {req.artist ? `Artist: ${req.artist} · ` : ''}
                        Submitted {new Date(req.created_at).toLocaleDateString()}
                      </p>

                      {req.notes && (
                        <p className="text-xs text-zinc-600 mt-1 max-w-lg font-sans">
                          {req.notes}
                        </p>
                      )}

                      {req.youtube_url && (
                        <a
                          href={req.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-600 hover:text-black underline mt-1"
                        >
                          <span>Watch Reference Video</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => handleLoadRequest(req)}
                        className="text-xs py-1.5 px-3"
                      >
                        Decode This
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUBMIT REQUEST */}
        {activeTab === 'request-form' && (
          <form onSubmit={handleSubmitRequest} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-zinc-100">
              Request a Mezmur for Decoding
            </h2>

            {reqSuccess && (
              <div className="p-3 bg-zinc-950 text-white rounded font-mono text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Your mezmur decode request has been added to the queue!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                Mezmur Title *
              </label>
              <input
                type="text"
                required
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                placeholder="e.g. በገናዬም መጣሁ"
                className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={reqArtist}
                  onChange={(e) => setReqArtist(e.target.value)}
                  placeholder="e.g. Alemu Aga"
                  className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                  YouTube Reference Link
                </label>
                <input
                  type="url"
                  value={reqYoutube}
                  onChange={(e) => setReqYoutube(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                Notes / Requested Verses / Lyrics snippet
              </label>
              <textarea
                rows={3}
                value={reqNotes}
                onChange={(e) => setReqNotes(e.target.value)}
                placeholder="Any details or parts of the song you want decoded..."
                className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden text-sm"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={reqSubmitting}
              className="w-full py-2.5 text-xs font-mono mt-2"
            >
              {reqSubmitting ? 'Submitting Request...' : 'Submit Request to Queue'}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}

