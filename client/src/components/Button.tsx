import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}: Props) {
  let variantStyles = 'bg-zinc-950 hover:bg-zinc-800 text-white border border-zinc-950';

  if (variant === 'secondary') {
    variantStyles = 'bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 hover:border-zinc-950';
  } else if (variant === 'accent') {
    variantStyles = 'bg-zinc-950 hover:bg-zinc-800 text-white border border-zinc-950';
  } else if (variant === 'outline') {
    variantStyles = 'bg-transparent hover:bg-zinc-50 text-zinc-900 border border-zinc-200 hover:border-zinc-900';
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 text-xs font-mono font-medium px-4 py-2 rounded-md cursor-pointer transition-colors duration-150 ${variantStyles} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
