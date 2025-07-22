
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying database changes...');
  
  // Check demo user loot box balance
  const user = await prisma.user.findUnique({
    where: { email: 'john@doe.com' },
    select: { 
      email: true, 
      name: true, 
      lootboxBalance: true, 
      totalLootboxesOpened: true 
    }
  });
  
  console.log('\n📱 Demo User Status:');
  console.log(`Email: ${user?.email}`);
  console.log(`Name: ${user?.name}`);
  console.log(`Loot Box Balance: ${user?.lootboxBalance}`);
  console.log(`Total Opened: ${user?.totalLootboxesOpened}`);
  
  // Check if PlayStation 5 reward exists
  const ps5Reward = await prisma.lootBoxReward.findFirst({
    where: { name: 'PlayStation 5' }
  });
  
  console.log('\n🎮 PlayStation 5 Reward:');
  if (ps5Reward) {
    console.log(`✅ PlayStation 5 reward found!`);
    console.log(`Name: ${ps5Reward.name}`);
    console.log(`Description: ${ps5Reward.description}`);
    console.log(`Rarity: ${ps5Reward.rarity}`);
    console.log(`Weight: ${ps5Reward.weight} (~${((ps5Reward.weight / 1075) * 100).toFixed(2)}% chance)`);
    console.log(`Value: ${ps5Reward.value} TL`);
    console.log(`Icon: ${ps5Reward.icon}`);
  } else {
    console.log('❌ PlayStation 5 reward not found!');
  }
  
  // Check total reward distribution
  const rewards = await prisma.lootBoxReward.findMany({
    select: { name: true, rarity: true, weight: true }
  });
  
  console.log('\n📊 Reward Distribution:');
  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
  console.log(`Total Weight: ${totalWeight}`);
  
  const byRarity = rewards.reduce((acc, r) => {
    acc[r.rarity] = (acc[r.rarity] || 0) + r.weight;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(byRarity).forEach(([rarity, weight]) => {
    console.log(`${rarity}: ${weight} weight (${((weight / totalWeight) * 100).toFixed(1)}%)`);
  });
  
  console.log('\n🎉 Verification complete!');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
