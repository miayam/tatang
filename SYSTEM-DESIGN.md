# System Design Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [Performance Optimizations](#performance-optimizations)

---

## Overview

### Project Description

A collaborative workspace platform built with Next.js, featuring messaging, rich-text notes, and space management. The application emphasizes performance through virtualization and clean separation of concerns.

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **UI Libraries**: TanStack Virtual, BlockNote Editor, Tailwind CSS
- **State Management**: Tanstack Query (for server state), React Hooks (for local state)
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Iron Session (cookie-based)

### Key Features

- **Spaces**: Collaborative workspaces with member management
- **Messages**: Real-time chat with threading support (2-level deep)
- **Notes**: Rich-text editing with BlockNote, JSONB storage
- **Cursor Pagination**: Efficient data loading for large datasets
- **Virtualization**: TanStack Virtual for rendering large lists

---

## Architecture

### Separation of Concerns

#### Business Logic Layer

- **Location**: `hooks/`, `lib/api/`
- **Purpose**: Data fetching, state management, business rules

#### Presentation Layer

- **Location**: `components/`, `app/`
- **Purpose**: UI rendering, user interactions

#### Data Layer

- **Location**: `app/api/`, `prisma/`
- **Purpose**: Database operations, API endpoints

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐
│     User     │
└──────────────┘
       │ 1
       │
       │ creates
       │
       ↓ *
┌──────────────┐         ┌──────────────────┐
│    Space     │────────→│  SpaceMember     │
└──────────────┘ 1     * └──────────────────┘
       │ 1                        │ *
       │                          │
       │ contains                 │ belongs to
       │                          │
       ↓ *                        ↓ 1
┌──────────────┐              ┌─────────┐
│   Message    │              │  User   │
└──────────────┘              └─────────┘
       │
       │ self-referential
       │ (threading)
       ↓
┌──────────────┐
│   Message    │
│  (replies)   │
└──────────────┘

       │ 1
       │
       │ contains
       │
       ↓ *
┌──────────────┐
│     Note     │
│  (JSONB)     │
└──────────────┘
```

### Database Schema (Prisma)

```prisma
// User Model
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  createdSpaces Space[]       @relation("SpaceCreator")
  memberships   SpaceMember[]
  messages      Message[]
  notes         Note[]

  @@index([email])
  @@index([username])
  @@map("users")
}

// Space Model
model Space {
  id          String   @id @default(cuid())
  name        String
  description String?
  inviteCode  String   @unique @default(cuid())
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String

  // Relations
  creator User          @relation("SpaceCreator", fields: [createdBy], references: [id])
  members SpaceMember[]
  messages Message[]
  notes    Note[]

  // Indexes for cursor pagination
  @@index([isActive, createdAt(sort: Desc), id(sort: Desc)])
  @@index([createdBy, isActive, createdAt(sort: Desc)])
  @@map("spaces")
}

// SpaceMember Model (Junction Table)
model SpaceMember {
  id          String    @id @default(cuid())
  spaceId     String
  userId      String
  roleInSpace SpaceRole @default(MEMBER)
  joinedAt    DateTime  @default(now())

  // Relations
  space Space @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Constraints
  @@unique([spaceId, userId], name: "unique_space_member")
  @@index([userId, id(sort: Desc)]) // Critical for cursor pagination
  @@index([spaceId, roleInSpace])
  @@map("space_members")
}

// Message Model (with Threading)
model Message {
  id              String      @id @default(cuid())
  content         String
  messageType     MessageType @default(TEXT)
  threadLevel     Int         @default(0)
  createdAt       DateTime    @default(now())
  spaceId         String
  userId          String
  parentMessageId String?

  // Relations
  space         Space     @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  user          User      @relation(fields: [userId], references: [id])
  parentMessage Message?  @relation("MessageReplies", fields: [parentMessageId], references: [id])
  replies       Message[] @relation("MessageReplies")

  // Indexes for chat-style cursor pagination
  @@index([spaceId, threadLevel, createdAt(sort: Desc), id(sort: Desc)])
  @@index([parentMessageId, createdAt(sort: Asc)])
  @@index([userId, createdAt(sort: Desc)])
  @@map("messages")
}

// Note Model (JSONB Content)
model Note {
  id        String   @id @default(cuid())
  spaceId   String
  createdBy String
  title     String
  content   Json     // JSONB for BlockNote editor content
  isPinned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  space   Space @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  creator User  @relation(fields: [createdBy], references: [id])

  // Indexes
  @@index([spaceId, isPinned, createdAt(sort: Desc), id(sort: Desc)])
  @@index([createdBy, createdAt(sort: Desc)])
  @@map("notes")
}

// Enums
enum SpaceRole {
  ADMIN
  MEMBER
}

enum MessageType {
  TEXT
  FILE
  SYSTEM
}
```

### Relationship Design

#### One-to-Many Relationships

1. **User → Spaces** (Creator)

   - User creates multiple spaces
   - Tracked via `createdBy` foreign key
   - Creator automatically becomes ADMIN

2. **Space → Messages**

   - Space contains multiple messages
   - Messages belong to one space
   - Cascade delete on space removal

3. **User → Messages**

   - User authors multiple messages
   - No cascade delete (preserve history)

4. **Space → Notes**
   - Space contains multiple notes
   - Notes belong to one space
   - Cascade delete with space

#### Many-to-Many Relationships

1. **User ↔ Space** (via SpaceMember)
   - Users can join multiple spaces
   - Spaces can have multiple members
   - Junction table tracks role and join date
   - Unique constraint prevents duplicate memberships

#### Self-Referential Relationships

1. **Message → Message** (Threading)
   - Messages can have replies
   - Max depth: 2 levels (threadLevel 0 → 1)
   - Parent-child relationship via `parentMessageId`

### Data Types & Constraints

#### Primary Keys

- **Type**: CUID (Collision-resistant unique identifier)
- **Benefits**:
  - Sortable (encodes timestamp)
  - URL-safe
  - Distributed-system friendly
  - Perfect for cursor pagination

#### Timestamps

- **createdAt**: Auto-set on creation
- **updatedAt**: Auto-updated on modification
- **joinedAt**: Tracks membership start

#### Unique Constraints

- `User.username` - Unique usernames
- `User.email` - One email per account
- `Space.inviteCode` - Unique join codes
- `SpaceMember.[spaceId, userId]` - No duplicate memberships

---

## API Design

### RESTful Endpoints

#### Spaces API

```
GET    /api/spaces
POST   /api/spaces
GET    /api/spaces/:id
PATCH  /api/spaces/:id
DELETE /api/spaces/:id
```

#### Messages API

```
GET    /api/spaces/:id/messages?cursor=xxx&direction=before&limit=50
POST   /api/spaces/:id/messages
```

#### Notes API

```
GET    /api/spaces/:id/notes?cursor=xxx&pinned=true&limit=20
POST   /api/spaces/:id/notes
GET    /api/spaces/:id/notes/:noteId
PATCH  /api/spaces/:id/notes/:noteId
DELETE /api/spaces/:id/notes/:noteId
```

### Cursor Pagination Pattern

All list endpoints support cursor-based pagination:

**Request**:

```
GET /api/spaces/:id/messages?cursor=clh7xyz&limit=50&direction=before
```

**Response**:

```json
{
  "messages": [...],
  "nextCursor": "clh6abc",
  "previousCursor": "clh8def",
  "hasMore": true,
  "direction": "older",
  "totalCount": 1250
}
```

**Key Features**:

- **cursor**: ID of last/first item from previous page
- **direction**: `before` (older) or `after` (newer)
- **limit**: Max items per page (capped at 100)
- **hasMore**: Boolean indicating more data exists
- **totalCount**: Only included on first request

---

### Virtualization Strategy

#### TanStack Virtual Configuration

```typescript
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => itemHeight, // Dynamic height estimation
  overscan: 5, // Render 5 extra items
  measureElement: (element) => {
    // Measure actual heights
    return element.getBoundingClientRect().height;
  },
});
```

## Performance Optimizations

### Database Level

#### Indexing Strategy

```sql
-- Cursor pagination indexes
CREATE INDEX idx_spaces_cursor ON spaces(is_active, created_at DESC, id DESC);
CREATE INDEX idx_messages_cursor ON messages(space_id, thread_level, created_at DESC, id DESC);
CREATE INDEX idx_space_members_cursor ON space_members(user_id, id DESC);

-- Lookup indexes
CREATE INDEX idx_space_invite ON spaces(invite_code);
CREATE INDEX idx_space_member_lookup ON space_members(space_id, user_id);
```

#### Query Optimization

- Use `select` to fetch only needed fields
- Use `include` sparingly for relations
- Implement cursor pagination (avoid OFFSET)
- Use `take: limit + 1` to check for more data

### Frontend Level

#### Virtualization Benefits

- Only render visible items (10-20 DOM nodes for 1000+ items)
- Smooth scrolling with dynamic heights
- Memory efficient for large datasets
- No performance degradation with data growth

## Deployment Considerations

### Environment Variables

```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="32+ character secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Database Migrations

```bash
# Development
npx prisma db push

# Production
npx prisma migrate deploy
```

--

## Future Enhancements

### Scalability Plans

1. **Database Sharding**: Partition by space for horizontal scaling
2. **CDN Integration**: Static asset optimization
3. **Redis Caching**: Cache frequently accessed data
4. **Message Queues**: Background job processing

## Conclusion

This system design emphasizes:

- **Clean Architecture**: Separation of UI, business logic, and data layers
- **Performance**: Virtualization and cursor pagination for large datasets
- **Scalability**: Efficient database design with proper indexing
- **Developer Experience**: Type-safe APIs, clear patterns, maintainable code
