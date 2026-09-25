export default function SkeletonCard() {
  return (
    <div className="liquid-glass rounded-card p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-white/15 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/15 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}