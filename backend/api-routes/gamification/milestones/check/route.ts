import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../backend/services/gamificationService';

const gamificationService = new GamificationService();

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const unlockedMilestones = await gamificationService.checkMilestoneUnlocks(userId);

    return NextResponse.json({
      unlockedMilestones,
      count: unlockedMilestones.length
    });
  } catch (error) {
    console.error('Error checking milestone unlocks:', error);
    return NextResponse.json(
      { error: 'Failed to check milestone unlocks' },
      { status: 500 }
    );
  }
}