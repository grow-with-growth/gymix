import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../../backend/services/gamificationService';

const gamificationService = new GamificationService();

export async function GET(
  request: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await gamificationService.canCompleteGoal(userId, params.goalId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking goal completion eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check goal completion eligibility' },
      { status: 500 }
    );
  }
}