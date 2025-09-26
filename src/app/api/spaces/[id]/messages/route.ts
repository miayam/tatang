import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const spaceId = (await params).id;
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      100
    );
    const direction = searchParams.get('direction') || 'older'; // 'older' or 'newer'

    // Verify user is member of this space
    const membership = await prisma.spaceMember.findFirst({
      where: {
        spaceId,
        userId: session.userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Space not found or access denied' },
        { status: 403 }
      );
    }

    // Build where clause for cursor pagination
    const whereClause: any = {
      spaceId,
      // Only show messages user can see based on when they joined
      createdAt: {
        gte: membership.joinedAt,
      },
    };

    // Add cursor condition based on direction
    if (cursor) {
      if (direction === 'older') {
        // Get messages older than cursor (going backwards)
        whereClause.id = { lt: cursor };
      } else {
        // Get messages newer than cursor (going forwards)
        whereClause.id = { gt: cursor };
      }
    }

    // Determine sort order based on direction
    const orderBy =
      direction === 'older'
        ? { createdAt: 'desc' as const, id: 'desc' as const }
        : { createdAt: 'asc' as const, id: 'asc' as const };

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      take: limit + 1, // Take one extra to check if more exist
      orderBy: [{ createdAt: orderBy.createdAt }, { id: orderBy.id }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        parentMessage: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, -1) : messages;

    // For older messages, we fetched in DESC order but want to return in ASC for display
    const sortedItems = direction === 'older' ? items.reverse() : items;

    // Get cursors for next page
    const nextCursor =
      hasMore && items.length > 0
        ? direction === 'older'
          ? items[0].id // When going older, next cursor is the oldest item we fetched
          : items[items.length - 1].id // When going newer, next cursor is the newest item
        : null;

    const previousCursor =
      sortedItems.length > 0
        ? direction === 'older'
          ? sortedItems[sortedItems.length - 1].id // Opposite direction cursor
          : sortedItems[0].id
        : null;

    // Transform messages for client
    const transformedMessages = sortedItems.map((message) => ({
      id: message.id,
      content: message.content,
      messageType: message.messageType,
      threadLevel: message.threadLevel,
      createdAt: message.createdAt.toISOString(),
      author: {
        id: message.user.id,
        username: message.user.username,
      },
      parentMessage: message.parentMessage
        ? {
            id: message.parentMessage.id,
            content: message.parentMessage.content.substring(0, 100), // Truncate for preview
            author: {
              username: message.parentMessage.user.username,
            },
          }
        : null,
      replyCount: message._count.replies,
      // Add content length hint for height estimation
      estimatedHeight: estimateMessageHeight(message),
    }));

    return NextResponse.json({
      messages: transformedMessages,
      hasMore,
      nextCursor,
      previousCursor,
      direction,
      totalCount: cursor
        ? undefined
        : await getMessageCount(spaceId, membership.joinedAt),
    });
  } catch (error) {
    console.error('API /spaces/[id]/messages GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to estimate message height for virtualization
function estimateMessageHeight(message: any): number {
  const baseHeight = 60; // Base message height with padding
  const lineHeight = 20; // Approximate line height
  const contentLength = message.content.length;
  const estimatedLines = Math.ceil(contentLength / 80); // ~80 chars per line

  let height = baseHeight + estimatedLines * lineHeight;

  // Add height for different message types
  switch (message.messageType) {
    case 'FILE':
      height += 80; // File attachment preview
      break;
    case 'SYSTEM':
      height = 40; // System messages are usually smaller
      break;
  }

  // Add height for thread level (indentation)
  height += message.threadLevel * 20;

  // Add height for parent message preview
  if (message.parentMessageId) {
    height += 30;
  }

  return Math.max(height, 40); // Minimum height
}

// Helper function to get total message count (only called on first load)
async function getMessageCount(
  spaceId: string,
  joinedAt: Date
): Promise<number> {
  return await prisma.message.count({
    where: {
      spaceId,
      createdAt: {
        gte: joinedAt,
      },
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const spaceId = (await params).id;
    const body = await request.json();
    const { content, messageType = 'TEXT', parentMessageId } = body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Message content is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Verify user is member of this space
    const membership = await prisma.spaceMember.findFirst({
      where: {
        spaceId,
        userId: session.userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Space not found or access denied' },
        { status: 403 }
      );
    }

    // Validate parent message if replying
    let threadLevel = 0;
    if (parentMessageId) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: parentMessageId,
          spaceId, // Ensure parent message is in same space
        },
      });

      if (!parentMessage) {
        return NextResponse.json(
          { error: 'Parent message not found' },
          { status: 400 }
        );
      }

      // Limit thread depth (prevent more than 2 levels as per your schema comment)
      if (parentMessage.threadLevel >= 1) {
        return NextResponse.json(
          { error: 'Thread nesting too deep' },
          { status: 400 }
        );
      }

      threadLevel = parentMessage.threadLevel + 1;
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        messageType,
        threadLevel,
        spaceId,
        userId: session.userId,
        parentMessageId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        parentMessage: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Transform for response
    const transformedMessage = {
      id: message.id,
      content: message.content,
      messageType: message.messageType,
      threadLevel: message.threadLevel,
      createdAt: message.createdAt.toISOString(),
      author: {
        id: message.user.id,
        username: message.user.username,
      },
      parentMessage: message.parentMessage
        ? {
            id: message.parentMessage.id,
            content: message.parentMessage.content.substring(0, 100),
            author: {
              username: message.parentMessage.user.username,
            },
          }
        : null,
      replyCount: message._count.replies,
      estimatedHeight: estimateMessageHeight(message),
    };

    return NextResponse.json(
      {
        success: true,
        message: transformedMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API /spaces/[id]/messages POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
