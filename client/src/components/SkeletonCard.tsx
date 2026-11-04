export default function SkeletonCard() {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-xs animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-100" />
        <div className="w-6 h-6 rounded-full bg-zinc-100" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-zinc-200 rounded w-3/4" />
        <div className="h-3 bg-zinc-100 rounded w-1/2" />
      </div>
      <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
        <div className="h-2 bg-zinc-100 rounded w-16" />
        <div className="h-4 bg-zinc-100 rounded-full w-12" />
      </div>
    </div>
  );
}
