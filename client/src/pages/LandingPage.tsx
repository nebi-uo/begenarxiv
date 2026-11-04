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
import PixelSceneBanner from '../components/PixelSceneBanner';
import Button from '../components/Button';
import InteractiveSoundboard from '../components/InteractiveSoundboard';
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
    q: 'How many strings does a Begena have?',
    a: 'A traditional Ethiopian Begena has exactly 10 strings. In traditional playing technique, 5 primary strings are plucked with the left hand (using digits 1 through 5 in notation), while the remaining 5 strings provide acoustic drone and sympathetic vibration.',
  },
  {
    q: 'What are the 3 main Begena tuning modes?',
    a: 'The three primary Begena modes (Qenets) are Tizita (1=E, 2=C, 3=D, 4=A, 5=G), Selamta (1=C, 2=D, 3=E, 4=G, 5=A), and Anchi-Hoye (1=D, 2=F, 3=G, 4=A, 5=C). Tizita is the foundational contemplative mode for liturgical hymns.',
  },
  {
    q: 'How are grouped numbers (ornament rolls) played?',
    a: 'In mezmur transcriptions, grouped digits like "42" represent a fast ornament roll: string 4 is plucked immediately followed by string 2 (about 35 milliseconds apart). Begenarxiv schedules these on the Web Audio clock so you can hear the exact rhythm and feel.',
  },
  {
    q: 'Why does the Begena produce a buzzing sound?',
    a: 'Between the 10 strings and the wooden bridge, small pieces of leather (called birr or dampers) are inserted. As the string vibrates against the leather piece, it creates the instrument’s iconic, reverent buzzing drone (bzzzz).',
  },
];

export default function LandingPage() {
  const [currentMode, setCurrentMode] = useState<BegenaTuneMode>('Tizita');
  const { pluckString } = useTonePlayer(currentMode);
  const [activeString, setActiveString] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [rollTesting, setRollTesting] = useState<string | null>(null);

  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRequestedRef = useRef(false);

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
    setCurrentStepIndex(null);
    setActiveString(null);
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
  }, []);

  const playDemo = useCallback(() => {
    stopRequestedRef.current = false;
    setIsPlayingDemo(true);

    const step = (index: number) => {
      if (stopRequestedRef.current || index >= SAMPLE_HYMN_SEQUENCE.length) {
        setIsPlayingDemo(false);
        setCurrentStepIndex(null);
        setActiveString(null);
        return;
      }

      const item = SAMPLE_HYMN_SEQUENCE[index];
      setCurrentStepIndex(index);
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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-black text-white flex items-center justify-center">
              <PixelBegena size="icon" />
            </div>
            <span className="font-bold tracking-tight text-base text-black">
              Begenarxiv
            </span>
            <span className="pixel-tag">
              10-STRINGS
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-600">
            <Link to="/catalogue" className="hover:text-black transition-colors">
              CATALOGUE
            </Link>
            <a href="#studio" className="hover:text-black transition-colors">
              STUDIO
            </a>
            <a href="#atmosphere" className="hover:text-black transition-colors">
              ATMOSPHERE
            </a>
            <a href="#rolls" className="hover:text-black transition-colors">
              ROLL_LAB
            </a>
            <a href="#faq" className="hover:text-black transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-[10px] font-mono text-zinc-500">
              [1-5]: PLUCK
            </span>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-mono px-3.5 py-1.5 rounded transition-colors"
            >
              <span>Repertoire</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Studio Section */}
      <section className="pt-10 md:pt-14 pb-14" id="studio">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Stature Headline, Mode Selector, Description & Controls */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="pixel-tag">10-STRING BEGENA</span>
                <span className="pixel-tag-outline">TIZITA: 1=E · 2=C · 3=D · 4=A · 5=G</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-[1.08] mb-5">
                Numbers notation for Ethiopia's sacred lyre.
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mb-6">
                The Begena has 10 strings with 5 primary playing positions. Audition authentic Tizita
                tuning, master micro-timed 35ms ornament rolls, and study verified church mezmurs.
              </p>

              {/* 3 Traditional Tune Modes (Tizita, Selamta, Anchi-Hoye) */}
              <div className="mb-8 p-3 rounded border border-zinc-200 bg-zinc-50">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-500 font-semibold uppercase text-[10px]">
                    TRADITIONAL TUNING MODES (QENETS)
                  </span>
                  <span className="text-black font-bold text-[10px]">
                    ACTIVE: {currentMode.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {(['Tizita', 'Selamta', 'Anchi-Hoye'] as BegenaTuneMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCurrentMode(m)}
                      className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                        currentMode === m
                          ? 'bg-black text-white font-bold shadow-xs'
                          : 'bg-white text-black hover:bg-zinc-100 border border-zinc-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[11px] font-mono text-zinc-600">
                  {currentMode === 'Tizita' && 'Tizita: String 1 = E · String 2 = C · String 3 = D · String 4 = A · String 5 = G'}
                  {currentMode === 'Selamta' && 'Selamta: String 1 = C · String 2 = D · String 3 = E · String 4 = G · String 5 = A'}
                  {currentMode === 'Anchi-Hoye' && 'Anchi-Hoye: String 1 = D · String 2 = F · String 3 = G · String 4 = A · String 5 = C'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
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

              {/* Live Sequence Monitor */}
              <div className="p-4 rounded border border-zinc-200 bg-zinc-50 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-500 text-[11px] pb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPlayingDemo ? 'bg-black animate-ping' : 'bg-zinc-400'
                      }`}
                    />
                    <span className="font-bold text-black">
                      {isPlayingDemo ? 'PLAYING ROLL SEQUENCE' : 'KEYBOARD READY'}
                    </span>
                  </div>
                  <span className="text-zinc-500">SHORTCUT: [SPACE]</span>
                </div>

                <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-1">
                  <span className="text-[10px] text-zinc-400 uppercase shrink-0">Seq:</span>
                  {SAMPLE_HYMN_SEQUENCE.map((s, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        currentStepIndex === idx
                          ? 'bg-black text-white font-bold scale-110 shadow-xs'
                          : 'bg-white text-black border border-zinc-200'
                      }`}
                    >
                      {s.position}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2.5 text-[10px] text-zinc-500 border-t border-zinc-200 mt-2.5">
                  <span>Press keys [1], [2], [3], [4], [5] to pluck</span>
                  <span>Tokens 42 = 35ms micro-roll</span>
                </div>
              </div>
            </div>

            {/* Right Column: Tall Stature Handcrafted 10-String Pixel Begena */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="pixel-box p-6 md:p-8 bg-white w-full max-w-sm flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-3 mb-4 text-[10px] font-mono text-zinc-600">
                  <span className="font-bold text-black">10_STRING_BEGENA</span>
                  <span className="text-black font-semibold">{currentMode.toUpperCase()}</span>
                </div>

                {/* 10-String Pixel Begena (Tall Stature matching photo 2) */}
                <PixelBegena
                  size="hero"
                  activeString={activeString}
                  onPluck={handleManualPluck}
                  mode={currentMode}
                />

                <div className="w-full mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] font-mono text-zinc-600">
                  <span>10 STRINGS · 5 PLAYING POSITIONS</span>
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

      {/* Telemetry Grid (Inspired by RAVN) */}
      <section className="py-14 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="pixel-tag">SYS_TELEMETRY</span>
              <span className="text-xs font-mono text-zinc-500 uppercase">
                10-STRING ARCHITECTURE
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
              10 Strings. 3 Modes. Sub-millisecond timing.
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 mt-1 max-w-xl">
              Every detail is engineered to honor historical Ethiopian Begena construction and liturgical notation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Morphology */}
            <div className="p-5 bg-white border border-zinc-200 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-3 pb-2 border-b border-zinc-100">
                  <span>01 / MORPHOLOGY</span>
                  <span className="pixel-tag-outline">10 STRINGS</span>
                </div>
                <h3 className="font-bold text-base text-black mb-1">
                  10 Strings Total
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  5 primary playing positions for melodic digits [1] through [5], plus 5 sympathetic resonators creating the rich acoustic body.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-[10px] text-zinc-400">
                Parchment Soundbox · Ivory Feet
              </div>
            </div>

            {/* Card 2: 3 Qenets */}
            <div className="p-5 bg-white border border-zinc-200 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-3 pb-2 border-b border-zinc-100">
                  <span>02 / QENETS</span>
                  <span className="pixel-tag-outline">3 MODES</span>
                </div>
                <h3 className="font-bold text-base text-black mb-1">
                  Tizita · Selamta · Anchi-Hoye
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Historical Ethiopian pentatonic modes. Tizita (1=E, 2=C, 3=D, 4=A, 5=G) is the foundational tuning for sacred nocturnal vigils.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-[10px] text-zinc-400">
                Liturgy · Fasting · Prayer
              </div>
            </div>

            {/* Card 3: 35ms Ornament Rolls */}
            <div className="p-5 bg-white border border-zinc-200 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-3 pb-2 border-b border-zinc-100">
                  <span>03 / ORNAMENTS</span>
                  <span className="pixel-tag-outline">35MS ROLLS</span>
                </div>
                <h3 className="font-bold text-base text-black mb-1">
                  Micro-Timed Rolls
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Grouped notation numbers like "42" are scheduled directly on the Web Audio clock, striking 35ms apart with microsecond accuracy.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-[10px] text-zinc-400">
                Web Audio Engine · Sub-ms Clock
              </div>
            </div>

            {/* Card 4: Acoustic Buzz */}
            <div className="p-5 bg-white border border-zinc-200 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-3 pb-2 border-b border-zinc-100">
                  <span>04 / ACOUSTIC</span>
                  <span className="pixel-tag-outline">BIRR BUZZ</span>
                </div>
                <h3 className="font-bold text-base text-black mb-1">
                  Birr Damper Buzz
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  10 small leather mutes (enshish / birr) inserted between strings and bridge generate the iconic reverent buzzing drone.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 font-mono text-[10px] text-zinc-400">
                Harmonic Overtones · Drone
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pure SVG 1-Bit Pixel Art Scene (Inspired by Reference Image 1) */}
      <section className="py-12 bg-white border-t border-zinc-200" id="atmosphere">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PixelSceneBanner />
        </div>
      </section>

      {/* 10-String Audio Soundboard */}
      <section className="py-16 bg-zinc-50/50 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="pixel-tag mb-1.5 inline-block">AUDIO ENGINE</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
              10-String Begena Audio Board
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 font-mono mt-1">
              Currently tuned in {currentMode} mode (1={currentTuningNotes[1]?.note}, 2={currentTuningNotes[2]?.note}, 3={currentTuningNotes[3]?.note}, 4={currentTuningNotes[4]?.note}, 5={currentTuningNotes[5]?.note})
            </p>
          </div>

          <InteractiveSoundboard initialMode={currentMode} />
        </div>
      </section>

      {/* The Roll Lab: Fast Ornaments Interactively */}
      <section className="py-16 md:py-20 bg-white border-t border-zinc-200" id="rolls">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="pixel-tag">LAB</span>
              <span className="text-xs font-mono text-zinc-600 uppercase">
                ORNAMENT ROLL ENGINE
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
              Why numbers notation requires sound.
            </h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              In Begena notation, single digits are solo notes, while grouped digits like <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">42</code> represent
              a micro-timed ornament roll. Test the audible difference below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Solo Note Card */}
            <div className="p-6 border border-zinc-200 rounded-xl bg-zinc-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-3">
                  <span>SINGLE TOKEN</span>
                  <span>500 MS SUSTAIN</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Solo Note [ 1 ]</h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                  A single string pluck ({currentTuningNotes[1]?.note}). Clear acoustic sustain, holding its place in the hymn melody.
                </p>
              </div>

              <button
                onClick={testSolo}
                disabled={rollTesting !== null}
                className={`w-full py-2.5 px-4 rounded font-mono text-xs font-medium border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  rollTesting === 'solo'
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:bg-zinc-100 text-black border-zinc-300'
                }`}
              >
                <Play size={12} className="fill-current" />
                <span>Test Solo Note [1]</span>
              </button>
            </div>

            {/* Fast Roll Card */}
            <div className="p-6 border-2 border-black rounded-xl bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-black font-bold mb-3">
                  <span>GROUPED DIGITS [ 42 ]</span>
                  <span>35 MS MICRO-ROLL</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Ornament Roll [ 4 2 ]</h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                  String 4 ({currentTuningNotes[4]?.note}) followed 35 milliseconds later by String 2 ({currentTuningNotes[2]?.note}). Scheduled on the Web Audio clock.
                </p>
              </div>

              <button
                onClick={testRoll}
                disabled={rollTesting !== null}
                className={`w-full py-2.5 px-4 rounded font-mono text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
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

      {/* 5-String Tuning Matrix */}
      <section className="py-16 bg-zinc-50/50 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block mb-1">
                ACOUSTIC REFERENCE
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-black">
                {currentMode} Begena String Frequencies
              </h2>
            </div>
            <Link to="/catalogue">
              <Button variant="secondary" className="text-xs">
                View Catalogue &rarr;
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
            {[1, 2, 3, 4, 5].map((pos) => {
              const s = currentTuningNotes[pos];
              return (
                <button
                  key={pos}
                  onClick={() => handleManualPluck(pos)}
                  className={`p-4 border rounded text-left transition-colors cursor-pointer ${
                    activeString === pos
                      ? 'bg-black text-white border-black'
                      : 'bg-white hover:bg-zinc-100 border-zinc-200 text-black'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded font-bold flex items-center justify-center text-xs ${
                        activeString === pos ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'
                      }`}
                    >
                      {pos}
                    </span>
                    <span className="font-bold">{s.note}</span>
                  </div>
                  <div className="text-[11px] opacity-75 mt-2">{s.hz} Hz</div>
                  <div className="text-[9px] uppercase tracking-wider opacity-60 mt-1">Pluck</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-white border-t border-zinc-200" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="pixel-tag mb-2 inline-block">FAQ</span>
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Frequently asked questions.
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-zinc-200 bg-white rounded overflow-hidden"
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

      {/* Bottom CTA */}
      <section className="py-16 bg-zinc-50/50 border-t border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pixel-box p-8 md:p-12 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-zinc-500">
                <span className="w-2 h-2 bg-black" />
                <span>BEGENARXIV / OPEN ACCESS</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
                Start playing your first mezmur.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-md">
                Browse our free collection of hymns with synchronized notation and tap-to-hear audio.
              </p>
            </div>

            <Link to="/catalogue">
              <Button variant="primary" className="text-xs px-5 py-3 shrink-0">
                Open Full Catalogue <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-black font-semibold">
            <div className="w-5 h-5 rounded bg-black text-white flex items-center justify-center">
              <PixelBegena size="icon" />
            </div>
            <span>Begenarxiv</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500 font-normal">Ethiopian Begena Notation &amp; Audio Archive</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Begenarxiv. Open source.</p>
        </div>
      </footer>
    </div>
  );
}
