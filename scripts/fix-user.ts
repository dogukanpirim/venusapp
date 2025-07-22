
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixUser() {
  console.log('🔧 Fixing demo user loot box balance...');
  
  // Update the demo user to have unlimited loot boxes
  const updatedUser = await prisma.user.update({
    where: { email: 'john@doe.com' },
    data: { 
      lootboxBalance: 999999,
      totalLootboxesOpened: 0  // Reset for clean testing
    },
    select: { 
      email: true, 
      name: true, 
      lootboxBalance: true, 
      totalLootboxesOpened: true 
    }
  });
  
  console.log('✅ User updated successfully!');
  console.log(`Email: ${updatedUser.email}`);
  console.log(`Name: ${updatedUser.name}`);
  console.log(`Loot Box Balance: ${updatedUser.lootboxBalance}`);
  console.log(`Total Opened: ${updatedUser.totalLootboxesOpened}`);
}

fixUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
