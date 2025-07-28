import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../backend/services/gamificationService';
import { z } from 'zod';

const gamificationService = new GamificationService();

const unlockSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  achievementId: z.string().min(1, 'Achievement ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = unlockSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { userId, achievementId } = validationResult.data;

    const userAchievement = await gamificationService.unlockAchievement(userId, achievementId);

    return NextResponse.json(userAchievement, { status: 201 });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Achievement not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Achievement already unlocked') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}