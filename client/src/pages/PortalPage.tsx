import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Award,
  Check,
  X,
  Trash2,
  Edit3,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Lock,
  Key,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import LyricsViewer from '../components/LyricsViewer';
import ArtistSelector from '../components/ArtistSelector';
import {
  DashboardTableSkeleton,
  PendingReviewsSkeleton,
  RequestsSkeleton,
} from '../components/Skeletons';
import { insertRepeatTagAtCursor } from '../utils/lyrics';
import {
  parseRawNotation,
  insertNotationTokenAtCursor,
  insertNotationRepeatAtCursor,
  expandLineTokensForPlayback,
  type ParsedNotationToken,
  type ParsedNotationLine,
} from '../utils/notation';
import { api, authStorage } from '../api/client';
import { useTonePlayer, type BegenaTuneMode } from '../hooks/useTonePlayer';
import type { MezmurRequest, PendingMezmur, AdminMezmurItem } from '../types';

export default function PortalPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active tab: 'dashboard' | 'decode' | 'pending' | 'requests'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'decode' | 'pending' | 'requests'>(
    (searchParams.get('tab') as 'dashboard' | 'decode' | 'pending' | 'requests') || 'dashboard'
  );

  // Security & Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form states for decoding / publishing
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tune, setTune] = useState<BegenaTuneMode>('Tizita');
  const [difficulty, setDifficulty] = useState<'practice' | 'beginner' | 'intermediate' | 'advanced'>('practice');
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

  const handleInsertNotationRepeat = (tag: string, isSection = false) => {
    const el = notationTextareaRef.current;
    if (!el) {
      setRawNotation((prev) => (prev ? `${prev} ${isSection ? `[notes]${tag}` : tag}` : (isSection ? `[notes]${tag}` : tag)));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const { text: newText, nextCursor } = insertNotationRepeatAtCursor(rawNotation, tag, start, end, isSection);
    setRawNotation(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
    }, 0);
  };

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

  // Community Pending Submissions (Admin Review)
  const [pendingMezmurs, setPendingMezmurs] = useState<PendingMezmur[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // Catalogue Dashboard state
  const [adminMezmurs, setAdminMezmurs] = useState<AdminMezmurItem[]>([]);
  const [loadingAdminMezmurs, setLoadingAdminMezmurs] = useState(false);
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const [catalogueStatusFilter, setCatalogueStatusFilter] = useState<string>('approved');
  const [catalogueDifficultyFilter, setCatalogueDifficultyFilter] = useState<string>('all');
  const [editingMezmurId, setEditingMezmurId] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Smooth scroll to top when feedback or messages appear
  useEffect(() => {
    if (publishSuccess || publishError || reviewFeedback || actionFeedback) {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }, [publishSuccess, publishError, reviewFeedback, actionFeedback]);

  // Smooth scroll to top on tab switch
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  const fetchAdminMezmurs = useCallback(() => {
    setLoadingAdminMezmurs(true);
    api.getAllMezmursAdmin()
      .then(setAdminMezmurs)
      .catch(() => {})
      .finally(() => setLoadingAdminMezmurs(false));
  }, []);

  const fetchRequests = useCallback(() => {
    setLoadingRequests(true);
    api.getRequests()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, []);

  const fetchPending = useCallback(() => {
    setLoadingPending(true);
    api.getPendingMezmurs()
      .then(setPendingMezmurs)
      .catch(() => {})
      .finally(() => setLoadingPending(false));
  }, []);

  // Check existing curator session on mount (seamless background check)
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    api.verifyAdmin()
      .then((res) => {
        if (res.valid) {
          setIsAuthenticated(true);
        } else {
          authStorage.removeToken();
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        authStorage.removeToken();
        setIsAuthenticated(false);
      });
  }, []);

  // Listen for session expiry event from API client
  useEffect(() => {
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setLoginError('Your curator session expired or was revoked. Please authenticate again.');
    };
    window.addEventListener('begenarxiv:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('begenarxiv:auth-expired', handleAuthExpired);
  }, []);

  // Fetch admin datasets only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminMezmurs();
      fetchRequests();
      fetchPending();
    }
  }, [isAuthenticated, fetchAdminMezmurs, fetchRequests, fetchPending]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await api.loginAdmin(passwordInput.trim());
      if (res.success && res.token) {
        authStorage.setToken(res.token);
        setIsAuthenticated(true);
        setPasswordInput('');
        setLoginError(null);
      } else {
        setLoginError('Invalid curator password.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid administrator password';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
        setLoginError('Unable to connect to backend server (http://localhost:4000). Please check if server is running.');
      } else {
        setLoginError(msg);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await api.logoutAdmin();
    setIsAuthenticated(false);
    setPasswordInput('');
    setLoginError(null);
  };

  const handleDeleteMezmur = async (id: number, hymnTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${hymnTitle}" from the archive?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteMezmur(id);
      setActionFeedback(`Deleted "${hymnTitle}" successfully.`);
      fetchAdminMezmurs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete mezmur';
      setActionFeedback(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = async (id: number) => {
    try {
      const mezmur = await api.getMezmurById(String(id), true);
      setTitle(mezmur.title);
      setArtist(mezmur.artist_name || 'Traditional');
      if (mezmur.tune_name?.includes('Selamta')) setTune('Selamta');
      else if (mezmur.tune_name?.includes('Anchi')) setTune('Anchi-Hoye');
      else setTune('Tizita');
      setDifficulty(mezmur.difficulty || 'beginner');
      setYoutubeUrl(mezmur.youtube_url || '');
      setLyrics(mezmur.lyrics || '');

      if (mezmur.raw_notation) {
        setRawNotation(mezmur.raw_notation);
      } else {
        // Reconstruct raw_notation from sequence steps fallback
        const lineMap = new Map<number, string[]>();
        mezmur.sequence.forEach((s) => {
          const tokens = lineMap.get(s.line_number) || [];
          if (s.phrase_break) {
            tokens.push('|');
          } else if (s.is_rest) {
            tokens.push('-');
          } else if (s.group_id) {
            if (tokens.length > 0 && /^[1-5]+$/.test(tokens[tokens.length - 1])) {
              tokens[tokens.length - 1] += String(s.string_position);
            } else {
              tokens.push(String(s.string_position));
            }
          } else {
            tokens.push(String(s.string_position));
          }
          lineMap.set(s.line_number, tokens);
        });

        const notationStr = Array.from(lineMap.values())
          .map((toks) => toks.join(' '))
          .join('\n');
        setRawNotation(notationStr);
      }

      setEditingMezmurId(id);
      setPublishSuccess(null);
      setPublishError(null);
      setActiveTab('decode');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load mezmur for editing';
      setActionFeedback(msg);
    }
  };

  const handleCancelEdit = () => {
    setEditingMezmurId(null);
    setTitle('');
    setArtist('');
    setYoutubeUrl('');
    setLyrics('');
    setRawNotation('');
  };

  const filteredAdminMezmurs = useMemo(() => {
    const q = catalogueQuery.trim().toLowerCase();
    return adminMezmurs.filter((m) => {
      const matchesQ =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.artist_name?.toLowerCase().includes(q) ||
        m.tune_name?.toLowerCase().includes(q) ||
        m.contributor_name?.toLowerCase().includes(q);

      const matchesStatus =
        catalogueStatusFilter === 'all' || m.status === catalogueStatusFilter;

      const matchesDifficulty =
        catalogueDifficultyFilter === 'all' || m.difficulty === catalogueDifficultyFilter;

      return matchesQ && matchesStatus && matchesDifficulty;
    });
  }, [adminMezmurs, catalogueQuery, catalogueStatusFilter, catalogueDifficultyFilter]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (auditionTimeoutRef.current) clearTimeout(auditionTimeoutRef.current);
    };
  }, []);

  // Parse raw notation into structured lines and tokens in real time
  const parsedLines: ParsedNotationLine[] = useMemo(() => {
    return parseRawNotation(rawNotation);
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

  // Play a single parsed token (solo pluck, natural 50ms roll, phrase pause, or rest)
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

  // Audition the full sequence continuously in real-time
  const playFullAudition = useCallback(() => {
    if (parsedLines.length === 0) return;
    stopAuditionRef.current = false;
    setIsAuditioning(true);

    const allItems: { token: ParsedNotationToken; key: string }[] = [];
    parsedLines.forEach((line) => {
      const expanded = expandLineTokensForPlayback(line);
      expanded.forEach((tok, expIdx) => {
        const origIdx = line.tokens.indexOf(tok);
        allItems.push({ token: tok, key: `${line.lineNumber}-${origIdx >= 0 ? origIdx : expIdx}` });
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

  // Admin Direct Publish
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
      if (editingMezmurId) {
        await api.updateMezmur(editingMezmurId, {
          title: title.trim(),
          artist: artist.trim() || 'Traditional',
          tune,
          difficulty,
          youtube_url: youtubeUrl.trim(),
          lyrics: lyrics.trim(),
          raw_notation: rawNotation.trim(),
        });

        setPublishSuccess({ mezmurId: editingMezmurId, title: title.trim() });
        setEditingMezmurId(null);
      } else {
        const res = await api.createMezmur({
          title: title.trim(),
          artist: artist.trim() || 'Traditional',
          tune,
          difficulty,
          youtube_url: youtubeUrl.trim(),
          lyrics: lyrics.trim(),
          raw_notation: rawNotation.trim(),
          is_admin: true,
          contributor_name: 'Begenarxiv',
          status: 'approved',
        });

        setPublishSuccess({ mezmurId: res.mezmurId, title: res.title });

        if (linkedRequestId) {
          await api.updateRequestStatus(linkedRequestId, 'completed').catch(() => {});
          setLinkedRequestId(null);
          fetchRequests();
        }
      }

      fetchAdminMezmurs();
      setTitle('');
      setArtist('');
      setYoutubeUrl('');
      setLyrics('');
      setRawNotation('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save mezmur';
      setPublishError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Admin Approval Action (Green Light)
  const handleApproveSubmission = async (id: number) => {
    setApprovingId(id);
    try {
      const res = await api.approveMezmur(id);
      setReviewFeedback(res.message);
      fetchPending();
      fetchAdminMezmurs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      setReviewFeedback(msg);
    } finally {
      setApprovingId(null);
    }
  };

  // Admin Reject Action
  const handleRejectSubmission = async (id: number) => {
    const reason = window.prompt(
      'Optional: Enter feedback or reason for the contributor (or leave empty for standard notification):'
    );
    if (reason === null) return;

    setRejectingId(id);
    try {
      const res = await api.rejectMezmur(id, reason.trim() || undefined);
      setReviewFeedback(res.message);
      fetchPending();
      fetchAdminMezmurs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed';
      setReviewFeedback(msg);
    } finally {
      setRejectingId(null);
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

  const loadSampleHymn = () => {
    setTitle('በገናዬም መጣሁ (Begenayem Metahu)');
    setArtist('Alemu Aga');
    setTune('Tizita');
    setDifficulty('beginner');
    setYoutubeUrl('https://www.youtube.com/watch?v=sample');
    setLyrics('በገናዬም መጣሁ ምስጋና ላቀርብ (x2)\nየሰራዊት ጌታ እግዚአብሔርን ላከብር (x2)\nበገናዬም መጣሁ... (፪ ጊዜ)');
    setRawNotation('1 3 2 4 | 2 1 3 1\n42 2 - 1 3 1\n1 3 2 4 | 13 3 1');
  };

  if (!isAuthenticated) {
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
            <span className="font-mono text-[10px] uppercase bg-zinc-950 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <Lock size={10} /> ADMIN PORTAL LOCKED
            </span>
          </div>

          {/* Portal Header */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Curation &amp; Population Portal
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-mono mt-1">
              Master studio: review contributions, decode hymns, and curate the live archive.
            </p>
          </div>

          {/* Centered Lock Card */}
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-5">
                <Lock size={20} />
              </div>

              <div className="space-y-1 mb-5">
                <span className="font-mono text-[10px] uppercase bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-bold tracking-wider">
                  CURATOR AUTHENTICATION
                </span>
                <h2 className="text-xl font-bold tracking-tight text-black pt-1">
                  Unlock Admin Portal
                </h2>
                <p className="text-xs text-zinc-500 font-mono leading-relaxed">
                  Enter your master curator password to review community submissions, decode hymns, and curate the live archive.
                </p>
              </div>

              {loginError && (
                <div className="mb-5 p-3.5 rounded-lg bg-zinc-50 border border-zinc-300 text-xs font-mono text-zinc-800 flex items-start gap-2.5">
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-black" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 mb-1.5 font-bold">
                    Curator Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter curator password..."
                      autoFocus
                      required
                      className="w-full px-3.5 py-2.5 pr-10 border border-zinc-300 rounded-lg text-sm font-mono focus:outline-none focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn || !passwordInput.trim()}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-black hover:bg-zinc-800 text-white font-mono text-xs tracking-wider uppercase font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      <Key size={14} className="mr-1.5" />
                      UNLOCK PORTAL
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Default: begena2026</span>
                <span className="text-zinc-300">·</span>
                <span>Configured in .env</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <ShieldCheck size={11} /> CURATOR VERIFIED
            </span>
          </div>
        </div>

        {/* Portal Header */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Curation &amp; Population Portal
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-mono mt-1">
                Admin studio: review community contributions, decode requests, and publish to archive.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={loadSampleHymn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 hover:border-black text-xs font-mono text-zinc-700 hover:text-black transition-colors cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Load Template</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 hover:border-black text-xs font-mono text-zinc-700 hover:text-black transition-colors cursor-pointer"
                title="Lock admin portal and terminate current session"
              >
                <LogOut size={13} />
                <span>Lock</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-zinc-100 font-mono text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white font-bold'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              <LayoutDashboard size={12} />
              <span>CATALOGUE DASHBOARD</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white text-black text-[10px] font-bold">
                {adminMezmurs.filter((m) => m.status === 'approved').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('decode')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'decode'
                  ? 'bg-black text-white font-bold'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              <Plus size={12} />
              <span>{editingMezmurId ? `EDITING #${editingMezmurId}` : 'DECODE & PUBLISH'}</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-black text-white font-bold'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              <Award size={12} />
              <span>PENDING REVIEWS</span>
              {pendingMezmurs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-black text-[10px] font-bold">
                  {pendingMezmurs.length}
                </span>
              )}
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
          </div>
        </div>

        {actionFeedback && (
          <div className="p-3 mb-6 bg-zinc-950 text-white rounded-xl text-xs font-mono flex items-center justify-between shadow-xs">
            <span>{actionFeedback}</span>
            <button onClick={() => setActionFeedback(null)} className="text-zinc-400 hover:text-white cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* TAB 0: CATALOGUE DASHBOARD (INVENTORY & MANAGEMENT) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 font-mono">
            {/* Toolbar */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 text-xs">
                <div>
                  <h2 className="font-bold text-sm text-black uppercase">
                    Catalogue Inventory ({filteredAdminMezmurs.length} Mezmurs)
                  </h2>
                  <p className="text-zinc-500 text-[11px] font-sans mt-0.5">
                    Live inventory: edit lyrics or notation, audition strings, or remove hymns.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchAdminMezmurs}
                    disabled={loadingAdminMezmurs}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 hover:border-black text-xs text-zinc-700 hover:text-black cursor-pointer transition-colors"
                  >
                    <RefreshCw size={11} className={loadingAdminMezmurs ? 'animate-spin' : ''} />
                    <span>{loadingAdminMezmurs ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingMezmurId(null);
                      setTitle('');
                      setArtist('');
                      setLyrics('');
                      setRawNotation('');
                      setActiveTab('decode');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-black text-white hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus size={12} />
                    <span>Add New Mezmur</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs pt-1">
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-2.5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={catalogueQuery}
                    onChange={(e) => setCatalogueQuery(e.target.value)}
                    placeholder="Search by title, artist, mode, or contributor..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-black placeholder:text-zinc-400 focus:outline-hidden focus:border-black font-mono"
                  />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-zinc-400 uppercase mr-1">Status:</span>
                  {['all', 'approved', 'pending', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setCatalogueStatusFilter(st)}
                      className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                        catalogueStatusFilter === st
                          ? 'bg-black text-white font-bold'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Difficulty filter */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-zinc-400 uppercase mr-1">Diff:</span>
                  {['all', 'practice', 'beginner', 'intermediate', 'advanced'].map((df) => (
                    <button
                      key={df}
                      onClick={() => setCatalogueDifficultyFilter(df)}
                      className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                        catalogueDifficultyFilter === df
                          ? 'bg-black text-white font-bold'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {df}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List */}
            {loadingAdminMezmurs ? (
              <DashboardTableSkeleton />
            ) : filteredAdminMezmurs.length === 0 ? (
              <div className="p-12 text-center bg-white border border-zinc-200 rounded-xl text-xs text-zinc-500">
                <p className="font-bold text-black mb-1">NO MEZMURS IN REPOSITORY</p>
                <p className="text-zinc-400 text-[11px] max-w-sm mx-auto font-sans mb-4">
                  {adminMezmurs.length === 0
                    ? 'The catalogue is clean and ready for your data population.'
                    : 'No mezmurs match the active search or filter criteria.'}
                </p>
                <button
                  onClick={() => {
                    setEditingMezmurId(null);
                    setActiveTab('decode');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-black text-white text-xs font-bold cursor-pointer"
                >
                  <Plus size={12} /> Add First Mezmur
                </button>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                <div className="divide-y divide-zinc-200">
                  {filteredAdminMezmurs.map((m) => (
                    <div
                      key={m.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-black truncate">
                            {m.title}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold border border-zinc-200">
                            {m.tune_name ?? 'Tizita'}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800">
                            {m.difficulty ?? 'beginner'}
                          </span>
                          <span
                            className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                              m.status === 'approved'
                                ? 'bg-black text-white'
                                : m.status === 'pending'
                                ? 'bg-zinc-200 text-zinc-800'
                                : 'bg-zinc-100 text-zinc-400 line-through'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-mono">
                          <span>Artist: <strong>{m.artist_name || 'Traditional'}</strong></span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            {m.contributor_name && m.contributor_name.toLowerCase() !== 'begenarxiv' ? (
                              <>
                                <Award size={11} className="text-zinc-700" />
                                <span>{m.contributor_name}</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={11} className="text-zinc-700" />
                                <span>Begenarxiv</span>
                              </>
                            )}
                          </span>
                          <span>·</span>
                          <span>{m.step_count} notation steps</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                        <Link
                          to={`/mezmur/${m.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-zinc-200 hover:border-black text-xs text-zinc-700 hover:text-black transition-colors"
                        >
                          <span>View</span>
                          <ExternalLink size={11} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(m.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-zinc-300 hover:border-black text-xs text-black font-semibold transition-colors cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMezmur(m.id, m.title)}
                          disabled={deletingId === m.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-red-200 hover:border-red-500 hover:bg-red-50 text-xs text-red-600 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                          title="Delete mezmur"
                        >
                          {deletingId === m.id ? (
                            <>
                              <Loader2 size={12} className="animate-spin text-red-600" />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: PENDING COMMUNITY SUBMISSIONS (ADMIN REVIEW) */}
        {activeTab === 'pending' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 text-xs">
              <span className="font-bold text-black uppercase">
                Community Submissions Awaiting Approval ({pendingMezmurs.length})
              </span>
              <button
                onClick={fetchPending}
                disabled={loadingPending}
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-black cursor-pointer text-xs"
              >
                <RefreshCw size={11} className={loadingPending ? 'animate-spin' : ''} />
                <span>{loadingPending ? 'Refreshing...' : 'Refresh List'}</span>
              </button>
            </div>

            {reviewFeedback && (
              <div className="p-3 mb-4 bg-zinc-950 text-white rounded text-xs flex items-center justify-between">
                <span>{reviewFeedback}</span>
                <button onClick={() => setReviewFeedback(null)} className="text-zinc-400 hover:text-white">
                  Dismiss
                </button>
              </div>
            )}

            {loadingPending ? (
              <PendingReviewsSkeleton />
            ) : pendingMezmurs.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No submissions waiting for review. When users submit hymns at <code className="bg-zinc-100 px-1 py-0.5 rounded">/contribute</code>, they appear here for your green light!
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {pendingMezmurs.map((sub) => (
                  <div key={sub.id} className="py-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-black">{sub.title}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold">
                          {sub.tune_name ?? 'Tizita'}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800">
                          {sub.difficulty ?? 'beginner'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <span>Artist: {sub.artist_name || 'Traditional'}</span>
                        <span>·</span>
                        <span className="text-black font-semibold flex items-center gap-1">
                          <Award size={12} /> Contributor: {sub.contributor_name}
                        </span>
                        {sub.contributor_email && (
                          <span className="text-zinc-400">({sub.contributor_email})</span>
                        )}
                      </div>

                      {sub.lyrics && (
                        <div className="max-w-xl">
                          <LyricsViewer lyrics={sub.lyrics} className="text-xs p-3" />
                        </div>
                      )}

                      {sub.youtube_url && (
                        <a
                          href={sub.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-600 hover:text-black underline mt-1"
                        >
                          <span>Listen Reference Video</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => handleApproveSubmission(sub.id)}
                        disabled={approvingId === sub.id || rejectingId === sub.id}
                        className="inline-flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white text-xs px-3.5 py-2 rounded font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {approvingId === sub.id ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-white" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <Check size={13} />
                            <span>Green Light &amp; Approve</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRejectSubmission(sub.id)}
                        disabled={approvingId === sub.id || rejectingId === sub.id}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 text-xs px-3 py-2 rounded cursor-pointer transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {rejectingId === sub.id ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-zinc-700" />
                            <span>Rejecting...</span>
                          </>
                        ) : (
                          <>
                            <X size={13} />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DECODE & PUBLISH / EDIT */}
        {activeTab === 'decode' && (
          <form onSubmit={handlePublish} className="space-y-6">
            {editingMezmurId && (
              <div className="p-4 rounded-xl bg-zinc-950 text-white flex items-center justify-between font-mono text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <Edit3 size={16} />
                  <span>
                    Editing Mode: Mezmur <strong>#{editingMezmurId}</strong> ({title || 'Untitled'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 rounded bg-white text-black hover:bg-zinc-200 font-bold transition-colors cursor-pointer"
                >
                  Cancel Edit
                </button>
              </div>
            )}

            {publishSuccess && (
              <div className="p-4 rounded-xl bg-zinc-950 text-white flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-white" />
                  <span>
                    Saved <strong>"{publishSuccess.title}"</strong> successfully to the catalogue!
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

            {/* Hymn Metadata Block */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
                1. Hymn Metadata {editingMezmurId ? `(Editing #${editingMezmurId})` : '(Direct Admin Publish)'}
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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-mono font-medium text-zinc-700">
                    Liturgical Lyrics (Optional)
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

            {/* Raw Numbers Notation Input */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                  2. Fast Notation Input (Numbers, Pauses &amp; Rolls)
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
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-black bg-white px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">(x2)</span>
                    <span><strong>Line Repeat</strong>: repeats the entire line (e.g. <code className="text-black font-semibold">1 3 2 4 (x2)</code>)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-black bg-white px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">[..](x2)</span>
                    <span><strong>Section Repeat (Underlined)</strong>: repeats only bracketed notes (e.g. <code className="text-black font-semibold">1 [3 2](x2) 4</code>)</span>
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
                  <span className="text-zinc-300 mx-1">|</span>
                  <span className="text-zinc-400 text-[10px] uppercase mr-0.5">Repeat:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertNotationRepeat('(x2)')}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-semibold"
                    title="Repeat entire line (x2)"
                  >
                    + (x2) Line
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertNotationRepeat('(x2)', true)}
                    className="px-2 py-0.5 rounded bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 transition-colors cursor-pointer text-[10px] font-bold"
                    title="Repeat selected section with underline: highlight notes then click, or inserts [notes](x2)"
                  >
                    + [Section](x2) Underline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertNotationRepeat('(x3)')}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-semibold"
                    title="Repeat line (x3)"
                  >
                    + (x3)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertNotationRepeat('(፪ ጊዜ)')}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer text-[10px] font-semibold"
                    title="Repeat line (Ge'ez ፪ ጊዜ)"
                  >
                    + (፪ ጊዜ)
                  </button>
                </div>
              </div>

              <textarea
                ref={notationTextareaRef}
                rows={5}
                required
                value={rawNotation}
                onChange={(e) => setRawNotation(e.target.value)}
                placeholder={'1 3 2 4 | 2 1 3 1\n42 2 - [1 3 1](x2)\n1 3 2 4 | 13 3 1 (x2)'}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-black outline-hidden font-mono text-sm tracking-widest leading-loose"
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1">
                <span>
                  Highlight notes and click <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">+ [Section](x2)</code> to repeat &amp; underline only that part (e.g.{' '}
                  <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">[1 3 2](x2)</code>), or add <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">(x2)</code> at line end to repeat the entire line.
                </span>
              </div>

              {hasInvalidTokens && (
                <div className="p-3 bg-zinc-50 border border-zinc-300 rounded font-mono text-xs text-black flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>Warning: One or more tokens have invalid notation. Use 1–5, 42, |, or -.</span>
                </div>
              )}
            </div>

            {/* In-Portal Audition Player */}
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
                          <div key={key} className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => playToken(tok, key)}
                              className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                                tok.isRepeatedSection
                                  ? 'border-b-2 border-black underline underline-offset-4 decoration-black bg-zinc-100 font-extrabold'
                                  : tok.type === 'roll'
                                  ? 'border border-dashed border-zinc-400'
                                  : 'border border-zinc-200 bg-white'
                              } ${
                                isPlaying
                                  ? 'bg-black text-white border-black scale-105'
                                  : tok.isValid
                                  ? 'text-black hover:border-black'
                                  : 'bg-red-50 text-red-600 border-red-300'
                              }`}
                              title={tok.isRepeatedSection ? `Repeated section note (x${tok.sectionRepeatCount})` : `Tap to hear ${tok.text}`}
                            >
                              {tok.text}
                            </button>
                            {tok.isSectionEnd && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-zinc-950 text-white text-[9px] font-mono font-bold tracking-tight"
                                title={`Repeat section x${tok.sectionRepeatCount}`}
                              >
                                x{tok.sectionRepeatCount}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {line.lineRepeatCount > 1 && (
                        <div className="ml-auto pl-2 flex items-center">
                          <span
                            className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 font-mono text-[10px] font-bold border border-zinc-300"
                            title={`Entire line repeated ${line.lineRepeatCount} times`}
                          >
                            x{line.lineRepeatCount} Line
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Error Notification */}
            {publishError && (
              <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-900 text-black flex items-center justify-between font-mono text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={18} className="text-black shrink-0" />
                  <span>{publishError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPublishError(null)}
                  className="text-zinc-500 hover:text-black font-bold text-[11px] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={isPublishing || parsedLines.length === 0 || hasInvalidTokens}
                className="w-full py-3.5 text-sm font-mono flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 transition-all"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>{editingMezmurId ? 'Saving Changes to Archive...' : 'Publishing to Catalogue...'}</span>
                  </>
                ) : editingMezmurId ? (
                  <>
                    <span>UPDATE MEZMUR #{editingMezmurId}</span>
                    <Check size={15} />
                  </>
                ) : (
                  <>
                    <span>DIRECT PUBLISH AS ADMIN (BEGENARXIV)</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </Button>

              {editingMezmurId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto px-6 py-3.5 rounded border border-zinc-300 hover:border-black font-mono text-xs text-zinc-700 hover:text-black transition-colors cursor-pointer shrink-0"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}

        {/* TAB 3: DECODE REQUESTS QUEUE */}
        {activeTab === 'requests' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs font-mono">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 text-xs">
              <span className="font-bold text-black uppercase">
                Community Decode Requests ({requests.length})
              </span>
              <button
                onClick={fetchRequests}
                disabled={loadingRequests}
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-black cursor-pointer text-xs"
              >
                <RefreshCw size={11} className={loadingRequests ? 'animate-spin' : ''} />
                <span>{loadingRequests ? 'Refreshing...' : 'Refresh List'}</span>
              </button>
            </div>

            {loadingRequests ? (
              <RequestsSkeleton />
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No decode requests in the queue yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
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
                        {req.requester_name ? ` by ${req.requester_name}` : ''}
                        {req.requester_email ? ` (${req.requester_email})` : ''}
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
                        type="button"
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
      </div>
    </Layout>
  );
}
