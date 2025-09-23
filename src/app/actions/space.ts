// app/actions/space.ts
'use server';

import { PrismaClient } from '@prisma/client';

import { getSession } from '@/lib/session';

import { CreateSpaceData, CreateSpaceSchema } from '@/schemas/createSpace';

const prisma = new PrismaClient();

export async function createSpace(data: CreateSpaceData) {
  // Check authentication
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return {
      success: false,
      error: 'You must be logged in to create a space',
    };
  }

  // Validate input
  const validatedFields = CreateSpaceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid form data',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, description } = validatedFields.data;

  try {
    // Use transaction to ensure both space and membership are created together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the space
      const space = await tx.space.create({
        data: {
          name,
          description,
          createdBy: session.userId || '',
          // inviteCode is auto-generated via @default(cuid())
          // isActive defaults to true
        },
      });

      // 2. Add creator as ADMIN member
      await tx.spaceMember.create({
        data: {
          spaceId: space.id,
          userId: session.userId || '',
          roleInSpace: 'ADMIN',
        },
      });

      return space;
    });

    return {
      success: true,
      data: {
        id: result.id,
        name: result.name,
        inviteCode: result.inviteCode,
      },
    };
  } catch (error) {
    console.error('Error creating space:', error);
    return {
      success: false,
      error: 'Failed to create space. Please try again.',
    };
  }
}

export async function getUserSpaces() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return [];
  }

  try {
    const userSpaces = await prisma.spaceMember.findMany({
      where: {
        userId: session.userId,
        space: {
          isActive: true,
        },
      },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            inviteCode: true,
            creator: {
              select: {
                username: true,
              },
            },
            _count: {
              select: {
                members: true,
                messages: true,
              },
            },
          },
        },
      },
      orderBy: {
        space: {
          createdAt: 'desc',
        },
      },
    });

    return userSpaces.map((membership) => ({
      ...membership.space,
      userRole: membership.roleInSpace,
      memberCount: membership.space._count.members,
      messageCount: membership.space._count.messages,
    }));
  } catch (error) {
    console.error('Error fetching user spaces:', error);
    return [];
  }
}

export async function deleteSpace(spaceId: string) {
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
