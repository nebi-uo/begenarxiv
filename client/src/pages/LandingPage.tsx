import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, BookOpen, Sparkles } from 'lucide-react';
import BegenaStrings from '../components/BegenaStrings';
import Button from '../components/Button';

const features = [
  {
    icon: BookOpen,
    color: '#4F86C6',
    title: 'A catalogue you can trust',
    body: 'Browse by artist or by tune. Every mezmur gets its own page — lyrics, numbers, and a reference video, done properly.',
  },
  {
    icon: Music,
    color: '#F2A93B',
    title: 'Hear how it\u2019s actually played',
    body: 'Tap through a song\u2019s numbers and hear each string, in sequence, highlighted as it plays. Not just what notes — how they sound together.',
  },
  {
    icon: Sparkles,
    color: '#1FAE7A',
    title: 'Built for learners, by learners',
    body: 'Free, and built to grow with the community around it — starting with the two things that make learning Begena hardest.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-lg text-ink tracking-tight">Begenarxiv</span>
        <Link to="/catalogue" className="text-sm text-muted">Enter app →</Link>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <h1 className="text-5xl leading-tight text-ink mb-6 font-medium">
            Learn Begena. <span className="text-accent">Properly.</span>
          </h1>
          <p className="text-muted text-lg mb-8 max-w-md">
            A free home for Begena players — accurate mezmur material, and a way to actually
            hear how a song is played, not just read its numbers.
          </p>
          <Link to="/catalogue">
            <Button>Browse the catalogue</Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
          className="w-full max-w-xs mx-auto"
        >
          <BegenaStrings />
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, delay: i * 0.1 }}
            className="bg-card rounded-card p-6 shadow-sm"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${f.color}1A` }}
            >
              <f.icon size={18} color={f.color} />
            </div>
            <h3 className="text-ink font-medium mb-2">{f.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}