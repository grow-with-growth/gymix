import { PocketBase } from 'pocketbase';

export async function up(pb: PocketBase) {
  await pb.collections.create({
    name: 'token_balances',
    schema: [
      { name: 'userId', type: 'text', required: true },
      { name: 'currentBalance', type: 'number', required: true, defaultValue: 0 },
      { name: 'totalEarned', type: 'number', required: true, defaultValue: 0 },
      { name: 'totalSpent', type: 'number', required: true, defaultValue: 0 },
      { name: 'lastUpdated', type: 'date', required: true },
    ],
  });

  await pb.collections.create({
    name: 'token_transactions',
    schema: [
      { name: 'userId', type: 'text', required: true },
      { name: 'amount', type: 'number', required: true },
      { name: 'type', type: 'text', required: true },
      { name: 'reason', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'relatedEntityId', type: 'text' },
      { name: 'relatedEntityType', type: 'text' },
      { name: 'metadata', type: 'json' },
      { name: 'timestamp', type: 'date', required: true },
    ],
  });

  await pb.collections.create({
    name: 'token_earning_rules',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'amount', type: 'number', required: true },
      { name: 'triggerType', type: 'text', required: true },
      { name: 'triggerConditions', type: 'json' },
      { name: 'isActive', type: 'bool', required: true, defaultValue: true },
    ],
  });

  await pb.collections.create({
    name: 'token_spending_options',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'cost', type: 'number', required: true },
      { name: 'category', type: 'text' },
      { name: 'imageUrl', type: 'text' },
      { name: 'isAvailable', type: 'bool', required: true, defaultValue: true },
      { name: 'requiresApproval', type: 'bool', defaultValue: false },
    ],
  });

  await pb.collections.create({
    name: 'achievements',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'icon', type: 'text' },
      { name: 'category', type: 'text' },
      { name: 'difficulty', type: 'text' },
      { name: 'points', type: 'number', required: true },
      { name: 'tokenReward', type: 'number', required: true },
      { name: 'requirements', type: 'json' },
      { name: 'isSecret', type: 'bool', defaultValue: false },
      { name: 'isActive', type: 'bool', defaultValue: true },
    ],
  });

  await pb.collections.create({
    name: 'user_achievements',
    schema: [
      { name: 'userId', type: 'text', required: true },
      { name: 'achievementId', type: 'text', required: true },
      { name: 'unlockedAt', type: 'date' },
      { name: 'progress', type: 'number', required: true, defaultValue: 0 },
      { name: 'isCompleted', type: 'bool', defaultValue: false },
      { name: 'currentValues', type: 'json' },
    ],
  });

  await pb.collections.create({
    name: 'progress_visualizations',
    schema: [
      { name: 'userId', type: 'text', required: true },
      { name: 'totalPoints', type: 'number', required: true, defaultValue: 0 },
      { name: 'currentLevel', type: 'number', required: true, defaultValue: 1 },
      { name: 'pointsToNextLevel', type: 'number', required: true, defaultValue: 500 },
      { name: 'totalPointsForNextLevel', type: 'number', required: true, defaultValue: 500 },
      { name: 'achievements', type: 'json' },
      { name: 'streaks', type: 'json' },
      { name: 'milestones', type: 'json' },
    ],
  });

  await pb.collections.create({
    name: 'milestones',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'type', type: 'text', required: true },
      { name: 'threshold', type: 'number', required: true },
      { name: 'reward', type: 'json' },
      { name: 'icon', type: 'text' },
      { name: 'isUnlocked', type: 'bool', defaultValue: false },
      { name: 'unlockedAt', type: 'date' },
    ],
  });

  await pb.collections.create({
    name: 'goals',
    schema: [
      { name: 'userId', type: 'text', required: true },
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'category', type: 'text' },
      { name: 'priority', type: 'text' },
      { name: 'status', type: 'text' },
      { name: 'progress', type: 'number', defaultValue: 0 },
      { name: 'parentGoalId', type: 'text' },
      { name: 'childGoalIds', type: 'json' },
      { name: 'level', type: 'number', defaultValue: 0 },
      { name: 'startDate', type: 'date' },
      { name: 'targetDate', type: 'date' },
      { name: 'tokenReward', type: 'number', defaultValue: 0 },
      { name: 'achievementRewards', type: 'json' },
      { name: 'dependsOnGoalIds', type: 'json' },
      { name: 'blocksGoalIds', type: 'json' },
      { name: 'milestones', type: 'json' },
      { name: 'activities', type: 'json' },
      { name: 'tags', type: 'json' },
      { name: 'difficulty', type: 'text' },
      { name: 'estimatedHours', type: 'number' },
      { name: 'actualHours', type: 'number' },
    ],
  });
}

export async function down(pb: PocketBase) {
  const collections = [
    'token_balances',
    'token_transactions',
    'token_earning_rules',
    'token_spending_options',
    'achievements',
    'user_achievements',
    'progress_visualizations',
    'milestones',
    'goals',
  ];

  for (const collection of collections) {
    const c = await pb.collections.getOne(collection);
    await pb.collections.delete(c.id);
  }
}

