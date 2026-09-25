import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, onClick, variant = 'primary' }: Props) {
  const styles =
    variant === 'primary'
      ? 'bg-white text-ink'
      : 'liquid-glass text-white';

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${styles} text-sm font-medium px-5 py-2.5 rounded-pill`}
    >
      {children}
    </motion.button>
  );
}