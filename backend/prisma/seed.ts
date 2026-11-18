import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CloudOps database...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@cloudops.internal' },
    update: {},
    create: {
      email: 'admin@cloudops.internal',
      passwordHash,
      preferences: {
        create: {
          defaultRegion: 'ap-south-1',
          refreshIntervalSeconds: 60
        }
      }
    }
  });

  await prisma.auditEvent.create({
    data: {
      userId: user.id,
      action: 'SYSTEM_SEED',
      resourceType: 'system',
      metadata: { environment: 'local-demo' }
    }
  });

  console.log(`Database seeded successfully with user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
