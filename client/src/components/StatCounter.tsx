import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Props {
  value: number;
  label: string;
  suffix?: string;
}

export default function StatCounter({ value, label, suffix = '' }: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic — starts fast, settles gently, feels intentional rather than linear
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <p className="text-4xl md:text-5xl text-ink font-medium" style={{ fontFamily: 'var(--font-display)' }}>
        {count}{suffix}
      </p>
      <p className="text-muted text-sm mt-1">{label}</p>
    </motion.div>
  );
}