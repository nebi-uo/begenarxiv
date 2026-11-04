import { motion } from 'framer-motion';
import PixelBegena from './PixelBegena';

interface Props {
  message?: string;
  subMessage?: string;
}

export default function IndiePageLoader({
  message = 'TUNING STRINGS...',
  subMessage = 'SYNCING NUMBERS NOTATION',
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="retro-indie-box p-6 max-w-sm w-full bg-white text-zinc-950 font-mono text-xs select-none"
      >
        {/* Retro Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-zinc-950 pb-2 mb-4">
          <div className="flex items-center gap-2">
            <PixelBegena size="icon" />
            <span className="font-bold tracking-wider">BEGENARXIV_SYS</span>
          </div>
          <span className="text-[10px] bg-zinc-950 text-white px-1.5 py-0.5">ROM_1.0</span>
        </div>

        {/* Pixel Harp String Animation */}
        <div className="py-4 flex items-center justify-center gap-3 my-2 bg-zinc-50 border border-zinc-200">
          {[1, 2, 3, 4, 5].map((strNum, i) => (
            <div key={strNum} className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] text-zinc-500 font-bold">[{strNum}]</span>
              <motion.div
                animate={{
                  scaleY: [0.4, 1.2, 0.5, 1, 0.4],
                  backgroundColor: ['#09090B', '#71717A', '#09090B'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.1,
                  delay: i * 0.16,
                  ease: 'easeInOut',
                }}
                className="w-1 h-12 bg-zinc-950 origin-bottom"
              />
            </div>
          ))}
        </div>

        {/* Status Text with Typing Cursor */}
        <div className="mt-4 mb-3 space-y-1">
          <div className="flex items-center gap-1 text-zinc-950 font-bold">
            <span>&gt; {message}</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-3.5 bg-zinc-950"
            />
          </div>
          <p className="text-[10px] text-zinc-500">{subMessage}</p>
        </div>

        {/* Retro Progress Bar */}
        <div className="border border-zinc-950 p-0.5 mt-2 bg-zinc-100">
          <motion.div
            initial={{ width: '15%' }}
            animate={{ width: ['15%', '45%', '80%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
            className="h-2 bg-zinc-950"
          />
        </div>
      </motion.div>
    </div>
  );
}
