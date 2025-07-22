
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MatchHistoryClient from '@/components/match-history-client';

export const metadata: Metadata = {
  title: 'Match History - Venusespor Cafe',
  description: 'View your gaming match history and performance statistics'
};

export const dynamic = "force-dynamic";

export default async function MatchHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Match History</h1>
          <p className="text-slate-300">Track your gaming performance across all supported games</p>
        </div>
        
        <MatchHistoryClient />
      </div>
    </div>
  );
}
