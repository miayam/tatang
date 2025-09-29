import { Prisma, PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/session';

const prisma = new PrismaClient();

type tParams = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
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
      parseInt(searchParams.get('limit') || '20', 10),
      100
    );
    const pinnedOnly = searchParams.get('pinned') === 'true';

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

    // Build where clause
    const whereClause: any = {
      spaceId,
      ...(pinnedOnly && { isPinned: true }),
    };

    // Add cursor pagination
    if (cursor) {
      whereClause.id = { lt: cursor };
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      take: limit + 1,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        title: true,
        content: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Handle pagination
    const hasMore = notes.length > limit;
    const items = hasMore ? notes.slice(0, -1) : notes;
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    // Transform notes for response
    const transformedNotes = items.map((note: any) => ({
      id: note.id,
      title: note.title,
      content: note.content, // JSONB field
      isPinned: note.isPinned,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      creator: {
        id: note.creator.id,
        username: note.creator.username,
      },
    }));

    return NextResponse.json({
      notes: transformedNotes,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error('API /spaces/[id]/notes GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const spaceId = (await params).id;
    const body = await request.json();
    const { title, content, isPinned = false } = body;

    // Validate input
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note title is required' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Note title is too long (max 200 characters)' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Note content is required' },
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

    // Validate JSON content
    let validatedContent;
    try {
      // Ensure content is valid JSON
      validatedContent =
        typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON content' },
        { status: 400 }
      );
    }

    // Create the note
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: validatedContent as Prisma.InputJsonValue,
        isPinned,
        spaceId,
        createdBy: session.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        note: {
          id: note.id,
          title: note.title,
          content: note.content,
          isPinned: note.isPinned,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
          creator: note.creator,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API /spaces/[id]/notes POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
