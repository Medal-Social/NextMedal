import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-brand-50 to-background dark:from-brand-900/20 dark:via-brand-800/10 dark:to-background" />
        <div className="relative section py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Skeleton className="h-4 w-24 mx-auto rounded-full bg-brand-200/50 dark:bg-brand-700/30" />
            <Skeleton className="h-12 md:h-16 w-3/4 mx-auto rounded-lg" />
            <Skeleton className="h-6 w-2/3 mx-auto rounded-md" />
            <div className="flex justify-center gap-4 pt-4">
              <Skeleton className="h-12 w-32 rounded-full" />
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="section py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loading indicator */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-lg">
          <div className="relative size-4">
            <div className="absolute inset-0 rounded-full border-2 border-brand-200 dark:border-brand-700" />
            <div className="absolute inset-0 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">Loading</span>
        </div>
      </div>
    </div>
  );
}
