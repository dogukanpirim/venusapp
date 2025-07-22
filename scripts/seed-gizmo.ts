

import { PrismaClient } from '@prisma/client';
import { GizmoActivityType, GizmoTransactionType, GizmoSessionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGizmoData() {
  console.log('🎮 Starting Gizmo mock data seeding...');

  try {
    // Clear all existing Gizmo data first
    await prisma.gizmoActivity.deleteMany({});
    await prisma.gizmoTransaction.deleteMany({});
    await prisma.gizmoSession.deleteMany({});
    await prisma.gizmoProfile.deleteMany({});
    console.log('🧹 Cleared existing Gizmo data');

    // Find existing players
    const players = await prisma.player.findMany({
      include: { user: true },
    });

    if (players.length === 0) {
      console.log('❌ No players found. Please run main seed first.');
      return;
    }

    // Create Gizmo profiles for each player
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const isAdmin = player.user?.email === 'admin@venusespor.com';
      const isDemoUser = player.user?.email === 'john@doe.com';

      console.log(`Creating Gizmo profile for ${player.displayName}...`);

      // Create unique gizmoUserId for each player
      const gizmoUserId = 1000 + i + 1; // Start from 1001

      // Create demo-specific data for John Doe
      const profileData = isDemoUser ? {
        playerId: player.id,
        gizmoUserId,
        username: player.gamertag,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+90 555 123-4567',
        birthDate: new Date(1990, 5, 15), // June 15, 1990
        currentBalance: 750.0, // High balance for demo
        totalDeposits: 5000.0, // Substantial deposit history
        totalSpending: 4250.0, // Good spending history
        creditLimit: 1500.0, // High credit limit
        totalPlayTime: 8640, // 144 hours (6 days) of gaming
        totalSessions: 320, // Many sessions
        averageSession: 162, // 2.7 hours average
        lastActiveDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        membershipType: 'VIP',
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        loyaltyPoints: 2500, // High loyalty points
      } : {
        playerId: player.id,
        gizmoUserId,
        username: player.gamertag,
        firstName: player.displayName.split(' ')[0] || 'User',
        lastName: player.displayName.split(' ')[1] || 'Player',
        phone: `+90 555 ${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
        birthDate: new Date(1990 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        currentBalance: isAdmin ? 500.0 : Math.random() * 200 + 50,
        totalDeposits: Math.random() * 2000 + 500,
        totalSpending: Math.random() * 1500 + 300,
        creditLimit: isAdmin ? 1000.0 : 500.0,
        totalPlayTime: Math.floor(Math.random() * 5000 + 1000),
        totalSessions: Math.floor(Math.random() * 200 + 50),
        averageSession: Math.random() * 120 + 60,
        lastActiveDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        membershipType: isAdmin ? 'VIP' : ['Standard', 'Premium', 'VIP'][Math.floor(Math.random() * 3)],
        membershipExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
        loyaltyPoints: Math.floor(Math.random() * 1000 + 100),
      };

      const gizmoProfile = await prisma.gizmoProfile.create({
        data: profileData,
      });

      // Create mock sessions (last 30 days) - More sessions for demo user
      const sessionCount = isDemoUser ? 45 : Math.floor(Math.random() * 20 + 10);
      for (let s = 0; s < sessionCount; s++) {
        const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const duration = isDemoUser ?
          Math.floor(Math.random() * 240 + 60) : // 1-5 hours for demo user
          Math.floor(Math.random() * 180 + 30); // 30-210 minutes for others
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        const ratePerMinute = Math.random() * 2 + 1; // 1-3 TL per minute
        const totalCost = duration * ratePerMinute;
        const discount = isDemoUser ? Math.random() * 30 : Math.random() * 20; // More discount for demo
        const finalCost = totalCost * (1 - discount / 100);

        const session = await prisma.gizmoSession.create({
          data: {
            profileId: gizmoProfile.id,
            sessionId: `SESS_${Date.now()}_${s}`,
            computerName: isDemoUser ?
              ['PC-VIP-001', 'PC-VIP-002', 'PC-001', 'PS5-001'][Math.floor(Math.random() * 4)] :
              ['PC-001', 'PC-002', 'PC-003', 'PS5-001', 'PS5-002'][Math.floor(Math.random() * 5)],
            zoneName: isDemoUser ?
              ['VIP Zone', 'PC Zone', 'PS5 Zone'][Math.floor(Math.random() * 3)] :
              ['PC Zone', 'PS5 Zone', 'VIP Zone'][Math.floor(Math.random() * 3)],
            startTime,
            endTime: startTime < new Date(Date.now() - 60 * 60 * 1000) ? endTime : null,
            duration: startTime < new Date(Date.now() - 60 * 60 * 1000) ? duration : null,
            pausedDuration: Math.floor(Math.random() * 10),
            status: startTime < new Date(Date.now() - 60 * 60 * 1000) ? 'COMPLETED' : (Math.random() > 0.8 ? 'ACTIVE' : 'COMPLETED'),
            ratePerMinute,
            totalCost,
            discountAmount: discount,
            finalCost,
            applicationsUsed: isDemoUser ?
              ['Valorant', 'CS2', 'League of Legends', 'FIFA 24', 'Call of Duty', 'Rocket League'].slice(0, Math.floor(Math.random() * 4) + 2) :
              ['Valorant', 'CS2', 'League of Legends', 'FIFA 24', 'Call of Duty'].slice(0, Math.floor(Math.random() * 3) + 1),
            bandwidth: isDemoUser ? Math.random() * 1500 + 500 : Math.random() * 1000 + 200, // Better bandwidth for demo user
          },
        });

        // Create activities for this session - More activities for demo user
        const activityCount = isDemoUser ? Math.floor(Math.random() * 8 + 5) : Math.floor(Math.random() * 5 + 3);
        for (let a = 0; a < activityCount; a++) {
          const activityTypes = Object.values(GizmoActivityType);
          const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
          await prisma.gizmoActivity.create({
            data: {
              profileId: gizmoProfile.id,
              sessionId: session.id,
              type: activityType,
              title: getActivityTitle(activityType),
              description: getActivityDescription(activityType),
              computerName: session.computerName,
              zoneName: session.zoneName,
              applicationName: activityType.includes('GAME') ?
                (isDemoUser ?
                  ['Valorant', 'CS2', 'League of Legends', 'Rocket League', 'FIFA 24'][Math.floor(Math.random() * 5)] :
                  ['Valorant', 'CS2', 'League of Legends'][Math.floor(Math.random() * 3)]
                ) : undefined,
              duration: Math.floor(Math.random() * 300 + 60),
              value: activityType.includes('PURCHASE') ? Math.random() * 50 + 10 : undefined,
              timestamp: new Date(startTime.getTime() + Math.random() * duration * 60 * 1000),
            },
          });
        }
      }

      // Create mock transactions (last 60 days) - More transactions for demo user
      const transactionCount = isDemoUser ? 60 : Math.floor(Math.random() * 30 + 15);
      let currentBalance = gizmoProfile.currentBalance;

      for (let t = 0; t < transactionCount; t++) {
        const transactionTypes = Object.values(GizmoTransactionType);
        const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const amount = getTransactionAmount(transactionType, isDemoUser);
        const balanceBefore = currentBalance;

        if (transactionType === 'DEPOSIT' || transactionType === 'REFUND') {
          currentBalance += amount;
        } else {
          currentBalance -= amount;
        }

        await prisma.gizmoTransaction.create({
          data: {
            profileId: gizmoProfile.id,
            transactionId: `TXN_${Date.now()}_${t}`,
            type: transactionType,
            amount: Math.abs(amount),
            description: getTransactionDescription(transactionType),
            paymentMethod: isDemoUser ?
              ['Card', 'Online', 'Cash', 'Credit'][Math.floor(Math.random() * 4)] :
              ['Cash', 'Card', 'Online', 'Credit'][Math.floor(Math.random() * 4)],
            referenceNumber: `REF${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
            productName: getProductName(transactionType),
            productCategory: getProductCategory(transactionType),
            quantity: transactionType.includes('PRODUCT') ? Math.floor(Math.random() * 3) + 1 : 1,
            unitPrice: transactionType.includes('PRODUCT') ? Math.random() * 30 + 5 : undefined,
            isSuccessful: isDemoUser ? Math.random() > 0.02 : Math.random() > 0.05, // Higher success rate for demo
            balanceBefore,
            balanceAfter: currentBalance,
            operatorName: ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Can', 'Zeynep'][Math.floor(Math.random() * 6)],
            locationId: 'VENUS_CAFE_001',
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          },
        });
      }

      console.log(`✅ Created Gizmo profile for ${player.displayName} with ${sessionCount} sessions and ${transactionCount} transactions`);
    }

    console.log('🎉 Gizmo mock data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Gizmo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getActivityTitle(type: GizmoActivityType): string {
  const titles = {
    LOGIN: 'Oturum Açıldı',
    LOGOUT: 'Oturum Kapatıldı',
    GAME_START: 'Oyun Başlatıldı',
    GAME_END: 'Oyun Sonlandırıldı',
    PURCHASE: 'Satın Alma',
    PAYMENT: 'Ödeme Yapıldı',
    TIME_EXTEND: 'Süre Uzatıldı',
    PAUSE: 'Oturum Duraklatıldı',
    RESUME: 'Oturum Devam Ettirildi',
    ADMIN_ACTION: 'Admin İşlemi',
    BALANCE_UPDATE: 'Bakiye Güncellendi',
  };
  return titles[type] || 'Bilinmeyen Aktivite';
}

function getActivityDescription(type: GizmoActivityType): string {
  const descriptions = {
    LOGIN: 'Kullanıcı sisteme giriş yaptı',
    LOGOUT: 'Kullanıcı sistemden çıkış yaptı',
    GAME_START: 'Oyun uygulaması başlatıldı',
    GAME_END: 'Oyun uygulaması kapatıldı',
    PURCHASE: 'Ürün satın alma işlemi gerçekleştirildi',
    PAYMENT: 'Ödeme işlemi tamamlandı',
    TIME_EXTEND: 'Oturum süresi uzatıldı',
    PAUSE: 'Oturum geçici olarak duraklatıldı',
    RESUME: 'Duraklatılan oturum devam ettirildi',
    ADMIN_ACTION: 'Yönetici tarafından işlem yapıldı',
    BALANCE_UPDATE: 'Hesap bakiyesi güncellendi',
  };
  return descriptions[type] || 'Detay bilgisi mevcut değil';
}

function getTransactionAmount(type: GizmoTransactionType, isDemoUser: boolean = false): number {
  const multiplier = isDemoUser ? 1.5 : 1; // Demo user has higher amounts
  
  switch (type) {
    case 'DEPOSIT':
      return (Math.random() * 200 + 50) * multiplier; // 50-250 TL (demo: 75-375 TL)
    case 'TIME_PURCHASE':
      return (Math.random() * 100 + 20) * multiplier; // 20-120 TL
    case 'PRODUCT_PURCHASE':
      return (Math.random() * 50 + 5) * multiplier; // 5-55 TL
    case 'SERVICE_FEE':
      return (Math.random() * 10 + 2) * multiplier; // 2-12 TL
    case 'REFUND':
      return (Math.random() * 50 + 10) * multiplier; // 10-60 TL
    case 'ADJUSTMENT':
      return (Math.random() * 30 + 5) * multiplier; // 5-35 TL
    default:
      return (Math.random() * 25 + 5) * multiplier; // 5-30 TL
  }
}

function getTransactionDescription(type: GizmoTransactionType): string {
  const descriptions = {
    DEPOSIT: 'Hesaba para yatırma',
    PURCHASE: 'Genel satın alma',
    REFUND: 'Para iadesi',
    ADJUSTMENT: 'Bakiye düzeltmesi',
    TIME_PURCHASE: 'Oyun süresi satın alma',
    PRODUCT_PURCHASE: 'Ürün satın alma',
    SERVICE_FEE: 'Hizmet bedeli',
  };
  return descriptions[type] || 'İşlem açıklaması';
}

function getProductName(type: GizmoTransactionType): string | undefined {
  if (type === 'PRODUCT_PURCHASE') {
    const products = ['Çay', 'Kahve', 'Kola', 'Su', 'Sandviç', 'Tost', 'Burger', 'Pizza Dilimi', 'Cips', 'Çikolata', 'Energy Drink', 'Ayran', 'Meyve Suyu'];
    return products[Math.floor(Math.random() * products.length)];
  }
  if (type === 'TIME_PURCHASE') {
    return 'Oyun Süresi';
  }
  return undefined;
}

function getProductCategory(type: GizmoTransactionType): string | undefined {
  if (type === 'PRODUCT_PURCHASE') {
    const categories = ['İçecek', 'Yiyecek', 'Atıştırmalık', 'Sıcak İçecek', 'Soğuk İçecek'];
    return categories[Math.floor(Math.random() * categories.length)];
  }
  if (type === 'TIME_PURCHASE') {
    return 'Gaming';
  }
  return undefined;
}

// Run if called directly
if (require.main === module) {
  seedGizmoData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedGizmoData };

