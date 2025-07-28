import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function createCollections() {
  try {
    await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);

    const collections = [
      {
        name: 'token_balances',
        schema: [
          { name: 'userId', type: 'text', required: true },
          { name: 'currentBalance', type: 'number', required: true },
          { name: 'totalEarned', type: 'number', required: true },
          { name: 'totalSpent', type: 'number', required: true },
          { name: 'lastUpdated', type: 'date', required: true },
        ],
      },
      {
        name: 'token_transactions',
        schema: [
          { name: 'userId', type: 'text', required: true },
          { name: 'amount', type: 'number', required: true },
          { name: 'type', type: 'text', required: true },
          { name: 'reason', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'relatedEntityId', type: 'text' },
          { name: 'relatedEntityType', type: 'text' },
          { name: 'timestamp', type: 'date', required: true },
          { name: 'metadata', type: 'json' },
        ],
      },
      {
        name: 'token_earning_rules',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'amount', type: 'number', required: true },
          { name: 'triggerType', type: 'text', required: true },
          { name: 'triggerConditions', type: 'json' },
          { name: 'isActive', type: 'bool', required: true },
        ],
      },
      {
        name: 'token_spending_options',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'cost', type: 'number', required: true },
          { name: 'category', type: 'text', required: true },
          { name: 'imageUrl', type: 'text' },
          { name: 'isAvailable', type: 'bool', required: true },
          { name: 'requiresApproval', type: 'bool' },
        ],
      },
      {
        name: 'achievements',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'icon', type: 'text' },
          { name: 'category', type: 'text', required: true },
          { name: 'difficulty', type: 'text', required: true },
          { name: 'points', type: 'number', required: true },
          { name: 'tokenReward', type: 'number' },
          { name: 'requirements', type: 'json' },
          { name: 'isSecret', type: 'bool' },
          { name: 'isActive', type: 'bool', required: true },
        ],
      },
      {
        name: 'user_achievements',
        schema: [
          { name: 'userId', type: 'text', required: true },
          { name: 'achievementId', type: 'text', required: true },
          { name: 'unlockedAt', type: 'date' },
          { name: 'progress', type: 'number', required: true },
          { name: 'isCompleted', type: 'bool', required: true },
          { name: 'currentValues', type: 'json' },
        ],
      },
      {
        name: 'goals',
        schema: [
          { name: 'userId', type: 'text', required: true },
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'priority', type: 'text' },
          { name: 'status', type: 'text', required: true },
          { name: 'progress', type: 'number' },
          { name: 'parentGoalId', type: 'text' },
          { name: 'childGoalIds', type: 'json' },
          { name: 'level', type: 'number' },
          { name: 'startDate', type: 'date' },
          { name: 'targetDate', type: 'date' },
          { name: 'tokenReward', type: 'number' },
          { name: 'achievementRewards', type: 'json' },
          { name: 'dependsOnGoalIds', type: 'json' },
          { name: 'blocksGoalIds', type: 'json' },
          { name: 'tags', type: 'json' },
          { name: 'difficulty', type: 'text' },
          { name: 'estimatedHours', type: 'number' },
          { name: 'actualHours', type: 'number' },
        ],
      },
      {
        name: 'milestones',
        schema: [
          { name: 'goalId', type: 'text', required: true },
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'targetDate', type: 'date' },
          { name: 'isCompleted', type: 'bool', required: true },
          { name: 'completedAt', type: 'date' },
          { name: 'tokenReward', type: 'number' },
          { name: 'order', type: 'number' },
        ],
      },
    ];

    for (const collection of collections) {
      try {
        await pb.collections.create(collection);
        console.log(`Collection ${collection.name} created successfully`);
      } catch (error) {
        console.error(`Error creating collection ${collection.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error authenticating with PocketBase:', error);
  }
}

createCollections();

