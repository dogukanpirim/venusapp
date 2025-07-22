
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ComprehensiveDashboard from '@/components/admin/comprehensive-dashboard';

export default async function ComprehensiveAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // For now, allow any logged-in user to access admin panel
  // In production, you would check for admin role here
  // if (!session.user?.isAdmin) {
  //   redirect('/');
  // }

  return <ComprehensiveDashboard />;
}
