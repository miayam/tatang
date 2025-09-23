'use server';

import { PrismaClient } from '@prisma/client';

import { getSession } from '@/lib/session';

const prisma = new PrismaClient();

export default async function deleteSpace(spaceId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return {
      success: false,
      error: 'You must be logged in',
    };
  }

  try {
    // Check if user is admin of this space
    const membership = await prisma.spaceMember.findFirst({
      where: {
        spaceId,
        userId: session.userId,
        roleInSpace: 'ADMIN',
      },
      include: {
        space: true,
      },
    });

    if (!membership) {
      return {
        success: false,
        error: 'You do not have permission to delete this space',
      };
    }

    // Soft delete the space
    await prisma.space.update({
      where: { id: spaceId },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Space deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting space:', error);
    return {
      success: false,
      error: 'Failed to delete space',
    };
  }
}
