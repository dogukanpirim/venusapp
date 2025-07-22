
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import GamificationDashboard from '@/components/gamification/gamification-dashboard';

export default async function GamificationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🎮 Gamification Center
          </h1>
          <p className="text-muted-foreground text-lg">
            XP kazan, görevleri tamamla ve eğlenceli kartları topla!
          </p>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-card/50 rounded-lg animate-pulse" />
            ))}
          </div>
        }>
          <GamificationDashboard />
        </Suspense>
      </div>
    </div>
  );
}
