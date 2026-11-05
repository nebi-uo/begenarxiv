import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Square,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import LyricsViewer from '../components/LyricsViewer';
import ArtistSelector from '../components/ArtistSelector';
import { insertRepeatTagAtCursor } from '../utils/lyrics';
import {
  parseRawNotation,
  insertNotationTokenAtCursor,
  type ParsedNotationToken,
  type ParsedNotationLine,
} from '../utils/notation';
import { api } from '../api/client';
import { useTonePlayer, type BegenaTuneMode } from '../hooks/useTonePlayer';

export default function ContributePage() {
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tune, setTune] = useState<BegenaTuneMode>('Tizita');
  const [difficulty, setDifficulty] = useState<'practice' | 'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [rawNotation, setRawNotation] = useState('');
  const lyricsTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInsertRepeat = (tag: string) => {
    const el = lyricsTextareaRef.current;
    if (!el) {
      setLyrics((prev) => (prev ? `${prev} ${tag}` : tag));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const { text: newText, nextCursor } = insertRepeatTagAtCursor(lyrics, tag, start, end);
    setLyrics(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
    }, 0);
  };

  const handleInsertRepeatSection = (tag: string) => {
    const el = lyricsTextareaRef.current;
    if (!el) {
      setLyrics((prev) => (prev ? `${prev} [words]${tag}` : `[words]${tag}`));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const { text: newText, nextCursor } = insertRepeatTagAtCursor(lyrics, tag, start, end, true);
    setLyrics(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
    }, 0);
  };

  const notationTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInsertNotation = (token: string) => {
    const el = notationTextareaRef.current;
    if (!el) {
      setRawNotation((prev) => (prev ? `${prev} ${token}` : token));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const { text: newText, nextCursor } = insertNotationTokenAtCursor(rawNotation, token, start, end);
    setRawNotation(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
    }, 0);
  };

  // Audio preview player
  const { pluckString } = useTonePlayer(tune);
  const [playingTokenKey, setPlayingTokenKey] = useState<string | null>(null);
  const [isAuditioning, setIsAuditioning] = useState(false);
  const auditionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopAuditionRef = useRef(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (auditionTimeoutRef.current) clearTimeout(auditionTimeoutRef.current);
    };
  }, []);

  // Parse raw notation into structured lines and tokens
  const parsedLines: ParsedNotationLine[] = useMemo(() => {
    return parseRawNotation(rawNotation);
  }, [rawNotation]);

  const totalTokens = useMemo(() => {
    return parsedLines.reduce((acc, l) => acc + l.tokens.length, 0);
  }, [parsedLines]);

  const hasInvalidTokens = useMemo(() => {
    return parsedLines.some((l) => l.tokens.some((t) => !t.isValid));
  }, [parsedLines]);

  const stopAudition = useCallback(() => {
    stopAuditionRef.current = true;
    setIsAuditioning(false);
    setPlayingTokenKey(null);
    if (auditionTimeoutRef.current) clearTimeout(auditionTimeoutRef.current);
  }, []);

  const playToken = useCallback(
    (token: ParsedNotationToken, key: string) => {
      if (!token.isValid) return;
      setPlayingTokenKey(key);

      if (token.type === 'phrase_break' || token.type === 'rest') {
        // Silent pause or rest
        setTimeout(() => {
          setPlayingTokenKey((curr) => (curr === key ? null : curr));
        }, Math.min(token.durationMs, 700));
        return;
      }

      if (token.type === 'roll') {
        // Natural 50ms ornament roll
        token.positions.forEach((pos, i) => {
          setTimeout(() => {
            pluckString(pos, 220);
          }, i * 50);
        });
      } else {
        pluckString(token.positions[0], 500);
      }

      setTimeout(() => {
        setPlayingTokenKey((curr) => (curr === key ? null : curr));
      }, token.type === 'roll' ? 250 : 350);
    },
    [pluckString]
  );

  const playFullAudition = useCallback(() => {
    if (parsedLines.length === 0) return;
    stopAuditionRef.current = false;
    setIsAuditioning(true);

    const allItems: { token: ParsedNotationToken; key: string }[] = [];
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

      const nextDelay =
        item.token.type === 'phrase_break'
          ? item.token.durationMs
          : item.token.type === 'rest'
          ? item.token.durationMs
          : item.token.type === 'roll'
          ? 280
          : 480;

      auditionTimeoutRef.current = setTimeout(() => {
        step(idx + 1);
      }, nextDelay);
    };

    step(0);
  }, [parsedLines, playToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError('Please enter a mezmur title.');
      return;
    }
    if (!contributorName.trim()) {
      setSubmitError('Please enter your name for contributor recognition.');
      return;
    }
    if (parsedLines.length === 0) {
      setSubmitError('Please enter at least one line of numbers notation.');
      return;
    }
    if (hasInvalidTokens) {
      setSubmitError('Some notation tokens have invalid numbers. Begena only uses strings 1 through 5.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await api.createMezmur({
        title: title.trim(),
        artist: artist.trim() || 'Traditional',
        tune,
        difficulty,
        youtube_url: youtubeUrl.trim(),
        lyrics: lyrics.trim(),
        raw_notation: rawNotation.trim(),
        contributor_name: contributorName.trim(),
        contributor_email: contributorEmail.trim() || undefined,
        is_admin: false,
        status: 'pending',
      });

      setSubmittedSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit mezmur';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExample = () => {
    setTitle('በገናዬም መጣሁ (Begenayem Metahu)');
    setArtist('Alemu Aga');
    setTune('Tizita');
    setDifficulty('beginner');
    setYoutubeUrl('https://www.youtube.com/watch?v=sample');
    setLyrics('በገናዬም መጣሁ ምስጋና ላቀርብ (x2)\nየሰራዊት ጌታ እግዚአብሔርን ላከብር (x2)');
    setRawNotation('1 3 2 4 | 2 1 3 1\n42 2 - 1 3 1');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-4">
        {/* Breadcrumb Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-black transition-colors"
          >
            <ChevronLeft size={14} /> CATALOGUE
          </Link>
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold border border-zinc-200">
            COMMUNITY SUBMISSION
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 mb-2">
                <Award size={13} className="text-black" />
                <span>BECOME A RECOGNIZED CONTRIBUTOR</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Add a Mezmur
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xl leading-relaxed">
                Transcribe a hymn's lyrics and numbers notation. Your submission will be reviewed and verified by Begenarxiv. Once approved, you'll receive your official Contributor badge and permanent attribution in the archive.
              </p>
            </div>

            <button
              type="button"
              onClick={loadExample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 hover:border-black text-xs font-mono text-zinc-700 hover:text-black transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Sparkles size={12} />
              <span>Load Template</span>
            </button>
          </div>
        </div>

        {submittedSuccess ? (
          <div className="bg-white border border-black rounded-xl p-8 sm:p-10 shadow-sm text-center font-mono">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">
              Your submission is pending approval, thanks for your contribution!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed mb-6 font-sans">
              Our curation team is reviewing the numbers notation and lyrics. Once approved, your mezmur will be published directly into the public catalogue tagged with your Contributor badge, and you will receive your Contributor Certificate.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/catalogue">
                <Button variant="primary" className="text-xs">
                  Browse Catalogue
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedSuccess(false);
                  setTitle('');
                  setYoutubeUrl('');
                  setLyrics('');
                  setRawNotation('');
                }}
                className="px-4 py-2 rounded text-xs font-mono border border-zinc-300 hover:border-black transition-colors cursor-pointer"
              >
                Submit Another Mezmur
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-300 text-black flex items-center gap-2.5 font-mono text-xs">
                <AlertCircle size={16} className="text-black shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Contributor Information */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-zinc-100 flex items-center gap-2">
                <Award size={13} />
                <span>1. Contributor Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                    Your Name (for permanent archive credit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="e.g. Dawit Yohannes"
                    className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                    Your Email (for Contributor certificate badge)
                  </label>
                  <input
                    type="email"
                    value={contributorEmail}
                    onChange={(e) => setContributorEmail(e.target.value)}
                    placeholder="dawit@example.com"
                    className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Hymn Metadata */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-zinc-100">
                2. Hymn Details
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
                    placeholder="e.g. በገናዬም መጣሁ"
                    className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm"
                  />
                </div>

                <ArtistSelector
                  value={artist}
                  onChange={setArtist}
                  label="Artist / Performer Tag"
                  placeholder="e.g. Alemu Aga or Traditional"
                />
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
                    onChange={(e) => setDifficulty(e.target.value as 'practice' | 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-mono text-xs bg-white"
                  >
                    <option value="practice">Practice (Warm-up / Drills)</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                    Reference YouTube Video URL
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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-mono font-medium text-zinc-700">
                    Lyrics (Optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
                    <span className="text-zinc-400 text-[10px] uppercase mr-0.5">Repeat Tag:</span>
                    <button
                      type="button"
                      onClick={() => handleInsertRepeat('(x2)')}
                      className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-semibold"
                      title="Repeat entire verse"
                    >
                      + (x2)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertRepeatSection('(x2)')}
                      className="px-2 py-0.5 rounded bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 transition-colors cursor-pointer text-[10px] font-bold"
                      title="Repeat specific section with underline: highlight words then click, or inserts [words](x2)"
                    >
                      + [Section](x2) Underline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertRepeat('(x3)')}
                      className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-semibold"
                      title="Repeat entire verse (x3)"
                    >
                      + (x3)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertRepeat('(፪ ጊዜ)')}
                      className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-semibold"
                      title="Repeat verse (Ge'ez ፪ ጊዜ)"
                    >
                      + (፪ ጊዜ)
                    </button>
                  </div>
                </div>

                <textarea
                  ref={lyricsTextareaRef}
                  rows={4}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Paste hymn lyrics line by line. Add (x2) or highlight words to repeat sections..."
                  className="w-full px-3 py-2 rounded border border-zinc-300 focus:border-black outline-hidden font-sans text-sm leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1">
                  <span>
                    Add <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">(x2)</code> to repeat a verse, or highlight words and click{' '}
                    <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">+ [Section](x2)</code> to underline &amp; repeat only that part (e.g.{' '}
                    <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">[ምስጋና ላቀርብ](x2)</code>).
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1">
                  <span>
                    Add <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">(x2)</code> or{' '}
                    <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">(፪ ጊዜ)</code> to render repeated verse badges.
                  </span>
                </div>

                {lyrics.trim() && (
                  <div className="mt-3 pt-3 border-t border-zinc-100">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      Live Lyrics Preview:
                    </span>
                    <LyricsViewer lyrics={lyrics} />
                  </div>
                )}
              </div>
            </div>

            {/* Notation Decoder Input */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-black">
                  3. Numbers Notation (Strings, Pauses &amp; Rolls)
                </h2>
                <span className="font-mono text-[11px] text-zinc-500">
                  {totalTokens} TOKENS DETECTED
                </span>
              </div>

              {/* Clear Direction Box */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 font-mono text-xs text-zinc-700 space-y-2">
                <div className="font-bold text-zinc-950 uppercase text-[11px] tracking-wider">
                  Notation Syntax Guide
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-black bg-white px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">1 - 5</span>
                    <span>Single string plucks (e.g. <code className="text-black font-semibold">1 3 2 4 2 1</code>)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-black bg-white px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">42</span>
                    <span>Ornament roll: grouped digits play rapid 50ms thumb/index roll</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-black bg-white px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">|</span>
                    <span><strong>Phrase Pause</strong>: separates consecutively plucked groups with a natural musical breath (e.g. <code className="text-black font-semibold">1 3 2 4 | 2 1 3 1</code>)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-black bg-white px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">-</span>
                    <span><strong>Beat Rest</strong>: silent pause where previous string rings (<code className="text-black font-semibold">-</code> = 1 beat, <code className="text-black font-semibold">--</code> = 2 beats)</span>
                  </div>
                </div>
              </div>

              {/* Quick Insert Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Quick Insert Notation Tokens:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleInsertNotation('|')}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-bold"
                    title="Insert phrase pause (|)"
                  >
                    + | (Phrase Pause)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertNotation('-')}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-bold"
                    title="Insert beat rest (-)"
                  >
                    + - (Beat Rest)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertNotation('42')}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-bold"
                    title="Insert 42 ornament roll"
                  >
                    + 42 (Roll)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertNotation('13')}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-bold"
                    title="Insert 13 ornament roll"
                  >
                    + 13 (Roll)
                  </button>
                </div>
              </div>

              <textarea
                ref={notationTextareaRef}
                rows={5}
                required
                value={rawNotation}
                onChange={(e) => setRawNotation(e.target.value)}
                placeholder={'1 3 2 4 | 2 1 3 1\n42 2 - 1 3 1'}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-black outline-hidden font-mono text-sm tracking-widest leading-loose"
              />

              {hasInvalidTokens && (
                <div className="p-3 bg-zinc-50 border border-zinc-300 rounded font-mono text-xs text-black flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>Warning: One or more tokens have invalid notation. Use 1–5, 42, |, or -.</span>
                </div>
              )}
            </div>

            {/* In-Page Audition Player */}
            {parsedLines.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Volume2 size={15} />
                    <span className="font-bold text-black">
                      AUDITION YOUR TRANSCRIPTION ({tune.toUpperCase()})
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

                        if (tok.type === 'phrase_break') {
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => playToken(tok, key)}
                              className={`px-2 py-1 select-none transition-all cursor-pointer font-bold ${
                                isPlaying ? 'scale-125 text-black' : 'text-zinc-400 hover:text-black'
                              }`}
                              title="Phrase pause (~700ms musical breath)"
                            >
                              <span className="text-base leading-none">|</span>
                            </button>
                          );
                        }

                        if (tok.type === 'rest') {
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => playToken(tok, key)}
                              className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer border border-dashed ${
                                isPlaying
                                  ? 'bg-black text-white border-black scale-105'
                                  : 'border-zinc-300 bg-white text-zinc-500 hover:border-black hover:text-black'
                              }`}
                              title={`Beat rest (${tok.durationMs}ms)`}
                            >
                              <span>— REST</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => playToken(tok, key)}
                            className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                              tok.type === 'roll'
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

            {/* Submit Action Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || parsedLines.length === 0 || hasInvalidTokens}
              className="w-full py-3.5 text-sm font-mono flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting to Curator for Review...' : 'SUBMIT MEZMUR FOR APPROVAL'}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}

