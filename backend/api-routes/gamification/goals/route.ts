import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../backend/services/gamificationService';
import { goalSchemaComplete, goalCreateSchema } from '../../../../backend/validation/schemas';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const hierarchy = searchParams.get('hierarchy') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let goals;
    if (hierarchy) {
      goals = await gamificationService.getGoalHierarchy(userId);
    } else {
      goals = await gamificationService.getGoals(userId);
    }

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = goalCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { userId, ...goalData } = validationResult.data;

    const goal = await gamificationService.createGoal(userId, goalData);

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}