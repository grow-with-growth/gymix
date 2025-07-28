import { nanoid } from 'nanoid';
import type {
  TokenTransaction,
  TokenBalance,
  TokenEarningRule,
  TokenSpendingOption,
  Achievement,
  UserAchievement,
  ProgressVisualization,
  Milestone,
  Goal,
} from '../../types';
import {
  mockTokenBalances,
  mockTokenTransactions,
  mockTokenEarningRules,
  mockTokenSpendingOptions,
  mockAchievements,
  mockUserAchievements,
  mockProgressVisualization,
  mockMilestones,
  mockGoals,
  getTokenBalanceByUserId,
  getTokenTransactionsByUserId,
  getUserAchievementsByUserId,
  getProgressVisualizationByUserId,
  getMilestonesByUserId,
  getGoalsByUserId,
} from '../mockData/gamificationData';

export class GamificationService {
  // Token Economy Methods

  async getTokenBalance(userId: string): Promise<TokenBalance> {
    const balance = getTokenBalanceByUserId(userId);

    if (!balance) {
      // Create a new balance for the user
      const newBalance: TokenBalance = {
        userId,
        currentBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: new Date().toISOString(),
      };
      mockTokenBalances.push(newBalance);
      return newBalance;
    }

    return balance;
  }

  async getTokenTransactions(userId: string, limit?: number): Promise<TokenTransaction[]> {
    return getTokenTransactionsByUserId(userId, limit);
  }

  async getTokenEarningRules(): Promise<TokenEarningRule[]> {
    return mockTokenEarningRules.filter(rule => rule.isActive);
  }

  async getTokenSpendingOptions(): Promise<TokenSpendingOption[]> {
    return mockTokenSpendingOptions.filter(option => option.isAvailable);
  }

  async earnTokens(
    userId: string,
    amount: number,
    reason: string,
    type: 'earned' | 'bonus' = 'earned',
    relatedEntityId?: string,
    relatedEntityType?: 'achievement' | 'goal' | 'purchase' | 'activity',
    metadata: Record<string, any> = {}
  ): Promise<TokenTransaction> {
    const balance = await this.getTokenBalance(userId);

    // Create transaction
    const transaction: TokenTransaction = {
      id: nanoid(),
      userId,
      amount,
      type,
      reason,
      relatedEntityId,
      relatedEntityType,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Update balance
    balance.currentBalance += amount;
    balance.totalEarned += amount;
    balance.lastUpdated = new Date().toISOString();

    // Add transaction to mock data
    mockTokenTransactions.push(transaction);

    // Check for milestone unlocks after earning tokens
    await this.checkMilestoneUnlocks(userId);

    return transaction;
  }

  async spendTokens(
    userId: string,
    amount: number,
    reason: string,
    spendingOptionId?: string,
    metadata: Record<string, any> = {}
  ): Promise<TokenTransaction> {
    const balance = await this.getTokenBalance(userId);

    if (balance.currentBalance < amount) {
      throw new Error('Insufficient token balance');
    }

    // Create transaction
    const transaction: TokenTransaction = {
      id: nanoid(),
      userId,
      amount: -amount, // Negative for spending
      type: 'spent',
      reason,
      relatedEntityId: spendingOptionId,
      relatedEntityType: 'purchase',
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Update balance
    balance.currentBalance -= amount;
    balance.totalSpent += amount;
    balance.lastUpdated = new Date().toISOString();

    // Add transaction to mock data
    mockTokenTransactions.push(transaction);

    return transaction;
  }

  async purchaseSpendingOption(userId: string, spendingOptionId: string): Promise<TokenTransaction> {
    const spendingOption = mockTokenSpendingOptions.find(option => option.id === spendingOptionId);
    
    if (!spendingOption) {
      throw new Error('Spending option not found');
    }

    if (!spendingOption.isAvailable) {
      throw new Error('Spending option is not available');
    }

    return this.spendTokens(
      userId,
      spendingOption.cost,
      `Purchased: ${spendingOption.name}`,
      spendingOptionId,
      { category: spendingOption.category }
    );
  }

  // Achievement System Methods

  async getAchievements(): Promise<Achievement[]> {
    return mockAchievements.filter(achievement => achievement.isActive);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return getUserAchievementsByUserId(userId);
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const achievement = mockAchievements.find(a => a.id === achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    // Check if already unlocked
    const existingUserAchievement = mockUserAchievements.find(
      ua => ua.userId === userId && ua.achievementId === achievementId
    );

    if (existingUserAchievement) {
      throw new Error('Achievement already unlocked');
    }

    // Create user achievement
    const userAchievement: UserAchievement = {
      id: nanoid(),
      userId,
      achievementId,
      unlockedAt: new Date().toISOString(),
      progress: 100,
      isCompleted: true,
      currentValues: {},
    };

    mockUserAchievements.push(userAchievement);

    // Award tokens for achievement
    await this.earnTokens(
      userId,
      achievement.tokenReward,
      `Achievement Unlocked: ${achievement.name}`,
      'earned',
      achievementId,
      'achievement'
    );

    // Update progress visualization
    await this.updateProgressVisualization(userId);

    return userAchievement;
  }

  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    currentValues: Record<string, number>
  ): Promise<UserAchievement> {
    const achievement = mockAchievements.find(a => a.id === achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    let userAchievement = mockUserAchievements.find(
      ua => ua.userId === userId && ua.achievementId === achievementId
    );

    if (!userAchievement) {
      // Create new user achievement
      userAchievement = {
        id: nanoid(),
        userId,
        achievementId,
        unlockedAt: new Date().toISOString(),
        progress: 0,
        isCompleted: false,
        currentValues: {},
      };
      mockUserAchievements.push(userAchievement);
    }

    // Update current values
    userAchievement.currentValues = { ...userAchievement.currentValues, ...currentValues };

    // Calculate progress based on requirements
    let totalProgress = 0;
    for (const requirement of achievement.requirements) {
      const currentValue = userAchievement.currentValues[requirement.metric] || 0;
      const progress = Math.min((currentValue / requirement.target) * 100, 100);
      totalProgress += progress;
    }

    userAchievement.progress = totalProgress / achievement.requirements.length;
    userAchievement.isCompleted = userAchievement.progress >= 100;

    // If completed and not already awarded, award tokens
    if (userAchievement.isCompleted && userAchievement.progress < 100) {
      await this.earnTokens(
        userId,
        achievement.tokenReward,
        `Achievement Unlocked: ${achievement.name}`,
        'earned',
        achievementId,
        'achievement'
      );
    }

    return userAchievement;
  }

  // Progress Visualization Methods

  async getProgressVisualization(userId: string): Promise<ProgressVisualization> {
    let progress = getProgressVisualizationByUserId(userId);

    if (!progress) {
      // Create initial progress visualization
      progress = {
        userId,
        totalPoints: 0,
        currentLevel: 1,
        pointsToNextLevel: 500,
        totalPointsForNextLevel: 500,
        achievements: {
          total: 0,
          byCategory: {},
          byDifficulty: {},
          recent: [],
        },
        streaks: {
          current: 0,
          longest: 0,
          type: 'daily_login',
        },
        milestones: [],
      };
      mockProgressVisualization.push(progress);
    }

    return progress;
  }

  async updateProgressVisualization(userId: string): Promise<ProgressVisualization> {
    const userAchievements = getUserAchievementsByUserId(userId);
    const completedAchievements = userAchievements.filter(ua => ua.isCompleted);
    
    // Calculate total points from achievements
    let totalPoints = 0;
    const byCategory: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};

    for (const userAchievement of completedAchievements) {
      const achievement = mockAchievements.find(a => a.id === userAchievement.achievementId);
      if (achievement) {
        totalPoints += achievement.points;
        byCategory[achievement.category] = (byCategory[achievement.category] || 0) + 1;
        byDifficulty[achievement.difficulty] = (byDifficulty[achievement.difficulty] || 0) + 1;
      }
    }

    // Calculate level based on points
    const currentLevel = Math.floor(totalPoints / 500) + 1;
    const pointsToNextLevel = (currentLevel * 500) - totalPoints;
    const totalPointsForNextLevel = currentLevel * 500;

    // Get recent achievements (last 5)
    const recentAchievements = completedAchievements
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 5);

    const progress: ProgressVisualization = {
      userId,
      totalPoints,
      currentLevel,
      pointsToNextLevel,
      totalPointsForNextLevel,
      achievements: {
        total: completedAchievements.length,
        byCategory,
        byDifficulty,
        recent: recentAchievements,
      },
      streaks: {
        current: 5, // Mock streak data
        longest: 12,
        type: 'daily_login',
      },
      milestones: getMilestonesByUserId(userId),
    };

    // Update or add to mock data
    const existingIndex = mockProgressVisualization.findIndex(p => p.userId === userId);
    if (existingIndex >= 0) {
      mockProgressVisualization[existingIndex] = progress;
    } else {
      mockProgressVisualization.push(progress);
    }

    return progress;
  }

  // Milestone Tracking Methods

  async getMilestones(userId: string): Promise<Milestone[]> {
    return getMilestonesByUserId(userId);
  }

  async checkMilestoneUnlocks(userId: string): Promise<Milestone[]> {
    const milestones = getMilestonesByUserId(userId);
    const unlockedMilestones: Milestone[] = [];

    for (const milestone of milestones) {
      if (milestone.isUnlocked) continue;

      let shouldUnlock = false;

      switch (milestone.type) {
        case 'level':
          const progress = await this.getProgressVisualization(userId);
          shouldUnlock = progress.currentLevel >= milestone.threshold;
          break;
        
        case 'points':
          const progressPoints = await this.getProgressVisualization(userId);
          shouldUnlock = progressPoints.totalPoints >= milestone.threshold;
          break;
        
        case 'achievements':
          const userAchievements = getUserAchievementsByUserId(userId);
          const completedCount = userAchievements.filter(ua => ua.isCompleted).length;
          shouldUnlock = completedCount >= milestone.threshold;
          break;
        
        case 'streak':
          const progressStreak = await this.getProgressVisualization(userId);
          shouldUnlock = progressStreak.streaks.current >= milestone.threshold;
          break;
        
        case 'custom':
          // Custom milestone logic would go here
          break;
      }

      if (shouldUnlock) {
        milestone.isUnlocked = true;
        milestone.unlockedAt = new Date().toISOString();
        unlockedMilestones.push(milestone);

        // Award milestone rewards
        if (milestone.reward.tokens > 0) {
          await this.earnTokens(
            userId,
            milestone.reward.tokens,
            `Milestone Achieved: ${milestone.name}`,
            'bonus',
            milestone.id,
            'achievement'
          );
        }
      }
    }

    return unlockedMilestones;
  }

  // Goal Tree Methods

  async getGoals(userId: string): Promise<Goal[]> {
    return getGoalsByUserId(userId);
  }

  async getGoalById(userId: string, goalId: string): Promise<Goal | null> {
    const goals = getGoalsByUserId(userId);
    return goals.find(g => g.id === goalId) || null;
  }

  async createGoal(userId: string, goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const goal: Goal = {
      id: nanoid(),
      userId,
      ...goalData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Validate parent-child relationships
    if (goal.parentGoalId) {
      const parentGoal = await this.getGoalById(userId, goal.parentGoalId);
      if (!parentGoal) {
        throw new Error('Parent goal not found');
      }
      
      // Update parent goal's child list
      if (!parentGoal.childGoalIds.includes(goal.id)) {
        parentGoal.childGoalIds.push(goal.id);
        parentGoal.updatedAt = new Date().toISOString();
      }
    }

    // Validate dependencies
    for (const dependencyId of goal.dependsOnGoalIds) {
      const dependencyGoal = await this.getGoalById(userId, dependencyId);
      if (!dependencyGoal) {
        throw new Error(`Dependency goal ${dependencyId} not found`);
      }
      
      // Add this goal to the dependency's blocks list
      if (!dependencyGoal.blocksGoalIds.includes(goal.id)) {
        dependencyGoal.blocksGoalIds.push(goal.id);
        dependencyGoal.updatedAt = new Date().toISOString();
      }
    }

    mockGoals.push(goal);
    return goal;
  }

  async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<Goal> {
    const goal = await this.getGoalById(userId, goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }

    // Update goal properties
    Object.assign(goal, updates, {
      updatedAt: new Date().toISOString(),
    });

    return goal;
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goalIndex = mockGoals.findIndex(g => g.id === goalId && g.userId === userId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const goal = mockGoals[goalIndex];

    // Remove from parent's child list
    if (goal.parentGoalId) {
      const parentGoal = await this.getGoalById(userId, goal.parentGoalId);
      if (parentGoal) {
        parentGoal.childGoalIds = parentGoal.childGoalIds.filter(id => id !== goalId);
        parentGoal.updatedAt = new Date().toISOString();
      }
    }

    // Update child goals to remove parent reference
    for (const childId of goal.childGoalIds) {
      const childGoal = await this.getGoalById(userId, childId);
      if (childGoal) {
        childGoal.parentGoalId = undefined;
        childGoal.level = Math.max(0, childGoal.level - 1);
        childGoal.updatedAt = new Date().toISOString();
      }
    }

    // Remove from dependency relationships
    for (const dependencyId of goal.dependsOnGoalIds) {
      const dependencyGoal = await this.getGoalById(userId, dependencyId);
      if (dependencyGoal) {
        dependencyGoal.blocksGoalIds = dependencyGoal.blocksGoalIds.filter(id => id !== goalId);
        dependencyGoal.updatedAt = new Date().toISOString();
      }
    }

    // Remove from blocked goals' dependency lists
    for (const blockedId of goal.blocksGoalIds) {
      const blockedGoal = await this.getGoalById(userId, blockedId);
      if (blockedGoal) {
        blockedGoal.dependsOnGoalIds = blockedGoal.dependsOnGoalIds.filter(id => id !== goalId);
        blockedGoal.updatedAt = new Date().toISOString();
      }
    }

    mockGoals.splice(goalIndex, 1);
  }

  async completeGoal(userId: string, goalId: string): Promise<Goal> {
    const goal = await this.getGoalById(userId, goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.status === 'completed') {
      throw new Error('Goal already completed');
    }

    // Check if all dependencies are completed
    for (const dependencyId of goal.dependsOnGoalIds) {
      const dependencyGoal = await this.getGoalById(userId, dependencyId);
      if (!dependencyGoal || dependencyGoal.status !== 'completed') {
        throw new Error('Cannot complete goal: dependencies not met');
      }
    }

    // Update goal status
    goal.status = 'completed';
    goal.progress = 100;
    goal.completedAt = new Date().toISOString();
    goal.updatedAt = new Date().toISOString();

    // Complete all milestones
    goal.milestones.forEach(milestone => {
      if (!milestone.isCompleted) {
        milestone.isCompleted = true;
        milestone.completedAt = new Date().toISOString();
      }
    });

    // Award tokens for goal completion
    if (goal.tokenReward > 0) {
      await this.earnTokens(
        userId,
        goal.tokenReward,
        `Goal Completed: ${goal.title}`,
        'earned',
        goalId,
        'goal'
      );
    }

    // Award tokens for completed milestones
    for (const milestone of goal.milestones) {
      if (milestone.tokenReward > 0) {
        await this.earnTokens(
          userId,
          milestone.tokenReward,
          `Milestone Completed: ${milestone.title}`,
          'earned',
          milestone.id,
          'goal'
        );
      }
    }

    // Unlock achievement rewards
    for (const achievementId of goal.achievementRewards) {
      try {
        await this.unlockAchievement(userId, achievementId);
      } catch (error) {
        // Achievement might already be unlocked, continue
        console.warn(`Could not unlock achievement ${achievementId}:`, error);
      }
    }

    // Check for milestone unlocks
    await this.checkMilestoneUnlocks(userId);

    return goal;
  }

  async updateGoalProgress(userId: string, goalId: string, progress: number): Promise<Goal> {
    const goal = await this.getGoalById(userId, goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.status === 'completed') {
      throw new Error('Cannot update progress of completed goal');
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    goal.progress = progress;
    goal.updatedAt = new Date().toISOString();

    // Auto-complete if progress reaches 100%
    if (progress === 100 && goal.status !== 'completed') {
      return this.completeGoal(userId, goalId);
    }

    return goal;
  }

  async completeMilestone(userId: string, goalId: string, milestoneId: string): Promise<Goal> {
    const goal = await this.getGoalById(userId, goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }

    const milestone = goal.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.isCompleted) {
      throw new Error('Milestone already completed');
    }

    // Complete milestone
    milestone.isCompleted = true;
    milestone.completedAt = new Date().toISOString();
    goal.updatedAt = new Date().toISOString();

    // Award tokens for milestone completion
    if (milestone.tokenReward > 0) {
      await this.earnTokens(
        userId,
        milestone.tokenReward,
        `Milestone Completed: ${milestone.title}`,
        'earned',
        milestoneId,
        'goal'
      );
    }

    // Update goal progress based on completed milestones
    const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
    const totalMilestones = goal.milestones.length;
    
    if (totalMilestones > 0) {
      const milestoneProgress = (completedMilestones / totalMilestones) * 100;
      goal.progress = Math.max(goal.progress, milestoneProgress);
    }

    // Auto-complete goal if all milestones are done
    if (completedMilestones === totalMilestones && totalMilestones > 0) {
      return this.completeGoal(userId, goalId);
    }

    return goal;
  }

  async getGoalHierarchy(userId: string): Promise<Goal[]> {
    const allGoals = getGoalsByUserId(userId);
    
    // Return only root goals (level 0) with their children populated
    return allGoals.filter(goal => goal.level === 0);
  }

  async getGoalDependencies(userId: string, goalId: string): Promise<{
    dependencies: Goal[];
    blockedGoals: Goal[];
  }> {
    const goal = await this.getGoalById(userId, goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }

    const allGoals = getGoalsByUserId(userId);
    
    const dependencies = goal.dependsOnGoalIds
      .map(id => allGoals.find(g => g.id === id))
      .filter(Boolean) as Goal[];
    
    const blockedGoals = goal.blocksGoalIds
      .map(id => allGoals.find(g => g.id === id))
      .filter(Boolean) as Goal[];

    return { dependencies, blockedGoals };
  }

  async canCompleteGoal(userId: string, goalId: string): Promise<{
    canComplete: boolean;
    reasons: string[];
  }> {
    const goal = await this.getGoalById(userId, goalId);
    
    if (!goal) {
      return { canComplete: false, reasons: ['Goal not found'] };
    }

    const reasons: string[] = [];

    if (goal.status === 'completed') {
      reasons.push('Goal is already completed');
    }

    if (goal.status === 'cancelled') {
      reasons.push('Goal is cancelled');
    }

    // Check dependencies
    for (const dependencyId of goal.dependsOnGoalIds) {
      const dependencyGoal = await this.getGoalById(userId, dependencyId);
      if (!dependencyGoal) {
        reasons.push(`Dependency goal ${dependencyId} not found`);
      } else if (dependencyGoal.status !== 'completed') {
        reasons.push(`Dependency "${dependencyGoal.title}" is not completed`);
      }
    }

    return {
      canComplete: reasons.length === 0,
      reasons,
    };
  }

  // Utility Methods

  async getGamificationSummary(userId: string) {
    const [
      tokenBalance,
      recentTransactions,
      userAchievements,
      progress,
      milestones,
      goals
    ] = await Promise.all([
      this.getTokenBalance(userId),
      this.getTokenTransactions(userId, 10),
      this.getUserAchievements(userId),
      this.getProgressVisualization(userId),
      this.getMilestones(userId),
      this.getGoals(userId)
    ]);

    return {
      tokens: {
        balance: tokenBalance,
        recentTransactions,
      },
      achievements: {
        unlocked: userAchievements.filter(ua => ua.isCompleted),
        inProgress: userAchievements.filter(ua => !ua.isCompleted),
        available: mockAchievements.filter(a => a.isActive),
      },
      progress,
      milestones: {
        unlocked: milestones.filter(m => m.isUnlocked),
        available: milestones.filter(m => !m.isUnlocked),
      },
      goals: {
        active: goals.filter(g => g.status === 'in_progress'),
        completed: goals.filter(g => g.status === 'completed'),
      },
    };
  }
}