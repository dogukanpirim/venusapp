
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning demo users from database...');

  try {
    // Delete demo users and their related data
    const demoEmails = ['admin@venusespor.com', 'john@doe.com'];
    
    for (const email of demoEmails) {
      // Delete user and related data (cascade will handle relations)
      const deletedUser = await prisma.user.delete({
        where: { email },
      }).catch(() => null); // Ignore if user doesn't exist
      
      if (deletedUser) {
        console.log(`✅ Deleted user: ${email}`);
      } else {
        console.log(`ℹ️  User not found: ${email}`);
      }
    }
    
    console.log('🎉 Demo users cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
