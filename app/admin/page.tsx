
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Header } from '@/components/header';
import { AdminDashboard } from '@/components/admin-dashboard';

export const dynamic = "force-dynamic";

async function getAdminData() {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        products: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return { zones, contacts };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return { zones: [], contacts: [] };
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/auth/signin');
  }

  const { zones, contacts } = await getAdminData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <AdminDashboard zones={zones} contacts={contacts} />
      </main>
    </div>
  );
}
