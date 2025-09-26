'use server';

import { PrismaClient } from '@prisma/client';

import { getSession } from '@/lib/session';

import { CreateSpaceData, CreateSpaceSchema } from '@/schemas/createSpace';

const prisma = new PrismaClient();

export default async function createSpace(data: CreateSpaceData) {
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
