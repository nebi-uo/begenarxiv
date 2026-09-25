import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import GhostText from '../components/GhostText';

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-ink">
      {/* Full-bleed hero photo — replace client/public/begena-hero.jpg with your real photo */}
      <img
        src="../begena-hero.png"
        alt="A Begena, the traditional Ethiopian ten-stringed lyre"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Bottom gradient so the glass card and text stay legible over the photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-0 flex items-center overflow-hidden">
        <GhostText>BEGENARXIV</GhostText>
      </div>

      {/* Floating glass nav */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="liquid-glass absolute top-6 left-6 z-20 rounded-pill px-6 py-3"
      >
        <span
          className="text-lg text-white tracking-tight font-medium"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Begenarxiv
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.08 }}
        className="absolute top-6 right-6 z-20"
      >
        <Link
          to="/catalogue"
          className="liquid-glass rounded-pill px-5 py-2 text-sm text-white font-medium flex items-center gap-1.5"
        >
          Enter app <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* Content anchored low, floating over the image as a glass card */}
      <div className="absolute bottom-12 right-6 md:right-80 z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.15 }}
          className="liquid-glass rounded-card max-w-[280px] p-5"
        >
          <span className="text-[8px] uppercase tracking-widest text-white/70 font-medium mb-2 block">
            For every Begena learner
          </span>
          <h1
            className="text-lg leading-snug text-white font-medium mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Learn Begena
          </h1>
          <p className="text-white/70 text-[10px] mb-4 leading-relaxed">
            Accurate mezmur material, and a way to actually hear how a song is played.
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-1.5 bg-white text-ink px-3 py-1 rounded-pill text-[10px] font-medium"
          >
            Browse the catalogue <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}