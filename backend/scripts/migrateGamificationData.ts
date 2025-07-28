import PocketBase from 'pocketbase';
import {
  mockTokenBalances,
  mockTokenTransactions,
  mockTokenEarningRules,
  mockTokenSpendingOptions,
  mockAchievements,
  mockUserAchievements,
  mockGoals,
  mockMilestones,
} from '../mockData/gamificationData';

const pb = new PocketBase('http://127.0.0.1:8090');

async function migrateData() {
  try {
    await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);

    for (const balance of mockTokenBalances) {
      await pb.collection('token_balances').create(balance);
    }

    for (const transaction of mockTokenTransactions) {
      await pb.collection('token_transactions').create(transaction);
    }

    for (const rule of mockTokenEarningRules) {
      await pb.collection('token_earning_rules').create(rule);
    }

    for (const option of mockTokenSpendingOptions) {
      await pb.collection('token_spending_options').create(option);
    }

    for (const achievement of mockAchievements) {
      await pb.collection('achievements').create(achievement);
    }

    for (const userAchievement of mockUserAchievements) {
      await pb.collection('user_achievements').create(userAchievement);
    }

    for (const goal of mockGoals) {
      await pb.collection('goals').create(goal);
    }

    for (const milestone of mockMilestones) {
      await pb.collection('milestones').create(milestone);
    }

    console.log('Gamification data migrated successfully');
  } catch (error) {
    console.error('Error migrating gamification data:', error);
  }
}

migrateData();

