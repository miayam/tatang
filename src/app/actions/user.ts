'use server';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { getSession } from '@/lib/session';

export default async function getCurrentUser() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
