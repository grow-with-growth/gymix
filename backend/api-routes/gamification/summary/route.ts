import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../backend/services/gamificationService';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const summary = await gamificationService.getGamificationSummary(userId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching gamification summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gamification summary' },
      { status: 500 }
    );
  }
}