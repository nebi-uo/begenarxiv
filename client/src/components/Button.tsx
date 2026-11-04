import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  className?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}: Props) {
  let variantStyles = 'bg-zinc-950 hover:bg-zinc-800 text-white border border-zinc-900';

  if (variant === 'secondary') {
    variantStyles = 'bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 shadow-xs';
  } else if (variant === 'accent') {
    variantStyles = 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-600 shadow-xs';
  } else if (variant === 'outline') {
    variantStyles = 'bg-transparent hover:bg-zinc-100 text-zinc-900 border border-zinc-300';
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full cursor-pointer transition-colors duration-150 ${variantStyles} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
