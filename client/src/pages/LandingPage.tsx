import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Square,
  ChevronDown,
} from 'lucide-react';
import PixelBegena from '../components/PixelBegena';
import Button from '../components/Button';
import { useTonePlayer, ROLL_OFFSET_SEC, type BegenaTuneMode, BEGENA_TUNINGS } from '../hooks/useTonePlayer';

interface DemoStep {
  position: number;
  durationMs: number;
  isOrnament?: boolean;
}

const SAMPLE_HYMN_SEQUENCE: DemoStep[] = [
  { position: 1, durationMs: 450 },
  { position: 3, durationMs: 450 },
  { position: 2, durationMs: 450 },
  { position: 4, durationMs: 320 },
  { position: 2, durationMs: 320 },
  { position: 1, durationMs: 500 },
  // 42 fast roll
  { position: 4, durationMs: 200, isOrnament: true },
  { position: 2, durationMs: 200, isOrnament: true },
  { position: 1, durationMs: 650 },
];

const FAQS = [
  {
    q: 'How are the 10 Begena strings arranged?',
    a: 'A Begena has 10 physical strings. In authentic tradition, plucking starts on string 1, skips 2 drone strings to reach string 2, then skips 1 string between each remaining digit: string 1, skip 2, string 2, skip 1, string 3, skip 1, string 4, skip 1, string 5.',
  },
  {
    q: 'What are the 3 Begena tuning modes?',
    a: 'Tizita (1=E, 2=C, 3=D, 4=A, 5=G), Selamta (1=F, 2=C, 3=D, 4=A, 5=G), and Anchi-Hoye (1=F, 2=C, 3=C#, 4=A, 5=F#). Tizita is the contemplative mode for nocturnal hymns, Selamta shifts string 1 to F, and Anchi-Hoye introduces minor-second intervals.',
  },
  {
    q: 'How are grouped numbers (ornament rolls) played?',
    a: 'Grouped numbers like "42" represent a micro-timed ornament roll: string 4 is plucked immediately followed by string 2 (about 35 milliseconds apart). Begenarxiv schedules these on the Web Audio clock for rhythmic accuracy.',
  },
  {
    q: 'Why does the Begena produce a buzzing sound?',
    a: 'Between the 10 strings and the wooden bridge, small pieces of leather (called birr or dampers) are inserted. As the string vibrates against the leather piece, it creates the iconic buzzing drone (bzzzz).',
  },
];

export default function LandingPage() {
  const [currentMode, setCurrentMode] = useState<BegenaTuneMode>('Tizita');
  const { pluckString } = useTonePlayer(currentMode);
  const [activeString, setActiveString] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [rollTesting, setRollTesting] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleManualPluck = useCallback(
    (pos: number) => {
      setActiveString(pos);
      pluckString(pos);
      setTimeout(() => {
        setActiveString((cur) => (cur === pos ? null : cur));
      }, 220);
    },
    [pluckString]
  );

  const stopDemo = useCallback(() => {
    stopRequestedRef.current = true;
    setIsPlayingDemo(false);
    setActiveString(null);
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
  }, []);

  const playDemo = useCallback(() => {
    stopRequestedRef.current = false;
    setIsPlayingDemo(true);

    const step = (index: number) => {
      if (stopRequestedRef.current || index >= SAMPLE_HYMN_SEQUENCE.length) {
        setIsPlayingDemo(false);
        setActiveString(null);
        return;
      }

      const item = SAMPLE_HYMN_SEQUENCE[index];
      setActiveString(item.position);
      pluckString(item.position, item.durationMs);

      const nextDelay = item.isOrnament ? ROLL_OFFSET_SEC * 1000 + 130 : item.durationMs;
      demoTimeoutRef.current = setTimeout(() => {
        step(index + 1);
      }, nextDelay);
    };

    step(0);
  }, [pluckString]);

  // Keyboard shortcuts: 1-5 for plucking, Space for play/stop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        handleManualPluck(parseInt(e.key, 10));
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (isPlayingDemo) {
          stopDemo();
        } else {
          playDemo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualPluck, isPlayingDemo, playDemo, stopDemo]);

  useEffect(() => {
    return () => {
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    };
  }, []);

  // Roll Lab tests
  const testSolo = () => {
    setRollTesting('solo');
    setActiveString(1);
    pluckString(1, 500);
    setTimeout(() => {
      setActiveString(null);
      setRollTesting(null);
    }, 500);
  };

  const testRoll = () => {
    setRollTesting('roll');
    setActiveString(4);
    pluckString(4, 250);
    setTimeout(() => {
      setActiveString(2);
      pluckString(2, 250);
    }, ROLL_OFFSET_SEC * 1000);
    setTimeout(() => {
      setActiveString(null);
      setRollTesting(null);
    }, 450);
  };

  const currentTuningNotes = BEGENA_TUNINGS[currentMode];

  return (
    <div className="relative min-h-screen bg-transparent text-black font-sans selection:bg-black selection:text-white overflow-hidden">
      {/* Wind-Blown Sand Particles Drift (Matching reference image) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[700px] sm:h-[820px] overflow-hidden select-none z-0"
        aria-hidden="true"
      >
        <img
          src="/sand-wind.svg"
          alt=""
          className="w-full h-full object-cover object-top opacity-65 pointer-events-none"
        />
      </div>

      {/* Top Navbar - Enlarged slightly, prominent logo, transparent at top, glassmorphic on scroll */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/85 backdrop-blur-md border-b border-zinc-200/80 shadow-xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-10 flex items-center justify-center shrink-0">
              <PixelBegena size="icon" interactive={false} />
            </div>
            <span className="font-bold tracking-tight text-lg text-black">
              Begenarxiv
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
            <Link to="/catalogue" className="hover:text-black text-zinc-600 transition-colors">
              CATALOGUE
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 bg-transparent" id="studio">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Mode Selector, Description & Actions */}
            <div className="lg:col-span-7">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-[1.08] mb-4">
                Numbers notation for Ethiopia's sacred lyre.
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mb-6">
                Ten strings, five active positions. Audition verified liturgical tunings,
                listen to micro-timed ornament rolls, and study church mezmurs.
              </p>

              {/* 3 Traditional Tune Modes */}
              <div className="mb-6 p-4 rounded-lg border border-zinc-200 bg-white">
                <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                  <span className="text-zinc-500 font-semibold uppercase text-[10px]">
                    TUNING MODE (QENET)
                  </span>
                  <span className="text-black font-bold text-[10px]">
                    {currentMode.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {(['Tizita', 'Selamta', 'Anchi-Hoye'] as BegenaTuneMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCurrentMode(m)}
                      className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                        currentMode === m
                          ? 'bg-black text-white font-bold'
                          : 'bg-zinc-50 text-black hover:bg-zinc-100 border border-zinc-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-[11px] font-mono text-zinc-600">
                  {currentMode === 'Tizita' && 'Tizita: 1=E · 2=C · 3=D · 4=A · 5=G'}
                  {currentMode === 'Selamta' && 'Selamta: 1=F · 2=C · 3=D · 4=A · 5=G (String 1 shifted to F)'}
                  {currentMode === 'Anchi-Hoye' && 'Anchi-Hoye: 1=F · 2=C · 3=C# · 4=A · 5=F#'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/catalogue">
                  <Button variant="primary" className="text-xs px-4 py-2.5">
                    Browse Catalogue <ArrowRight size={13} />
                  </Button>
                </Link>

                <button
                  onClick={isPlayingDemo ? stopDemo : playDemo}
                  className={`inline-flex items-center gap-2 text-xs font-mono font-medium px-4 py-2.5 rounded border transition-colors cursor-pointer ${
                    isPlayingDemo
                      ? 'bg-black text-white border-black'
                      : 'bg-white hover:bg-zinc-50 text-black border-zinc-300 hover:border-black'
                  }`}
                >
                  {isPlayingDemo ? (
                    <>
                      <Square size={12} className="fill-current" /> Stop Roll Demo
                    </>
                  ) : (
                    <>
                      <Play size={12} className="fill-current" /> Auto-Play Roll Sample
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Handcrafted 10-String Begena (Single Previewer on Page) */}
            <div className="lg:col-span-5 flex flex-col items-center w-full">
              <div className="pixel-box p-4 sm:p-6 md:p-8 bg-white w-full max-w-[320px] sm:max-w-sm flex flex-col items-center rounded-lg">
                <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-3 mb-4 text-[10px] font-mono text-zinc-600">
                  <span className="font-bold text-black">10_STRING_BEGENA</span>
                  <span className="text-black font-semibold">{currentMode.toUpperCase()}</span>
                </div>

                {/* The Single 10-String Pixel Begena */}
                <PixelBegena
                  size="hero"
                  activeString={activeString}
                  onPluck={handleManualPluck}
                  mode={currentMode}
                />

                <div className="w-full mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] font-mono text-zinc-600">
                  <span>1, SKIP 2, 2, SKIP 1...</span>
                  <span className="text-black font-bold">
                    {activeString
                      ? `STR ${activeString}: ${currentTuningNotes[activeString]?.note}`
                      : 'STANDBY'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Telemetry Overview Cards (Clean, flat, no top badges) */}
      <section className="py-12 bg-transparent border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Morphology */}
            <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 mb-2 pb-1.5 border-b border-zinc-100">
                  01 / STRINGS
                </div>
                <h3 className="font-bold text-sm text-black mb-1">
                  10 Physical Strings
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  String 1, skips 2 drone strings to string 2, then skips 1 string between digits 3, 4, and 5.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-100 font-mono text-[10px] text-zinc-400">
                Parchment Box · Bone Feet
              </div>
            </div>

            {/* Card 2: 3 Qenets */}
            <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 mb-2 pb-1.5 border-b border-zinc-100">
                  02 / QENETS
                </div>
                <h3 className="font-bold text-sm text-black mb-1">
                  Traditional Scales
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Tizita (1=E), Selamta (1=F), and Anchi-Hoye (1=F, 2=C, 3=C#, 4=A, 5=F#).
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-100 font-mono text-[10px] text-zinc-400">
                Liturgical Pentatonics
              </div>
            </div>

            {/* Card 3: 35ms Ornament Rolls */}
            <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 mb-2 pb-1.5 border-b border-zinc-100">
                  03 / ROLLS
                </div>
                <h3 className="font-bold text-sm text-black mb-1">
                  Micro-Timed Rolls
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Grouped digits (e.g. "42") schedule notes 35ms apart on the Web Audio hardware clock.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-100 font-mono text-[10px] text-zinc-400">
                Sub-millisecond Timing
              </div>
            </div>

            {/* Card 4: Acoustic Buzz */}
            <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 mb-2 pb-1.5 border-b border-zinc-100">
                  04 / RESONANCE
                </div>
                <h3 className="font-bold text-sm text-black mb-1">
                  Leather Damper Buzz
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Leather dampers on the bridge vibrate against the strings, creating the sacred drone.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-100 font-mono text-[10px] text-zinc-400">
                Acoustic Harmonics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Roll Lab: Fast Ornaments A/B Test */}
      <section className="py-12 sm:py-16 bg-transparent border-t border-zinc-200" id="rolls">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
              Solo Pluck vs. 35ms Ornament Roll
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Compare a single note sustain against a micro-timed roll (token <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">42</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Solo Note Card */}
            <div className="p-5 border border-zinc-200 rounded-lg bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-2">
                  <span>SINGLE NOTE</span>
                  <span>500 MS SUSTAIN</span>
                </div>
                <h3 className="text-base font-bold text-black mb-1">Solo Pluck [ 1 ]</h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  String 1 ({currentTuningNotes[1]?.note}) sustained cleanly.
                </p>
              </div>

              <button
                onClick={testSolo}
                disabled={rollTesting !== null}
                className={`w-full py-2 px-3 rounded font-mono text-xs font-medium border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  rollTesting === 'solo'
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:bg-zinc-50 text-black border-zinc-300'
                }`}
              >
                <Play size={12} className="fill-current" />
                <span>Test Solo Note [1]</span>
              </button>
            </div>

            {/* Fast Roll Card */}
            <div className="p-5 border border-black rounded-lg bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-black font-bold mb-2">
                  <span>GROUPED DIGITS [ 42 ]</span>
                  <span>35 MS MICRO-ROLL</span>
                </div>
                <h3 className="text-base font-bold text-black mb-1">Ornament Roll [ 4 2 ]</h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  String 4 ({currentTuningNotes[4]?.note}) followed 35ms later by String 2 ({currentTuningNotes[2]?.note}).
                </p>
              </div>

              <button
                onClick={testRoll}
                disabled={rollTesting !== null}
                className={`w-full py-2 px-3 rounded font-mono text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  rollTesting === 'roll'
                    ? 'bg-black text-white'
                    : 'bg-black hover:bg-zinc-800 text-white'
                }`}
              >
                <Play size={12} className="fill-current" />
                <span>Test 35ms Roll [42]</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 bg-transparent border-t border-zinc-200" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
              Frequently asked questions.
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-zinc-200 bg-white rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 font-medium text-xs sm:text-sm text-black cursor-pointer hover:bg-zinc-50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={15}
                      className={`text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-black' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-4 pb-4 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
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

      {/* Bottom CTA with Subtle Sand Wind Drift */}
      <section className="relative py-12 sm:py-16 bg-transparent border-t border-zinc-200 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-full overflow-hidden select-none z-0 opacity-40"
          aria-hidden="true"
        >
          <img
            src="/sand-wind.svg"
            alt=""
            className="w-full h-full object-cover object-bottom pointer-events-none rotate-180"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 md:p-10 bg-white border border-black rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
                Explore the Mezmur Repertoire
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-md">
                Browse traditional hymns with synchronized numbers notation and tap-to-hear audio.
              </p>
            </div>

            <Link to="/catalogue" className="w-full sm:w-auto">
              <Button variant="primary" className="text-xs px-5 py-3 w-full sm:w-auto justify-center">
                Open Catalogue <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-black font-semibold">
            <div className="w-7 h-9 flex items-center justify-center shrink-0">
              <PixelBegena size="icon" interactive={false} />
            </div>
            <span className="text-sm font-bold">Begenarxiv</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500 font-normal">Ethiopian Begena Archive</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Begenarxiv. Open source.</p>
        </div>
      </footer>
    </div>
  );
}
