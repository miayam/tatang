import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getSession } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET_NOTE(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: spaceId, noteId } = params;

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

    // Get the specific note
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        spaceId,
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

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        isPinned: note.isPinned,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        creator: note.creator,
      },
    });
  } catch (error) {
    console.error('API /spaces/[id]/notes/[noteId] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: spaceId, noteId } = params;
    const body = await request.json();
    const { title, content, isPinned } = body;

    // Validate input
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Note title cannot be empty' },
          { status: 400 }
        );
      }
      if (title.length > 200) {
        return NextResponse.json(
          { error: 'Note title is too long (max 200 characters)' },
          { status: 400 }
        );
      }
    }

    // Check if user can edit this note
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        spaceId,
      },
      include: {
        space: {
          include: {
            members: {
              where: { userId: session.userId },
              select: { roleInSpace: true },
            },
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const userMembership = note.space.members[0];
    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // User can edit their own notes, or admins can edit any note
    const canEdit =
      note.createdBy === session.userId ||
      userMembership.roleInSpace === 'ADMIN';

    if (!canEdit) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      try {
        // Validate JSON content
        updateData.content =
          typeof content === 'string' ? JSON.parse(content) : content;
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON content' },
          { status: 400 }
        );
      }
    }

    if (isPinned !== undefined) {
      updateData.isPinned = isPinned;
    }

    // Update the note
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      note: {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        isPinned: updatedNote.isPinned,
        createdAt: updatedNote.createdAt.toISOString(),
        updatedAt: updatedNote.updatedAt.toISOString(),
        creator: updatedNote.creator,
      },
    });
  } catch (error) {
    console.error('API /spaces/[id]/notes/[noteId] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: spaceId, noteId } = params;

    // Check if user can delete this note
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        spaceId,
      },
      include: {
        space: {
          include: {
            members: {
              where: { userId: session.userId },
              select: { roleInSpace: true },
            },
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const userMembership = note.space.members[0];
    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // User can delete their own notes, or admins can delete any note
    const canDelete =
      note.createdBy === session.userId ||
      userMembership.roleInSpace === 'ADMIN';

    if (!canDelete) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Delete the note (hard delete)
    await prisma.note.delete({
      where: { id: noteId },
    });

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('API /spaces/[id]/notes/[noteId] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
