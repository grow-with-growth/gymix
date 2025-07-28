import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../../backend/services/gamificationService';
import { z } from 'zod';

const gamificationService = new GamificationService();

const progressUpdateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  progress: z.number().min(0, 'Progress cannot be negative').max(100, 'Progress cannot exceed 100'),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = progressUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { userId, progress } = validationResult.data;

    const goal = await gamificationService.updateGoalProgress(userId, params.goalId, progress);

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal progress:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Goal not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes('completed goal') || error.message.includes('between 0 and 100')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update goal progress' },
      { status: 500 }
    );
  }
}