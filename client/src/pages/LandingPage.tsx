import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Music,
  Volume2,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Layers,
  Play,
} from 'lucide-react';
import InteractiveSoundboard from '../components/InteractiveSoundboard';
import ConstellationHeroBanner from '../components/ConstellationHeroBanner';
import Button from '../components/Button';

// FAQs for the accordion
const FAQS = [
  {
    q: 'What is Begena numbers notation?',
    a: 'The Begena uses a traditional numeric notation system where each digit corresponds to a physical string position on the instrument (1 for String 1, 2 for String 2, etc.). Unlike Western staff notation, it focuses directly on fingering, making it accessible to self-taught and church players alike.',
  },
  {
    q: 'How are grouped numbers (ornaments) played?',
    a: 'In mezmur transcriptions, grouped digits like "42" represent a fast ornament roll: string 4 is plucked immediately followed by string 2 (about 35 milliseconds apart). Begenarxiv schedules these on the Web Audio clock so you can hear the exact rhythm and feel.',
  },
  {
    q: 'Are the sounds real instrument recordings?',
    a: 'Currently, tones are synthesized using an acoustic harmonic model (sine and triangle waveforms tuned to the standard frequencies of strings C, D, E, G, and A). Once authentic studio recordings of each Begena string are finalized, they will seamlessly replace the preview oscillators.',
  },
  {
    q: 'Is Begenarxiv completely free to use?',
    a: 'Yes. Begenarxiv is 100% free, open-source, and has no paywalls, accounts, or advertisements. It was created to preserve and teach sacred Ethiopian Begena music for diaspora and local learners everywhere.',
  },
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-zinc-950 text-white text-xs py-2 px-4 text-center font-medium border-b border-zinc-800">
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Begenarxiv Beta 1.0 — Free open-source numbers notation for Begena players</span>
          <Link
            to="/catalogue"
            className="text-amber-300 hover:text-amber-200 underline underline-offset-2 ml-1"
          >
            Open Catalogue &rarr;
          </Link>
        </div>
      </div>

      {/* Modern SaaS Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <Music size={16} className="text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-base text-zinc-950">
                Begenarxiv
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                v1.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
            <Link to="/catalogue" className="hover:text-zinc-950 transition-colors">
              Song Catalogue
            </Link>
            <a href="#soundboard" className="hover:text-zinc-950 transition-colors">
              Interactive Soundboard
            </a>
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-zinc-950 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs md:text-sm font-medium px-4 py-2 rounded-full shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Songs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 md:pt-16 pb-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 mb-5"
            >
              <Sparkles size={12} className="text-amber-500" />
              <span>Numbers Notation + Tap-to-Hear Audio</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.1] mb-5"
            >
              The ancient Begena. <br />
              <span className="text-zinc-950">Decoded for modern learners.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto mb-8"
            >
              Master Ethiopia’s sacred 10-stringed lyre. Explore liturgical mezmurs transcribed with
              sample-accurate tap-to-hear audio, micro-timed ornament rolls, and synchronized lyrics.
            </motion.p>

            {/* Hero Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3.5"
            >
              <Link to="/catalogue">
                <Button variant="primary" className="text-sm px-6 py-3 shadow-md">
                  Browse Song Catalogue <ArrowRight size={15} />
                </Button>
              </Link>
              <a href="#soundboard">
                <Button variant="secondary" className="text-sm px-6 py-3">
                  <Volume2 size={15} className="text-amber-600" /> Play Begena Soundboard
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Hero Constellation Artwork Banner */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mb-12"
          >
            <ConstellationHeroBanner />
          </motion.div>

          {/* Live Interactive Begena Soundboard Section */}
          <motion.div
            id="soundboard"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <InteractiveSoundboard />
          </motion.div>
        </div>
      </section>

      {/* Telemetry & Metrics Strip (Inspired by RAVN reference layout) */}
      <section className="border-y border-zinc-200 bg-zinc-50/70 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="border-r border-zinc-200/80 pr-4 last:border-none">
              <span className="font-mono text-2xl md:text-3xl font-bold text-zinc-950">100%</span>
              <p className="text-xs text-zinc-500 mt-1 font-medium">Free &amp; Open Source</p>
              <p className="text-[11px] text-zinc-400">Preserving sacred church heritage</p>
            </div>
            <div className="border-r border-zinc-200/80 pr-4 last:border-none">
              <span className="font-mono text-2xl md:text-3xl font-bold text-zinc-950">5 Strings</span>
              <p className="text-xs text-zinc-500 mt-1 font-medium">Standard Notation Map</p>
              <p className="text-[11px] text-zinc-400">Position 1 (C3) through 5 (A3)</p>
            </div>
            <div className="border-r border-zinc-200/80 pr-4 last:border-none">
              <span className="font-mono text-2xl md:text-3xl font-bold text-zinc-950">&lt;35 ms</span>
              <p className="text-xs text-zinc-500 mt-1 font-medium">Fast Ornament Roll Engine</p>
              <p className="text-[11px] text-zinc-400">Sample-accurate Web Audio clock</p>
            </div>
            <div>
              <span className="font-mono text-2xl md:text-3xl font-bold text-zinc-950">0 Setup</span>
              <p className="text-xs text-zinc-500 mt-1 font-medium">No Accounts or Logins</p>
              <p className="text-[11px] text-zinc-400">Instant browser access anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs. Solution ("Why Numbers Alone Fall Short") */}
      <section className="py-16 md:py-24 bg-white" id="how-it-works">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600">
              The Learning Problem
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 mt-1">
              Numbers on paper don’t teach rhythm or touch.
            </h2>
            <p className="text-zinc-600 text-sm md:text-base mt-2 leading-relaxed">
              Begena students usually receive lyric sheets with string digits like <code className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">1 42 2 31</code>. Without hearing how the strings roll together, it’s impossible to play accurately.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional Way Card */}
            <div className="p-6 md:p-8 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2 mb-4 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Traditional Static Numbers</span>
              </div>
              <h3 className="font-bold text-xl text-zinc-900 mb-3">
                Guessing the song’s rhythm
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                Flat printed text gives no feedback on string sustain, ornament roll velocity, or vocal phrasing. Beginners end up stuck, guessing how long each string is held.
              </p>
              <div className="p-4 bg-white rounded-xl border border-zinc-200 font-mono text-sm text-zinc-400 space-y-1.5 select-none">
                <div className="text-zinc-700">ስምህን ጠርቼ (Line 1): 1 42 2 1</div>
                <div>መቼ አፍራለሁ (Line 2): 2 13 31 1</div>
                <div className="text-[11px] text-rose-500 pt-2">⚠ How fast is "42"? What note is "1"?</div>
              </div>
            </div>

            {/* Begenarxiv Experience Card */}
            <div className="p-6 md:p-8 rounded-2xl border-2 border-zinc-950 bg-white shadow-md">
              <div className="flex items-center gap-2 mb-4 text-xs font-mono text-amber-600 uppercase tracking-wider font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>The Begenarxiv Experience</span>
              </div>
              <h3 className="font-bold text-xl text-zinc-950 mb-3">
                Tap-to-hear synced audio
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                Tap any digit to hear the actual acoustic pitch of that Begena string. Hit play to watch the entire sequence illuminate in real time with tight 35ms ornament rolls.
              </p>
              <div className="p-4 bg-zinc-950 rounded-xl text-white font-mono text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Interactive Roll Playback:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold">
                    [4][2] = 35ms
                  </span>
                </div>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Features Breakdown (Editorial Layout) */}
      <section className="py-16 md:py-20 bg-zinc-50/50 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 mt-1">
              Everything you need to learn Begena.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
                  <Volume2 size={20} />
                </div>
                <h4 className="font-bold text-base text-zinc-950 mb-2">Tap-to-Hear Audio</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Every number in every hymn is a clickable audio trigger. Hear each string’s pitch instantly before playing it on your instrument.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-400">
                Web Audio Synthesis
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 mb-4">
                  <Sparkles size={20} />
                </div>
                <h4 className="font-bold text-base text-zinc-950 mb-2">Ornament Roll Timing</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Multi-digit tokens like "12" or "31" are timed with micro-delays on the audio clock, giving you the authentic sound of Ethiopian rolls.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-400">
                ~35ms Sample Accuracy
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
                  <Layers size={20} />
                </div>
                <h4 className="font-bold text-base text-zinc-950 mb-2">Line-by-Line Lyrics</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Notation steps are grouped and mapped directly to their lyric lines. Follow the hymn’s poetry in Amharic as the melody steps forward.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-400">
                Liturgical Alignment
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mb-4">
                  <Play size={20} />
                </div>
                <h4 className="font-bold text-base text-zinc-950 mb-2">Reference Videos</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Each song includes high-quality video performance references to observe proper hand positioning, finger plucking, and singing style.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-400">
                Master Performances
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Musical Modes & Standard Tuning Overview */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-6 border-b border-zinc-200">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600">
                Acoustic Foundations
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 mt-1">
                Standard Begena String Frequencies
              </h2>
            </div>
            <Link to="/catalogue">
              <Button variant="secondary" className="text-xs">
                View Hymns by Tune &rarr;
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { pos: 1, note: 'C3', hz: '130.81 Hz', name: 'Tsehay String 1' },
              { pos: 2, note: 'D3', hz: '146.83 Hz', name: 'String 2' },
              { pos: 3, note: 'E3', hz: '164.81 Hz', name: 'String 3' },
              { pos: 4, note: 'G3', hz: '196.00 Hz', name: 'String 4' },
              { pos: 5, note: 'A3', hz: '220.00 Hz', name: 'String 5' },
            ].map((s) => (
              <div
                key={s.pos}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-full bg-zinc-950 text-white font-mono font-bold text-xs flex items-center justify-center">
                    {s.pos}
                  </span>
                  <span className="text-xs font-bold text-zinc-800">{s.note}</span>
                </div>
                <div className="mt-3">
                  <span className="font-mono text-xs text-zinc-500">{s.hz}</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{s.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 md:py-24 bg-zinc-50/50 border-t border-zinc-200" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600">
              Got Questions?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 mt-1">
              Curiosity is welcome.
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              Learn how the notation engine, audio playback, and archive dataset operate.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-zinc-200 bg-white rounded-xl overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 font-medium text-sm md:text-base text-zinc-950 cursor-pointer hover:bg-zinc-50/80 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-zinc-900' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs md:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Converting Bottom CTA Card */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white p-8 md:p-14 border border-zinc-800 shadow-xl">
            {/* Background constellation artwork subtle overlay */}
            <img
              src="/images/contextual-hero.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent" />

            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider mb-3">
                <Sparkles size={12} /> Start Playing Today
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                Pick up your Begena. Learn your first mezmur in minutes.
              </h2>
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8">
                Explore the free catalogue of authentic transcriptions, hear each string in real time, and master traditional liturgical rolls.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/catalogue">
                  <Button variant="accent" className="text-sm px-6 py-3 font-semibold shadow-md">
                    Open Song Catalogue &rarr;
                  </Button>
                </Link>
                <a href="#soundboard">
                  <Button variant="outline" className="text-sm px-6 py-3 text-white border-white/20 hover:bg-white/10">
                    Play Soundboard
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50/70 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-950 text-white flex items-center justify-center font-bold">
                <Music size={12} className="text-amber-400" />
              </div>
              <span className="font-bold text-zinc-900 text-sm">Begenarxiv</span>
              <span className="text-zinc-400">· Open source project for the Begena community</span>
            </div>
            <p>&copy; {new Date().getFullYear()} Begenarxiv. Free for educational and devotional study.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
