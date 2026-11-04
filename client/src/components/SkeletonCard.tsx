export default function SkeletonCard() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-6 h-3 bg-zinc-200 rounded" />
        <div className="w-3 h-3 bg-zinc-200 rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-zinc-200 rounded w-2/3" />
        <div className="h-3 bg-zinc-100 rounded w-1/3" />
      </div>
      <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
        <div className="h-2 bg-zinc-100 rounded w-12" />
      </div>
    </div>
  );
}
