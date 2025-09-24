'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getSpaces(cursor: string, limit = 20) {
  const spaces = await prisma.space.findMany({
    // Use the cursor parameter directly
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0, // Skip the cursor item itself
    take: limit,
    orderBy: { id: 'desc' }, // Sort by ID descending (newest first)
    where: { isActive: true },
    include: {
      creator: { select: { username: true } },
      _count: { select: { members: true, messages: true } },
    },
  });

  // Check if there are more items
  const hasMore = spaces.length === limit;
  const nextCursor = spaces.length > 0 ? spaces[spaces.length - 1].id : null;

  return {
    spaces,
    nextCursor: hasMore ? nextCursor : null,
    hasMore,
  };
}
