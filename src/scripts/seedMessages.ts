// scripts/seedMessages.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample message templates for realistic conversations
const messageTemplates = [
  // Greetings and introductions
  'Hello everyone! 👋',
  'Good morning team!',
  'Hey there! How is everyone doing today?',
  'Welcome to the space!',

  // Work-related messages
  'Just finished the latest feature, ready for review!',
  'Can someone help me with this bug?',
  'Great work on the presentation yesterday!',
  'Meeting starts in 10 minutes',
  "I'll be working from home today",
  'The deployment went smoothly 🚀',

  // Questions and discussions
  'What do you think about the new design?',
  'Has anyone tried the new API endpoint?',
  'Quick question about the database schema',
  'Should we schedule a team sync?',
  'Any blockers on your end?',
  "What's the status on the client project?",

  // Longer messages
  "I've been thinking about our architecture and I believe we should consider moving to a microservices approach. It would give us better scalability and allow different teams to work independently.",
  "The user feedback from yesterday's demo was really positive! They especially liked the new dashboard design and the improved performance. We should definitely prioritize these features for the next release.",
  'Just wanted to share some thoughts on our current workflow. I think we could benefit from having more structured code reviews and maybe implementing some automated testing for the critical paths.',

  // Code snippets and technical
  'Check out this cool function I wrote:\n```javascript\nconst fibonacci = (n) => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2)\n```',
  'Found a great article about React performance: https://example.com/react-performance',
  'The API is returning a 500 error when I try to POST to /api/users',
  'Updated the README with the new setup instructions',

  // Casual conversation
  'Anyone grab coffee yet? ☕',
  'Beautiful weather today!',
  'Happy Friday everyone! 🎉',
  'Thanks for all your hard work this week',
  'Looking forward to the team lunch tomorrow',
  'Hope everyone has a great weekend!',

  // Reactions and responses
  'Awesome! 🔥',
  'Thanks for the help!',
  'That makes sense',
  'I agree with that approach',
  'Let me check on that',
  'Will do! 👍',
  'Perfect timing!',
  'Good catch!',

  // Project updates
  'Sprint planning meeting scheduled for Monday 2PM',
  'Backlog has been updated with new user stories',
  'Client approved the wireframes!',
  'QA found a few minor issues, fixing now',
  'Release candidate is ready for testing',
  'Production deployment successful ✅',

  // Problem solving
  "I'm stuck on this CSS layout issue",
  'Database query is running too slow',
  'Need help debugging this authentication flow',
  'Browser compatibility issue with Safari',
  'Memory leak in the background process',

  // Announcements
  'New team member joining us next week!',
  'Office will be closed next Friday',
  'Updated security guidelines in the wiki',
  'New development environment is ready',
  'Please update your local dependencies',

  // Creative and fun
  'Just pushed some code that actually works on the first try! 🎯',
  "Today's debugging brought to you by console.log() 🐛",
  "When the code works but you don't know why 🤷‍♂️",
  "That moment when you realize you've been coding for 6 hours straight",
  'Coffee count today: 4 and counting...',
];

// Thread reply templates (shorter, more conversational)
const replyTemplates = [
  'Sounds good!',
  'I can help with that',
  'Same here',
  'Agreed!',
  'Let me know if you need anything',
  'Thanks!',
  'Will check it out',
  'Good point',
  'Makes sense',
  "I'll take a look",
  'Sure thing!',
  'On it!',
  'Great idea',
  'That works for me',
  'Count me in',
  'Nice work!',
  'Interesting approach',
  'I had the same issue',
  "Here's what worked for me...",
  'Try this solution:',
];

async function main() {
  console.log('🌱 Seeding messages...');

  // First, ensure we have test users
  const users = [
    {
      username: 'alice',
      email: 'alice@demo.com',
      password: 'password123',
    },
    {
      username: 'bob',
      email: 'bob@demo.com',
      password: 'password123',
    },
    {
      username: 'charlie',
      email: 'charlie@demo.com',
      password: 'password123',
    },
  ];

  console.log('👥 Creating/updating users...');
  const createdUsers: any = [];

  for (const userData of users) {
    const passwordHash = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        username: userData.username,
        email: userData.email,
        passwordHash,
      },
    });

    createdUsers.push(user);
    console.log(`✅ User: ${user.username}`);
  }

  // Create a new space for messages
  console.log('\n🏢 Creating new space for messages...');
  const space = await prisma.$transaction(async (tx) => {
    // Create space
    const newSpace = await tx.space.create({
      data: {
        name: 'Message Test Space',
        description:
          'A space for testing messages with dynamic content and threading',
        createdBy: createdUsers[0].id, // Alice creates the space
      },
    });

    // Add Alice as admin
    await tx.spaceMember.create({
      data: {
        spaceId: newSpace.id,
        userId: createdUsers[0].id,
        roleInSpace: 'ADMIN',
      },
    });

    return newSpace;
  });

  console.log(`✅ Created space: ${space.name} (${space.id})`);

  // Add other users as members
  console.log('\n👥 Adding members to space...');
  for (let i = 1; i < createdUsers.length; i++) {
    await prisma.spaceMember.create({
      data: {
        spaceId: space.id,
        userId: createdUsers[i].id,
        roleInSpace: 'MEMBER',
      },
    });
    console.log(`✅ Added ${createdUsers[i].username} as member`);
  }

  // Create 100 messages with realistic timing and threading
  console.log('\n💬 Creating 100 messages...');
  const messages = [];

  for (let i = 0; i < 100; i++) {
    const randomUser =
      createdUsers[Math.floor(Math.random() * createdUsers.length)];

    // Decide if this should be a reply (20% chance after we have some messages)
    const shouldReply = i > 10 && Math.random() < 0.2;
    let parentMessageId = null;
    let threadLevel = 0;
    let messageContent = '';

    if (shouldReply && messages.length > 0) {
      // Pick a recent message to reply to (from last 20 messages)
      const recentMessages: any = messages.slice(-20);
      const parentMessage =
        recentMessages[Math.floor(Math.random() * recentMessages.length)];

      // Only reply if parent isn't already at max thread level
      if (parentMessage.threadLevel < 1) {
        parentMessageId = parentMessage.id;
        threadLevel = parentMessage.threadLevel + 1;
        messageContent =
          replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
      } else {
        // Use regular message instead
        messageContent =
          messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
      }
    } else {
      messageContent =
        messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    }

    // Determine message type (mostly TEXT, some SYSTEM)
    const messageType = Math.random() < 0.05 ? 'SYSTEM' : 'TEXT';

    // For system messages, use system-appropriate content
    if (messageType === 'SYSTEM') {
      const systemMessages = [
        `${randomUser.username} joined the space`,
        `${randomUser.username} updated the space description`,
        'Space settings were updated',
        'New announcement posted',
        'Weekly backup completed',
      ];
      messageContent =
        systemMessages[Math.floor(Math.random() * systemMessages.length)];
    }

    try {
      const message = await prisma.message.create({
        data: {
          content: messageContent,
          messageType,
          threadLevel,
          spaceId: space.id,
          userId: randomUser.id,
          parentMessageId,
        },
      });

      messages.push(message);
      console.log(
        `✅ Message ${i + 1}/100: "${message.content.substring(
          0,
          50
        )}..." (by ${randomUser.username}${threadLevel > 0 ? ', reply' : ''})`
      );

      // Add realistic delays between messages (10-100ms)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 90 + 10)
      );
    } catch (error) {
      console.error(`❌ Failed to create message ${i + 1}:`, error);
    }
  }

  // Generate some statistics
  const stats = {
    totalMessages: messages.length,
    messagesByUser: {} as Record<string, number>,
    messageTypes: {} as Record<string, number>,
    threadReplies: messages.filter((m) => m.threadLevel > 0).length,
    avgMessageLength: Math.round(
      messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length
    ),
  };

  // Count messages by user
  for (const message of messages) {
    const user = createdUsers.find((u: any) => u.id === message.userId);
    if (user) {
      stats.messagesByUser[user.username] =
        (stats.messagesByUser[user.username] || 0) + 1;
    }
  }

  // Count by message type
  for (const message of messages) {
    stats.messageTypes[message.messageType] =
      (stats.messageTypes[message.messageType] || 0) + 1;
  }

  console.log('\n📊 Message Statistics:');
  console.log(`✅ Total messages: ${stats.totalMessages}`);
  console.log(`✅ Thread replies: ${stats.threadReplies}`);
  console.log(
    `✅ Average message length: ${stats.avgMessageLength} characters`
  );
  console.log('\n👥 Messages by user:');
  Object.entries(stats.messagesByUser).forEach(([username, count]) => {
    console.log(`  ${username}: ${count} messages`);
  });
  console.log('\n📝 Messages by type:');
  Object.entries(stats.messageTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} messages`);
  });

  console.log(
    `\n🎉 Successfully seeded ${messages.length} messages in space "${space.name}"!`
  );
  console.log(`Space ID: ${space.id}`);
  console.log('\nYou can now test:');
  console.log('- Cursor pagination with /api/spaces/{id}/messages');
  console.log('- Dynamic height estimation in virtualized lists');
  console.log('- Threading and reply functionality');
  console.log('- Real message content with various lengths');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
