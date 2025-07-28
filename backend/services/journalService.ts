import { nanoid } from 'nanoid';
import type {
  JournalEntry,
  JournalTemplate,
  JournalGoal,
  ReflectionPrompt,
  JournalAnalytics,
  JournalInsight,
  MoodLevel,
  FocusLevel,
  EnergyLevel,
  StressLevel
} from '../../types';
import {
  mockJournalEntries,
  mockJournalTemplates,
  mockJournalGoals,
  mockReflectionPrompts,
  getJournalEntriesByUserId,
  getJournalEntryByUserIdAndDate,
  getJournalEntriesByDateRange,
  getJournalGoalsByUserId,
  getActiveJournalGoalsByUserId,
  getReflectionPromptsByCategory,
  getActiveReflectionPrompts,
  getPublicJournalTemplates,
  generateJournalAnalytics
} from '../mockData/journalData';

export class JournalService {
  // Journal Entry Methods

  async getJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]> {
    const entries = getJournalEntriesByUserId(userId);
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (limit) {
      return sortedEntries.slice(0, limit);
    }
    
    return sortedEntries;
  }

  async getJournalEntryByDate(userId: string, date: string): Promise<JournalEntry | null> {
    return getJournalEntryByUserIdAndDate(userId, date);
  }

  async getJournalEntriesByDateRange(userId: string, startDate: string, endDate: string): Promise<JournalEntry[]> {
    return getJournalEntriesByDateRange(userId, startDate, endDate);
  }

  async getJournalEntryById(userId: string, entryId: string): Promise<JournalEntry | null> {
    const entries = getJournalEntriesByUserId(userId);
    return entries.find(entry => entry.id === entryId) || null;
  }

  async createJournalEntry(
    userId: string,
    entryData: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<JournalEntry> {
    // Check if entry already exists for this date
    const existingEntry = await this.getJournalEntryByDate(userId, entryData.date);
    if (existingEntry) {
      throw new Error('Journal entry already exists for this date');
    }

    const entry: JournalEntry = {
      id: nanoid(),
      userId,
      ...entryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockJournalEntries.push(entry);

    // Update journal goals progress
    await this.updateJournalGoalsProgress(userId);

    // Award tokens for journaling
    // This would integrate with the gamification service
    // await this.gamificationService.earnTokens(userId, 10, 'Daily journal entry', 'earned');

    return entry;
  }

  async updateJournalEntry(
    userId: string,
    entryId: string,
    updates: Partial<JournalEntry>
  ): Promise<JournalEntry> {
    const entryIndex = mockJournalEntries.findIndex(
      entry => entry.id === entryId && entry.userId === userId
    );

    if (entryIndex === -1) {
      throw new Error('Journal entry not found');
    }

    const entry = mockJournalEntries[entryIndex];
    
    // Update entry properties
    Object.assign(entry, updates, {
      updatedAt: new Date().toISOString()
    });

    return entry;
  }

  async deleteJournalEntry(userId: string, entryId: string): Promise<void> {
    const entryIndex = mockJournalEntries.findIndex(
      entry => entry.id === entryId && entry.userId === userId
    );

    if (entryIndex === -1) {
      throw new Error('Journal entry not found');
    }

    mockJournalEntries.splice(entryIndex, 1);

    // Update journal goals progress
    await this.updateJournalGoalsProgress(userId);
  }

  async searchJournalEntries(
    userId: string,
    query: string,
    tags?: string[]
  ): Promise<JournalEntry[]> {
    const entries = getJournalEntriesByUserId(userId);
    
    return entries.filter(entry => {
      const matchesQuery = query === '' || 
        entry.title?.toLowerCase().includes(query.toLowerCase()) ||
        entry.content.toLowerCase().includes(query.toLowerCase()) ||
        entry.reflectionPrompts.some(prompt => 
          prompt.response.toLowerCase().includes(query.toLowerCase())
        );

      const matchesTags = !tags || tags.length === 0 || 
        tags.some(tag => entry.tags.includes(tag));

      return matchesQuery && matchesTags;
    });
  }

  // Reflection Prompt Methods

  async getReflectionPrompts(): Promise<ReflectionPrompt[]> {
    return getActiveReflectionPrompts();
  }

  async getReflectionPromptsByCategory(category: string): Promise<ReflectionPrompt[]> {
    return getReflectionPromptsByCategory(category);
  }

  async getDailyPrompts(): Promise<ReflectionPrompt[]> {
    return getReflectionPromptsByCategory('daily');
  }

  async getWeeklyPrompts(): Promise<ReflectionPrompt[]> {
    return getReflectionPromptsByCategory('weekly');
  }

  async getMonthlyPrompts(): Promise<ReflectionPrompt[]> {
    return getReflectionPromptsByCategory('monthly');
  }

  async getRandomPrompt(category?: string): Promise<ReflectionPrompt | null> {
    let prompts: ReflectionPrompt[];
    
    if (category) {
      prompts = getReflectionPromptsByCategory(category);
    } else {
      prompts = getActiveReflectionPrompts();
    }

    if (prompts.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }

  // Journal Template Methods

  async getJournalTemplates(): Promise<JournalTemplate[]> {
    return getPublicJournalTemplates();
  }

  async getJournalTemplateById(templateId: string): Promise<JournalTemplate | null> {
    return mockJournalTemplates.find(template => template.id === templateId) || null;
  }

  async createJournalTemplate(
    creatorId: string,
    templateData: Omit<JournalTemplate, 'id' | 'createdBy' | 'createdAt'>
  ): Promise<JournalTemplate> {
    const template: JournalTemplate = {
      id: nanoid(),
      createdBy: creatorId,
      createdAt: new Date().toISOString(),
      ...templateData
    };

    mockJournalTemplates.push(template);
    return template;
  }

  // Journal Goal Methods

  async getJournalGoals(userId: string): Promise<JournalGoal[]> {
    return getJournalGoalsByUserId(userId);
  }

  async getActiveJournalGoals(userId: string): Promise<JournalGoal[]> {
    return getActiveJournalGoalsByUserId(userId);
  }

  async getJournalGoalById(userId: string, goalId: string): Promise<JournalGoal | null> {
    const goals = getJournalGoalsByUserId(userId);
    return goals.find(goal => goal.id === goalId) || null;
  }

  async createJournalGoal(
    userId: string,
    goalData: Omit<JournalGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<JournalGoal> {
    const goal: JournalGoal = {
      id: nanoid(),
      userId,
      ...goalData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockJournalGoals.push(goal);
    return goal;
  }

  async updateJournalGoal(
    userId: string,
    goalId: string,
    updates: Partial<JournalGoal>
  ): Promise<JournalGoal> {
    const goalIndex = mockJournalGoals.findIndex(
      goal => goal.id === goalId && goal.userId === userId
    );

    if (goalIndex === -1) {
      throw new Error('Journal goal not found');
    }

    const goal = mockJournalGoals[goalIndex];
    
    // Update goal properties
    Object.assign(goal, updates, {
      updatedAt: new Date().toISOString()
    });

    return goal;
  }

  async deleteJournalGoal(userId: string, goalId: string): Promise<void> {
    const goalIndex = mockJournalGoals.findIndex(
      goal => goal.id === goalId && goal.userId === userId
    );

    if (goalIndex === -1) {
      throw new Error('Journal goal not found');
    }

    mockJournalGoals.splice(goalIndex, 1);
  }

  async completeJournalGoal(userId: string, goalId: string): Promise<JournalGoal> {
    const goal = await this.getJournalGoalById(userId, goalId);
    
    if (!goal) {
      throw new Error('Journal goal not found');
    }

    if (goal.isCompleted) {
      throw new Error('Goal is already completed');
    }

    goal.isCompleted = true;
    goal.completedAt = new Date().toISOString();
    goal.updatedAt = new Date().toISOString();

    // Award tokens for goal completion
    // This would integrate with the gamification service
    // await this.gamificationService.earnTokens(userId, 50, `Journal Goal Completed: ${goal.title}`, 'earned');

    return goal;
  }

  private async updateJournalGoalsProgress(userId: string): Promise<void> {
    const goals = getActiveJournalGoalsByUserId(userId);
    const entries = getJournalEntriesByUserId(userId);

    for (const goal of goals) {
      let newValue = 0;

      switch (goal.targetMetric) {
        case 'entries_per_week':
          // Calculate entries in the current week
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(0, 0, 0, 0);
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const weekEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= weekStart && entryDate <= weekEnd;
          });
          
          newValue = weekEntries.length;
          break;

        case 'mood_improvement':
          // Calculate average mood from recent entries
          const recentEntries = entries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7); // Last 7 entries
          
          if (recentEntries.length > 0) {
            newValue = recentEntries.reduce((sum, entry) => sum + entry.mood.mood, 0) / recentEntries.length;
          }
          break;

        case 'stress_reduction':
          // Calculate average stress from recent entries (lower is better)
          const recentStressEntries = entries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7); // Last 7 entries
          
          if (recentStressEntries.length > 0) {
            newValue = recentStressEntries.reduce((sum, entry) => sum + entry.mood.stress, 0) / recentStressEntries.length;
          }
          break;

        case 'focus_improvement':
          // Calculate average focus from recent entries
          const recentFocusEntries = entries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7); // Last 7 entries
          
          if (recentFocusEntries.length > 0) {
            newValue = recentFocusEntries.reduce((sum, entry) => sum + entry.mood.focus, 0) / recentFocusEntries.length;
          }
          break;

        case 'custom':
          // Custom metrics would be handled based on specific requirements
          break;
      }

      // Update goal progress
      goal.currentValue = newValue;
      goal.updatedAt = new Date().toISOString();

      // Check if goal is completed
      let isCompleted = false;
      switch (goal.targetMetric) {
        case 'entries_per_week':
        case 'mood_improvement':
        case 'focus_improvement':
          isCompleted = newValue >= goal.targetValue;
          break;
        case 'stress_reduction':
          isCompleted = newValue <= goal.targetValue;
          break;
      }

      if (isCompleted && !goal.isCompleted) {
        await this.completeJournalGoal(userId, goal.id);
      }
    }
  }

  // Analytics Methods

  async getJournalAnalytics(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<JournalAnalytics> {
    const defaultEndDate = endDate || new Date().toISOString().split('T')[0];
    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return generateJournalAnalytics(userId, defaultStartDate, defaultEndDate);
  }

  async getMoodTrends(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    mood: { date: string; value: MoodLevel }[];
    focus: { date: string; value: FocusLevel }[];
    energy: { date: string; value: EnergyLevel }[];
    stress: { date: string; value: StressLevel }[];
  }> {
    const entries = getJournalEntriesByDateRange(userId, startDate, endDate);
    
    return {
      mood: entries.map(entry => ({ date: entry.date, value: entry.mood.mood })),
      focus: entries.map(entry => ({ date: entry.date, value: entry.mood.focus })),
      energy: entries.map(entry => ({ date: entry.date, value: entry.mood.energy })),
      stress: entries.map(entry => ({ date: entry.date, value: entry.mood.stress }))
    };
  }

  async getProgressTrends(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    academicProgress: { date: string; value: number }[];
    personalGrowth: { date: string; value: number }[];
    socialConnections: { date: string; value: number }[];
    healthWellness: { date: string; value: number }[];
    skillDevelopment: { date: string; value: number }[];
  }> {
    const entries = getJournalEntriesByDateRange(userId, startDate, endDate);
    
    return {
      academicProgress: entries.map(entry => ({ date: entry.date, value: entry.progress.academicProgress })),
      personalGrowth: entries.map(entry => ({ date: entry.date, value: entry.progress.personalGrowth })),
      socialConnections: entries.map(entry => ({ date: entry.date, value: entry.progress.socialConnections })),
      healthWellness: entries.map(entry => ({ date: entry.date, value: entry.progress.healthWellness })),
      skillDevelopment: entries.map(entry => ({ date: entry.date, value: entry.progress.skillDevelopment }))
    };
  }

  async getJournalInsights(userId: string): Promise<JournalInsight[]> {
    const analytics = await this.getJournalAnalytics(userId);
    return analytics.insights;
  }

  async getJournalStreak(userId: string): Promise<{
    current: number;
    longest: number;
    lastEntryDate: string;
  }> {
    const analytics = await this.getJournalAnalytics(userId);
    return analytics.streaks;
  }

  async getTopTags(userId: string, limit: number = 10): Promise<{ tag: string; count: number }[]> {
    const entries = getJournalEntriesByUserId(userId);
    const tagCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Utility Methods

  async getJournalSummary(userId: string) {
    const [
      recentEntries,
      activeGoals,
      analytics,
      topTags
    ] = await Promise.all([
      this.getJournalEntries(userId, 5),
      this.getActiveJournalGoals(userId),
      this.getJournalAnalytics(userId),
      this.getTopTags(userId, 5)
    ]);

    return {
      recentEntries,
      activeGoals,
      analytics: {
        totalEntries: analytics.totalEntries,
        currentStreak: analytics.streaks.current,
        longestStreak: analytics.streaks.longest,
        averageMood: analytics.moodTrends.mood.length > 0 
          ? analytics.moodTrends.mood.reduce((sum, item) => sum + item.value, 0) / analytics.moodTrends.mood.length
          : 0
      },
      topTags,
      insights: analytics.insights.slice(0, 3) // Top 3 insights
    };
  }

  async exportJournalData(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const entries = getJournalEntriesByUserId(userId);
    
    if (format === 'json') {
      return JSON.stringify(entries, null, 2);
    } else {
      // CSV format
      const headers = [
        'Date', 'Title', 'Content', 'Mood', 'Focus', 'Energy', 'Stress',
        'Academic Progress', 'Personal Growth', 'Social Connections', 
        'Health Wellness', 'Skill Development', 'Tags'
      ];
      
      const csvRows = [
        headers.join(','),
        ...entries.map(entry => [
          entry.date,
          `"${entry.title || ''}"`,
          `"${entry.content.replace(/"/g, '""')}"`,
          entry.mood.mood,
          entry.mood.focus,
          entry.mood.energy,
          entry.mood.stress,
          entry.progress.academicProgress,
          entry.progress.personalGrowth,
          entry.progress.socialConnections,
          entry.progress.healthWellness,
          entry.progress.skillDevelopment,
          `"${entry.tags.join(', ')}"`
        ].join(','))
      ];
      
      return csvRows.join('\n');
    }
  }
}