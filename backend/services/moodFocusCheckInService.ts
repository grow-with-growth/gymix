import { nanoid } from 'nanoid';
import type { MoodFocusCheckIn, CheckInSummary, CheckInTrends } from '../../types';
import {
  mockMoodFocusCheckIns,
  getMoodFocusCheckInsByUserId,
  getMoodFocusCheckInByUserIdAndDate,
  getMoodFocusCheckInsByDateRange,
  generateCheckInSummary,
  generateCheckInTrends
} from '../mockData/moodFocusCheckInData';

export class MoodFocusCheckInService {
  // Check-in CRUD operations

  async getCheckInsByUserId(userId: string, limit?: number): Promise<MoodFocusCheckIn[]> {
    const checkIns = getMoodFocusCheckInsByUserId(userId);
    const sortedCheckIns = checkIns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (limit) {
      return sortedCheckIns.slice(0, limit);
    }
    
    return sortedCheckIns;
  }

  async getCheckInByDate(userId: string, date: string): Promise<MoodFocusCheckIn | null> {
    return getMoodFocusCheckInByUserIdAndDate(userId, date);
  }

  async getCheckInsByDateRange(userId: string, startDate: string, endDate: string): Promise<MoodFocusCheckIn[]> {
    return getMoodFocusCheckInsByDateRange(userId, startDate, endDate);
  }

  async getTodaysCheckIn(userId: string): Promise<MoodFocusCheckIn | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.getCheckInByDate(userId, today);
  }

  async createCheckIn(
    userId: string,
    checkInData: Omit<MoodFocusCheckIn, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<MoodFocusCheckIn> {
    // Check if check-in already exists for this date
    const existingCheckIn = await this.getCheckInByDate(userId, checkInData.date);
    if (existingCheckIn) {
      throw new Error('Check-in already exists for this date');
    }

    const checkIn: MoodFocusCheckIn = {
      id: nanoid(),
      userId,
      ...checkInData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockMoodFocusCheckIns.push(checkIn);

    // Award tokens for daily check-in
    // This would integrate with the gamification service
    // await this.gamificationService.earnTokens(userId, 5, 'Daily mood check-in', 'earned');

    return checkIn;
  }

  async updateCheckIn(
    userId: string,
    checkInId: string,
    updates: Partial<MoodFocusCheckIn>
  ): Promise<MoodFocusCheckIn> {
    const checkInIndex = mockMoodFocusCheckIns.findIndex(
      checkIn => checkIn.id === checkInId && checkIn.userId === userId
    );

    if (checkInIndex === -1) {
      throw new Error('Check-in not found');
    }

    const checkIn = mockMoodFocusCheckIns[checkInIndex];
    
    // Update check-in properties
    Object.assign(checkIn, updates, {
      updatedAt: new Date().toISOString()
    });

    return checkIn;
  }

  async deleteCheckIn(userId: string, checkInId: string): Promise<void> {
    const checkInIndex = mockMoodFocusCheckIns.findIndex(
      checkIn => checkIn.id === checkInId && checkIn.userId === userId
    );

    if (checkInIndex === -1) {
      throw new Error('Check-in not found');
    }

    mockMoodFocusCheckIns.splice(checkInIndex, 1);
  }

  // Analytics and summary methods

  async getCheckInSummary(userId: string, date?: string): Promise<CheckInSummary> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return generateCheckInSummary(userId, targetDate);
  }

  async getCheckInTrends(userId: string, startDate: string, endDate: string): Promise<CheckInTrends> {
    return generateCheckInTrends(userId, startDate, endDate);
  }

  async getWeeklyTrends(userId: string): Promise<CheckInTrends> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.getCheckInTrends(userId, startDate, endDate);
  }

  async getMonthlyTrends(userId: string): Promise<CheckInTrends> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.getCheckInTrends(userId, startDate, endDate);
  }

  async getCheckInStreak(userId: string): Promise<number> {
    const summary = await this.getCheckInSummary(userId);
    return summary.streak;
  }

  async hasCheckedInToday(userId: string): Promise<boolean> {
    const todaysCheckIn = await this.getTodaysCheckIn(userId);
    return todaysCheckIn !== null;
  }

  // Utility methods

  async getAverageMoodForPeriod(userId: string, days: number = 7): Promise<{
    mood: number;
    focus: number;
    energy: number;
    stress: number;
  }> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const checkIns = await this.getCheckInsByDateRange(userId, startDate, endDate);
    
    if (checkIns.length === 0) {
      return { mood: 0, focus: 0, energy: 0, stress: 0 };
    }

    const totals = checkIns.reduce(
      (acc, checkIn) => ({
        mood: acc.mood + checkIn.mood,
        focus: acc.focus + checkIn.focus,
        energy: acc.energy + checkIn.energy,
        stress: acc.stress + checkIn.stress
      }),
      { mood: 0, focus: 0, energy: 0, stress: 0 }
    );

    return {
      mood: Math.round((totals.mood / checkIns.length) * 10) / 10,
      focus: Math.round((totals.focus / checkIns.length) * 10) / 10,
      energy: Math.round((totals.energy / checkIns.length) * 10) / 10,
      stress: Math.round((totals.stress / checkIns.length) * 10) / 10
    };
  }

  async getInsights(userId: string): Promise<{
    type: 'positive' | 'neutral' | 'concern';
    title: string;
    message: string;
    recommendation?: string;
  }[]> {
    const weeklyAverage = await this.getAverageMoodForPeriod(userId, 7);
    const monthlyAverage = await this.getAverageMoodForPeriod(userId, 30);
    const streak = await this.getCheckInStreak(userId);
    
    const insights: {
      type: 'positive' | 'neutral' | 'concern';
      title: string;
      message: string;
      recommendation?: string;
    }[] = [];

    // Streak insights
    if (streak >= 7) {
      insights.push({
        type: 'positive',
        title: 'Great Consistency!',
        message: `You've maintained a ${streak}-day check-in streak. Keep it up!`,
        recommendation: 'Continue your daily check-ins to track your wellness journey.'
      });
    } else if (streak === 0) {
      insights.push({
        type: 'neutral',
        title: 'Start Your Wellness Journey',
        message: 'Begin tracking your daily mood and focus to understand your patterns.',
        recommendation: 'Try to check in at the same time each day to build a habit.'
      });
    }

    // Mood insights
    if (weeklyAverage.mood >= 4) {
      insights.push({
        type: 'positive',
        title: 'Positive Mood Trend',
        message: `Your average mood this week is ${weeklyAverage.mood}/5. You're doing great!`
      });
    } else if (weeklyAverage.mood <= 2) {
      insights.push({
        type: 'concern',
        title: 'Mood Support Needed',
        message: `Your average mood this week is ${weeklyAverage.mood}/5. Consider reaching out for support.`,
        recommendation: 'Try mindfulness exercises, talk to a friend, or consider professional support.'
      });
    }

    // Focus insights
    if (weeklyAverage.focus <= 2) {
      insights.push({
        type: 'concern',
        title: 'Focus Challenges',
        message: `Your average focus this week is ${weeklyAverage.focus}/5.`,
        recommendation: 'Try breaking tasks into smaller chunks, eliminate distractions, or take regular breaks.'
      });
    } else if (weeklyAverage.focus >= 4) {
      insights.push({
        type: 'positive',
        title: 'Excellent Focus',
        message: `Your average focus this week is ${weeklyAverage.focus}/5. Great concentration!`
      });
    }

    // Stress insights
    if (weeklyAverage.stress >= 4) {
      insights.push({
        type: 'concern',
        title: 'High Stress Levels',
        message: `Your average stress this week is ${weeklyAverage.stress}/5.`,
        recommendation: 'Consider stress-reduction techniques like deep breathing, exercise, or talking to someone.'
      });
    } else if (weeklyAverage.stress <= 2) {
      insights.push({
        type: 'positive',
        title: 'Low Stress Levels',
        message: `Your average stress this week is ${weeklyAverage.stress}/5. You're managing stress well!`
      });
    }

    return insights;
  }
}