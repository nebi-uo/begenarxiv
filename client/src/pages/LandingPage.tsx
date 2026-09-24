import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Music, BookOpen, Sparkles, ArrowRight, ArrowUpRight } from 'lucide-react';
import StatCounter from '../components/StatCounter';
import Button from '../components/Button';

const features = [
  {
    icon: BookOpen,
    title: 'A catalogue you can actually trust',
    body: 'Every mezmur gets its own real page - lyrics, numbers notation, and a reference video, organized properly by artist and by tune.',
  },
  {
    icon: Music,
    title: "Hear how it's actually played",
    body: "Tap through a song's numbers and hear each string as it's meant to sound, highlighted in sync. Numbers alone never taught anyone rhythm.",
  },
  {
    icon: Sparkles,
    title: 'Free, and built to grow',
    body: 'No accounts, no paywall. Built as the shared home for Begena learners - starting with the two things that make learning hardest.',
  },
];

export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBackground = useTransform(scrollY, [0, 80], ['rgba(247,246,243,0)', 'rgba(247,246,243,0.9)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)']);

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        style={{ backgroundColor: navBackground, borderColor: navBorder }}
        className="sticky top-0 z-20 backdrop-blur-md border-b"
      >
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-lg text-ink tracking-tight font-medium" style={{ fontFamily: 'var(--font-display)' }}>
            Begenarxiv
          </span>
          <Link to="/catalogue">
            <Button>Enter app</Button>
          </Link>
        </div>
      </motion.header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <span className="inline-block text-xs uppercase tracking-widest text-accent font-medium mb-5">
            For every Begena learner
          </span>
          <h1
            className="text-5xl md:text-6xl leading-tight text-ink font-medium mb-7"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Learn Begena.
            <br />
            <span className="text-accent">Properly.</span>
          </h1>
          <p className="text-muted text-lg mb-9 max-w-md leading-relaxed">
            A free home for Begena players - accurate mezmur material, and a way to actually
            hear how a song is played, not just read its numbers.
          </p>
          <div className="flex items-center gap-3">
            <Link to="/catalogue">
              <Button>
                <span className="flex items-center gap-2">
                  Browse the catalogue
                  <ArrowRight size={16} />
                </span>
              </Button>
            </Link>
            <a
              href="#how-it-works"
              className="text-sm text-ink font-medium px-5 py-2.5 rounded-pill border border-border"
            >
              See how it works
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.1 }}
          className="rounded-card overflow-hidden shadow-lg aspect-4/5"
        >
          <img
            src="/begena-hero.jpg"
            alt="A Begena, the traditional Ethiopian ten-stringed lyre"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>

      <section className="border-t border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 divide-x divide-border text-center">
          <div>
            <StatCounter value={5} label="Strings, one tradition" />
          </div>
          <div>
            <StatCounter value={100} suffix="%" label="Free, no accounts" />
          </div>
          <div>
            <StatCounter value={1} label="Home for Begena learners" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-widest text-muted font-medium mb-4"
        >
          How it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-3xl md:text-4xl text-ink font-medium mb-14 max-w-xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Everything you need, nothing you don't.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 24, delay: i * 0.08 }}
                className="bg-card rounded-card p-7 border border-border"
              >
                <div className="w-11 h-11 rounded-card bg-accent/15 flex items-center justify-center mb-6">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3
                  className="text-ink font-medium mb-2.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {f.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-5">{f.body}</p>
                <Link to="/catalogue" className="inline-flex items-center gap-1 text-sm text-ink font-medium">
                  Learn more
                  <ArrowUpRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-ink py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="max-w-2xl mx-auto px-6 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-7">
            <Music size={20} className="text-accent" />
          </div>
          <h2
            className="text-3xl md:text-4xl text-white font-medium mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Start learning today.
          </h2>
          <p className="text-white/60 mb-8">Free, no sign-up, built for exactly this.</p>
          <Link to="/catalogue">
            <Button>
              <span className="flex items-center gap-2">
                Browse the catalogue
                <ArrowRight size={16} />
              </span>
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between">
        <span className="text-sm text-muted">Begenarxiv</span>
        <span className="text-sm text-muted">Free and open, for Begena learners.</span>
      </footer>
    </div>
  );
}