import { Skeleton } from '@/components/ui/skeleton';

export function CommunityGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col h-full rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          {/* Image skeleton */}
          <div className="relative h-44">
            <Skeleton className="w-full h-full rounded-none" />
            {/* Members badge skeleton */}
            <div className="absolute bottom-3 left-3">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="flex flex-col flex-1 p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />

            {/* Tags skeleton */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>

            {/* Footer skeleton */}
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
