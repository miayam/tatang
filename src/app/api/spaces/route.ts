import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const userId = session.userId;

    // Validate limit
    if (limit > 100 || limit < 1) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get total count for the user (only on first request for performance)
    let totalCount = 0;
    if (!cursor) {
      totalCount = await prisma.spaceMember.count({
        where: {
          userId,
          space: {
            isActive: true,
          },
        },
      });
    }

    // Get user's spaces with cursor pagination
    const userSpaces = await prisma.spaceMember.findMany({
      where: {
        userId,
        space: {
          isActive: true,
        },
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit,
      orderBy: [{ space: { createdAt: 'desc' } }, { id: 'desc' }],
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
    });

    // Check if there are more items
    const hasMore = userSpaces.length === limit;
    const nextCursor =
      hasMore && userSpaces.length > 0
        ? userSpaces[userSpaces.length - 1].id
        : null;

    // Transform the data
    const spaces = userSpaces.map((membership) => ({
      id: membership.space.id,
      name: membership.space.name,
      description: membership.space.description,
      createdAt: membership.space.createdAt,
      inviteCode: membership.space.inviteCode,
      userRole: membership.roleInSpace,
      memberCount: membership.space._count.members,
      messageCount: membership.space._count.messages,
      creator: membership.space.creator,
    }));

    return NextResponse.json({
      spaces,
      nextCursor,
      hasMore,
      totalCount: cursor ? undefined : totalCount, // Only return total on first request
    });
  } catch (error) {
    console.error('API /spaces error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
