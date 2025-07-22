
import { Metadata } from 'next';
import { GizmoDashboard } from '@/components/gizmo-dashboard';

export const metadata: Metadata = {
  title: 'Gizmo Dashboard - Venusespor Gaming Cafe',
  description: 'Real-time Gizmo sistem durumu, kullanıcı bilgileri ve PC durumları',
};

export default function GizmoDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        <GizmoDashboard />
      </div>
    </div>
  );
}
