import { Migration } from '../types';

export const MIGRATION_1737827100000_ai_mentor_schema: Migration = {
  id: '1737827100000_ai_mentor_schema',
  name: 'Create AI Mentor Schema',
  up: async (db) => {
    await db.collections.create({
      name: 'ai_mentor_conversations',
      schema: [
        { name: 'userId', type: 'relation', required: true, options: { collectionId: 'users' } },
        { name: 'type', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'isActive', type: 'bool', required: true },
        { name: 'lastMessageAt', type: 'date', required: true },
        { name: 'messageCount', type: 'number', required: true },
        { name: 'tags', type: 'json' },
        { name: 'crisisLevel', type: 'text' },
      ],
    });

    await db.collections.create({
      name: 'ai_mentor_messages',
      schema: [
        { name: 'conversationId', type: 'relation', required: true, options: { collectionId: 'ai_mentor_conversations' } },
        { name: 'sender', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'responseType', type: 'text' },
        { name: 'suggestedActions', type: 'json' },
        { name: 'resources', type: 'json' },
        { name: 'isRead', type: 'bool', required: true },
        { name: 'timestamp', type: 'date', required: true },
      ],
    });

    await db.collections.create({
      name: 'ai_mentor_resources',
      schema: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'type', type: 'text', required: true },
        { name: 'url', type: 'url', required: true },
        { name: 'category', type: 'text', required: true },
        { name: 'priority', type: 'text', required: true },
        { name: 'isEmergency', type: 'bool', required: true },
      ],
    });

    await db.collections.create({
      name: 'ai_mentor_crisis_detections',
      schema: [
        { name: 'userId', type: 'relation', required: true, options: { collectionId: 'users' } },
        { name: 'conversationId', type: 'relation', required: true, options: { collectionId: 'ai_mentor_conversations' } },
        { name: 'messageId', type: 'relation', required: true, options: { collectionId: 'ai_mentor_messages' } },
        { name: 'level', type: 'text', required: true },
        { name: 'indicators', type: 'json', required: true },
        { name: 'confidence', type: 'number', required: true },
        { name: 'recommendedActions', type: 'json' },
        { name: 'isResolved', type: 'bool', required: true },
        { name: 'resolvedAt', type: 'date' },
        { name: 'resolvedBy', type: 'relation', options: { collectionId: 'users' } },
        { name: 'notes', type: 'text' },
      ],
    });
  },
  down: async (db) => {
    await db.collections.delete('ai_mentor_conversations');
    await db.collections.delete('ai_mentor_messages');
    await db.collections.delete('ai_mentor_resources');
    await db.collections.delete('ai_mentor_crisis_detections');
  },
};

