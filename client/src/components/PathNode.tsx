import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  index: number;
  onClick: () => void;
}

const difficultyColor: Record<string, string> = {
  beginner: '#1FAE7A',
  intermediate: '#F2A93B',
  advanced: '#D9534F',
};

export default function PathNode({ title, subtitle, difficulty, index, onClick }: Props) {
  // Alternate left/right offset to create the winding trail effect
  const isEven = index % 2 === 0;
  const ringColor = difficulty ? difficultyColor[difficulty] : '#C9C7C2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.08 }}
      className={`flex items-center gap-4 ${isEven ? 'flex-row' : 'flex-row-reverse text-right'}`}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="w-16 h-16 rounded-full bg-card shrink-0 flex items-center justify-center shadow-md"
        style={{ border: `3px solid ${ringColor}` }}
      >
        <Music size={22} color={ringColor} />
      </motion.button>

      <div className="min-w-0">
        <p className="text-ink font-medium truncate" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </p>
        <p className="text-muted text-sm truncate">{subtitle}</p>
      </div>
    </motion.div>
  );
}