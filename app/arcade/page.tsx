
import { Suspense } from 'react';
import { ArcadeDashboard } from '@/components/arcade-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Arcade Dashboard - Venusespor Cafe',
  description: 'Gaming statistics, leaderboards, and achievements',
};

export default function ArcadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎮 Arcade Dashboard
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Track your gaming performance, climb the leaderboards, and complete challenges across multiple games
          </p>
        </div>

        <Suspense fallback={<ArcadeDashboardSkeleton />}>
          <ArcadeDashboard />
        </Suspense>
      </div>
    </div>
  );
}

function ArcadeDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-60 rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
