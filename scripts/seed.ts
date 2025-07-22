
import { PrismaClient, LootBoxRewardType, LootBoxRarity } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
// import { seedGamification } from './seed-gamification';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Remove demo users - using Gizmo authentication only
  console.log('✅ Demo users removed - using Gizmo authentication only');

  // Create loot box rewards
  const rewards = [
    // COMMON rewards (70% chance)
    {
      name: '1 Saat Ücretsiz PC',
      description: '1 saatlik ücretsiz PC kullanım hakkı',
      icon: '⏰',
      image: null,
      type: LootBoxRewardType.FREE_HOURS,
      rarity: LootBoxRarity.COMMON,
      value: 1,
      quantity: 1,
      weight: 250, // High weight = more common
    },
    {
      name: 'Kahve Kuponu',
      description: 'Sıcak bir fincan kahve',
      icon: '☕',
      image: null,
      type: LootBoxRewardType.DRINK_COUPON,
      rarity: LootBoxRarity.COMMON,
      value: 15,
      quantity: 1,
      weight: 200,
    },
    {
      name: '50 Kredi',
      description: 'Cafe hesabınıza 50 TL kredi',
      icon: '💰',
      image: null,
      type: LootBoxRewardType.CREDITS,
      rarity: LootBoxRarity.COMMON,
      value: 50,
      quantity: 1,
      weight: 180,
    },
    {
      name: 'Su Kuponu',
      description: 'Soğuk su kuponu',
      icon: '💧',
      image: null,
      type: LootBoxRewardType.DRINK_COUPON,
      rarity: LootBoxRarity.COMMON,
      value: 5,
      quantity: 1,
      weight: 150,
    },

    // RARE rewards (20% chance)
    {
      name: '3 Saat Ücretsiz PC',
      description: '3 saatlik ücretsiz PC kullanım hakkı',
      icon: '🕐',
      image: null,
      type: 'FREE_HOURS',
      rarity: LootBoxRarity.RARE,
      value: 3,
      quantity: 1,
      weight: 80,
    },
    {
      name: '100 Kredi',
      description: 'Cafe hesabınıza 100 TL kredi',
      icon: '💸',
      image: null,
      type: LootBoxRewardType.CREDITS,
      rarity: LootBoxRarity.RARE,
      value: 100,
      quantity: 1,
      weight: 70,
    },
    {
      name: 'Sandviç Kuponu',
      description: 'Lezzetli sandviç kuponu',
      icon: '🥪',
      image: null,
      type: LootBoxRewardType.DRINK_COUPON,
      rarity: LootBoxRarity.RARE,
      value: 25,
      quantity: 1,
      weight: 60,
    },

    // EPIC rewards (8% chance)
    {
      name: '5 Saat Ücretsiz PC',
      description: '5 saatlik ücretsiz PC kullanım paketi',
      icon: '🎮',
      image: null,
      type: 'FREE_HOURS',
      rarity: LootBoxRarity.EPIC,
      value: 5,
      quantity: 1,
      weight: 25,
    },
    {
      name: '200 Kredi',
      description: 'Cafe hesabınıza 200 TL kredi',
      icon: '💎',
      image: null,
      type: LootBoxRewardType.CREDITS,
      rarity: LootBoxRarity.EPIC,
      value: 200,
      quantity: 1,
      weight: 20,
    },
    {
      name: 'Özel Turnuva Katılım',
      description: 'VIP turnuva katılım hakkı',
      icon: '🏆',
      image: null,
      type: LootBoxRewardType.TOURNAMENT_ENTRY,
      rarity: LootBoxRarity.EPIC,
      value: 1,
      quantity: 1,
      weight: 15,
    },

    // LEGENDARY rewards (2% chance)
    {
      name: '10 Saat Ücretsiz PC',
      description: '10 saatlik premium PC kullanım paketi',
      icon: '👑',
      image: null,
      type: 'FREE_HOURS',
      rarity: LootBoxRarity.LEGENDARY,
      value: 10,
      quantity: 1,
      weight: 8,
    },
    {
      name: '500 Kredi',
      description: 'Cafe hesabınıza 500 TL mega kredi',
      icon: '💰👑',
      image: null,
      type: LootBoxRewardType.CREDITS,
      rarity: LootBoxRarity.LEGENDARY,
      value: 500,
      quantity: 1,
      weight: 5,
    },
    {
      name: 'Özel Avatar',
      description: 'Efsanevi avatar ve badge',
      icon: '🌟',
      image: null,
      type: LootBoxRewardType.SPECIAL_ITEM,
      rarity: LootBoxRarity.LEGENDARY,
      value: 1,
      quantity: 1,
      weight: 2,
    },
    {
      name: 'PlayStation 5',
      description: '🎉 BÜYÜK İKRAMİYE! Sony PlayStation 5 Konsol + 2 Oyun hediye! Tebrikler!',
      icon: '🎮',
      image: 'https://i.ytimg.com/vi/Aj0oP2kOnGA/maxresdefault.jpg',
      type: LootBoxRewardType.SPECIAL_ITEM,
      rarity: LootBoxRarity.LEGENDARY,
      value: 15000, // PS5 value in TL
      quantity: 1,
      weight: 10, // ~1% drop chance
    },
  ];

  // Create rewards
  for (const reward of rewards) {
    await prisma.lootBoxReward.upsert({
      where: { 
        id: `${reward.name.toLowerCase().replace(/\s+/g, '-')}-${reward.rarity.toString().toLowerCase()}` 
      },
      update: reward as any,
      create: {
        id: `${reward.name.toLowerCase().replace(/\s+/g, '-')}-${reward.rarity.toString().toLowerCase()}`,
        ...reward,
      } as any,
    });
  }

  console.log('✅ Loot box rewards created');

  // Create some sample loot box config
  await prisma.lootBoxConfig.upsert({
    where: { key: 'max_daily_openings' },
    update: { value: '10' },
    create: {
      key: 'max_daily_openings',
      value: '10',
      description: 'Maximum loot boxes a user can open per day',
    },
  });

  await prisma.lootBoxConfig.upsert({
    where: { key: 'min_balance_requirement' },
    update: { value: '1' },
    create: {
      key: 'min_balance_requirement',
      value: '1',
      description: 'Minimum loot box balance required to open',
    },
  });

  console.log('✅ Loot box configuration created');

  // Create sample zones
  const zones = [
    {
      name: 'PC Gaming Zone',
      slug: 'pc-zone',
      description: 'Premium PC gaming stations with latest hardware',
      capacity: 20,
      pricePerHour: 15.0,
      features: ['RTX 4070', '144Hz Monitors', 'Mechanical Keyboards', 'Gaming Chairs'],
    },
    {
      name: 'PS5 Gaming Zone',
      slug: 'ps5-zone',
      description: 'Sony PlayStation 5 gaming area',
      capacity: 8,
      pricePerHour: 12.0,
      features: ['PS5 Consoles', '4K TVs', 'DualSense Controllers', 'Exclusive Games'],
    },
    {
      name: 'Racing Simulator Zone',
      slug: 'racing-zone',
      description: 'Professional racing simulation setup',
      capacity: 4,
      pricePerHour: 25.0,
      features: ['Force Feedback Wheels', 'Pedal Sets', 'VR Headsets', 'Racing Seats'],
    },
    {
      name: 'Cafe Area',
      slug: 'cafe',
      description: 'Relaxing cafe area with food and beverages',
      capacity: 15,
      pricePerHour: 0,
      features: ['Free WiFi', 'Comfortable Seating', 'Food Menu', 'Beverages'],
    },
  ];

  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { slug: zone.slug },
      update: zone,
      create: zone,
    });
  }

  console.log('✅ Gaming zones created');

  // Seed gamification data
  // await seedGamification(prisma);

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('🔐 Authentication: Gizmo-only authentication is now active');
  console.log('📊 Public Access: PC durumu sayfası herkese açık');
  console.log('🎮 Gaming Zones: Temel gaming zone\'ları ve loot box sistemi aktif');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
