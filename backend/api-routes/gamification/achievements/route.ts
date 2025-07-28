import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../backend/services/gamificationService';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get user-specific achievements
      const userAchievements = await gamificationService.getUserAchievements(userId);
      return NextResponse.json(userAchievements);
    } else {
      // Get all available achievements
      const achievements = await gamificationService.getAchievements();
      return NextResponse.json(achievements);
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}