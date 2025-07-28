import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../backend/services/gamificationService';
import { goalUpdateSchema } from '../../../../../backend/validation/schemas';

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

    const goal = await gamificationService.getGoalById(userId, params.goalId);

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const body = await request.json();
    
    // Add goalId to the body for validation
    const dataWithId = { ...body, id: params.goalId };
    
    // Validate request body
    const validationResult = goalUpdateSchema.safeParse(dataWithId);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { userId, id, ...updates } = validationResult.data;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const goal = await gamificationService.updateGoal(userId, params.goalId, updates);

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    
    if (error instanceof Error && error.message === 'Goal not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await gamificationService.deleteGoal(userId, params.goalId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    
    if (error instanceof Error && error.message === 'Goal not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}