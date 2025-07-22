
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProfileDashboard } from '@/components/profile-dashboard';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  let user;
  
  try {
    // Get user and player data
    user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: {
        player: {
          include: {
            gizmoProfile: {
              include: {
                sessions: {
                  take: 5,
                  orderBy: { startTime: 'desc' },
                  where: {
                    status: 'COMPLETED'
                  }
                },
                transactions: {
                  take: 10,
                  orderBy: { createdAt: 'desc' }
                },
                activities: {
                  take: 20,
                  orderBy: { timestamp: 'desc' }
                }
              }
            },
            stats: {
              include: {
                game: true
              }
            },
            achievements: {
              include: {
                achievement: true
              },
              orderBy: { unlockedAt: 'desc' },
              take: 5
            }
          }
        },
        lootboxOpenings: {
          include: {
            reward: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  } catch (error) {
    console.error('Profile page database error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-green-900/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Veritabanı Hatası</h1>
          <p className="text-gray-400 mb-4">
            Profil bilgileri yüklenirken bir sorun yaşandı. Lütfen daha sonra tekrar deneyin.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-green-900/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Üye Profili
          </h1>
          <p className="text-gray-400">
            Oyun istatistikleriniz, harcamalarınız ve aktiviteleriniz
          </p>
        </div>
        <ProfileDashboard user={user} />
      </div>
    </div>
  );
}
