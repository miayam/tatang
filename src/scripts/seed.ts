// scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create dummy users with simple passwords
  const users = [
    {
      username: 'alice',
      email: 'alice@demo.com',
      password: 'password123',
    },
    {
      username: 'bob',
      email: 'bob@demo.com',
      password: 'password123',
    },
    {
      username: 'charlie',
      email: 'charlie@demo.com',
      password: 'password123',
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        username: user.username,
        email: user.email,
        passwordHash,
      },
    });

    console.log(
      `✅ Created user: ${createdUser.username} (${createdUser.email})`
    );
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Run with: pnpm run seed
