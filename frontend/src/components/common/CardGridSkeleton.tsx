interface CardGridSkeletonProps {
  count?: number
}

export default function CardGridSkeleton({ count = 10 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
          <div className="aspect-[2.5/3.5] bg-slate-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-5 bg-slate-200 rounded w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}
