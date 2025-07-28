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

    const dependencies = await gamificationService.getGoalDependencies(userId, params.goalId);

    return NextResponse.json(dependencies);
  } catch (error) {
    console.error('Error fetching goal dependencies:', error);
    
    if (error instanceof Error && error.message === 'Goal not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch goal dependencies' },
      { status: 500 }
    );
  }
}