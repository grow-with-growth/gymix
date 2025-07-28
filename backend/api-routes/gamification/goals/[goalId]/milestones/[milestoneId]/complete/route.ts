import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../../../../backend/services/gamificationService';

const gamificationService = new GamificationService();

export async function POST(
  request: NextRequest,
  { params }: { params: { goalId: string; milestoneId: string } }
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

    const goal = await gamificationService.completeMilestone(
      userId, 
      params.goalId, 
      params.milestoneId
    );

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error completing milestone:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Goal not found' || error.message === 'Milestone not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes('already completed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to complete milestone' },
      { status: 500 }
    );
  }
}