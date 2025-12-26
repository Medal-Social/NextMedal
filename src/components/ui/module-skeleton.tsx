import { Section } from '@/components/ui/section';
import { Skeleton } from '@/components/ui/skeleton';

export function HeroSkeleton() {
  return (
    <Section spacing="relaxed">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 lg:pt-4">
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <div className="flex gap-4 mt-8">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
        <Skeleton className="aspect-video rounded-xl" />
      </div>
    </Section>
  );
}

export function FeaturesSkeleton() {
  return (
    <Section>
      <div className="space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-2/3 mx-auto" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-8 rounded-3xl border border-border space-y-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function LogoCloudSkeleton() {
  return (
    <Section>
      <div className="space-y-8 text-center">
        <Skeleton className="h-6 w-48 mx-auto" />
        <div className="flex flex-wrap items-center justify-center gap-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-32" />
          ))}
        </div>
      </div>
    </Section>
  );
}

export function PricingListSkeleton() {
  return (
    <Section>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-10 w-48 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-8 rounded-lg border border-border space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-10 w-full" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function TeamSkeleton() {
  return (
    <Section>
      <div className="space-y-12">
        <div className="text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function ContactSkeleton() {
  return (
    <Section>
      <div className="space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div className="space-y-6 p-8 rounded-3xl border border-border">
            <Skeleton className="h-8 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-10">
            <div className="p-8 rounded-3xl border border-border space-y-6">
              <Skeleton className="h-8 w-40" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

const skeletonMap: Record<string, React.ComponentType> = {
  hero: HeroSkeleton,
  features: FeaturesSkeleton,
  'logo-cloud': LogoCloudSkeleton,
  'pricing-list': PricingListSkeleton,
  team: TeamSkeleton,
  contact: ContactSkeleton,
};

export function ModuleSkeleton({ type }: { type: string }) {
  const SkeletonComponent = skeletonMap[type];

  if (!SkeletonComponent) {
    // Default skeleton for unknown module types
    return (
      <Section>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </Section>
    );
  }

  return <SkeletonComponent />;
}
