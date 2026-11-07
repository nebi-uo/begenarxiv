/**
 * Reusable Minimalist Indie Skeleton Loaders
 * Designed specifically for Begenarxiv's monochrome aesthetic.
 */

export function CatalogueSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-3 w-full sm:w-2/3">
            <div className="h-8 bg-zinc-200 rounded w-1/2" />
            <div className="h-4 bg-zinc-100 rounded w-4/5" />
            <div className="flex items-center gap-3 pt-1">
              <div className="h-3 bg-zinc-100 rounded w-20" />
              <div className="h-3 bg-zinc-100 rounded w-16" />
              <div className="h-3 bg-zinc-100 rounded w-24" />
            </div>
          </div>
          <div className="h-9 bg-zinc-200 rounded w-36 shrink-0" />
        </div>
      </div>

      {/* Filter Chips Bar Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className="h-6 w-12 bg-zinc-100 rounded" />
          <div className="h-6 w-16 bg-zinc-200 rounded" />
          <div className="h-6 w-16 bg-zinc-100 rounded" />
          <div className="h-6 w-20 bg-zinc-100 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 bg-zinc-100 rounded" />
          <div className="h-6 w-20 bg-zinc-100 rounded" />
        </div>
      </div>

      {/* Search Input Skeleton */}
      <div className="h-11 bg-zinc-100 border border-zinc-200 rounded-lg w-full" />

      {/* 6-Card Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-zinc-100 rounded w-14" />
              <div className="h-4 bg-zinc-200 rounded w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-zinc-200 rounded w-4/5" />
              <div className="h-3 bg-zinc-100 rounded w-2/5" />
            </div>
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <div className="h-3 bg-zinc-100 rounded w-20" />
              <div className="h-4 bg-zinc-200 rounded-full w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MezmurPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-zinc-200 rounded w-28" />
        <div className="h-4 bg-zinc-100 rounded w-24" />
      </div>

      {/* Header Card Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-5 bg-zinc-200 rounded w-20" />
          <div className="h-5 bg-zinc-100 rounded w-24" />
        </div>
        <div className="h-9 bg-zinc-200 rounded w-3/5" />
        <div className="flex items-center gap-3">
          <div className="h-4 bg-zinc-100 rounded w-32" />
          <div className="h-4 bg-zinc-100 rounded w-40" />
        </div>
      </div>

      {/* Tap-To-Hear Player Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div className="space-y-1.5">
            <div className="h-5 bg-zinc-200 rounded w-44" />
            <div className="h-3 bg-zinc-100 rounded w-56" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 bg-zinc-200 rounded w-24" />
            <div className="h-8 bg-zinc-100 rounded w-20" />
          </div>
        </div>

        {/* 5 Vertical Strings Skeleton */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 flex justify-around items-end h-48">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-1 bg-zinc-200 rounded-full h-32" />
              <div className="w-6 h-6 bg-zinc-200 rounded-full" />
            </div>
          ))}
        </div>

        {/* Notation Lines Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((l) => (
            <div key={l} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center gap-2">
              <div className="h-3 w-6 bg-zinc-200 rounded" />
              <div className="h-7 w-10 bg-zinc-200 rounded" />
              <div className="h-7 w-10 bg-zinc-100 rounded" />
              <div className="h-7 w-10 bg-zinc-200 rounded" />
              <div className="h-7 w-6 bg-zinc-100 rounded" />
              <div className="h-7 w-10 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Lyrics & Video Split Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
          <div className="h-5 bg-zinc-200 rounded w-24" />
          <div className="space-y-2">
            <div className="h-4 bg-zinc-100 rounded w-full" />
            <div className="h-4 bg-zinc-100 rounded w-5/6" />
            <div className="h-4 bg-zinc-100 rounded w-4/6" />
            <div className="h-4 bg-zinc-100 rounded w-full" />
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
          <div className="h-5 bg-zinc-200 rounded w-32" />
          <div className="h-48 bg-zinc-100 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
}

export function DashboardTableSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs animate-pulse">
      <div className="divide-y divide-zinc-200">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-zinc-200 rounded w-48" />
                <div className="h-4 bg-zinc-100 rounded w-16" />
                <div className="h-4 bg-zinc-100 rounded w-20" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 bg-zinc-100 rounded w-28" />
                <div className="h-3 bg-zinc-100 rounded w-36" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 bg-zinc-200 rounded w-24" />
              <div className="h-8 bg-zinc-100 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PendingReviewsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="p-5 border border-zinc-200 rounded-xl bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 bg-zinc-200 rounded w-52" />
                <div className="h-4 bg-zinc-100 rounded w-16" />
                <div className="h-4 bg-zinc-100 rounded w-20" />
              </div>
              <div className="h-3 bg-zinc-100 rounded w-40" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 bg-zinc-200 rounded w-36" />
              <div className="h-9 bg-zinc-100 rounded w-18" />
            </div>
          </div>
          <div className="h-20 bg-zinc-50 border border-zinc-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function RequestsSkeleton() {
  return (
    <div className="divide-y divide-zinc-100 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-zinc-200 rounded w-44" />
              <div className="h-3 bg-zinc-100 rounded w-14" />
            </div>
            <div className="h-3 bg-zinc-100 rounded w-32" />
            <div className="h-3 bg-zinc-100 rounded w-64" />
          </div>
          <div className="h-8 bg-zinc-200 rounded w-28 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ContributeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-6xl mx-auto py-2">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-zinc-200 rounded w-28" />
        <div className="h-4 bg-zinc-100 rounded w-36" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-3">
        <div className="h-8 bg-zinc-200 rounded w-1/3" />
        <div className="h-4 bg-zinc-100 rounded w-2/3" />
      </div>

      {/* Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 rounded w-24" />
                <div className="h-10 bg-zinc-100 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 rounded w-24" />
                <div className="h-10 bg-zinc-100 rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 bg-zinc-200 rounded w-28" />
              <div className="h-10 bg-zinc-100 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 rounded w-20" />
                <div className="h-10 bg-zinc-100 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 rounded w-20" />
                <div className="h-10 bg-zinc-100 rounded" />
              </div>
            </div>

            {/* Lyrics Section */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-zinc-200 rounded w-28" />
                <div className="h-6 bg-zinc-100 rounded w-32" />
              </div>
              <div className="h-28 bg-zinc-50 border border-zinc-200 rounded-lg" />
            </div>

            {/* Notation Section */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-zinc-200 rounded w-36" />
                <div className="h-6 bg-zinc-100 rounded w-44" />
              </div>
              <div className="h-28 bg-zinc-50 border border-zinc-200 rounded-lg" />
            </div>

            <div className="h-12 bg-zinc-200 rounded-lg w-full" />
          </div>
        </div>

        {/* Right Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
            <div className="h-4 bg-zinc-200 rounded w-36" />
            <div className="h-48 bg-zinc-50 border border-zinc-100 rounded-lg" />
            <div className="h-10 bg-zinc-100 rounded w-full" />
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-3">
            <div className="h-4 bg-zinc-200 rounded w-28" />
            <div className="h-3 bg-zinc-200/60 rounded w-full" />
            <div className="h-3 bg-zinc-200/60 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequestPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-zinc-200 rounded w-24" />
        <div className="h-5 bg-zinc-100 rounded w-28" />
      </div>

      {/* Hero Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-3 shadow-xs">
        <div className="h-7 bg-zinc-200 rounded w-48" />
        <div className="h-4 bg-zinc-100 rounded w-4/5" />
      </div>

      {/* Form Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="space-y-2">
          <div className="h-3 bg-zinc-200 rounded w-24" />
          <div className="h-10 bg-zinc-100 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-zinc-200 rounded w-28" />
            <div className="h-10 bg-zinc-100 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-zinc-200 rounded w-36" />
            <div className="h-10 bg-zinc-100 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-zinc-200 rounded w-24" />
            <div className="h-10 bg-zinc-100 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-zinc-200 rounded w-24" />
            <div className="h-10 bg-zinc-100 rounded" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-zinc-200 rounded w-28" />
          <div className="h-20 bg-zinc-50 border border-zinc-200 rounded" />
        </div>

        <div className="h-11 bg-zinc-200 rounded-lg w-full" />
      </div>

      {/* Queue Table Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="h-4 bg-zinc-200 rounded w-40" />
        <RequestsSkeleton />
      </div>
    </div>
  );
}

