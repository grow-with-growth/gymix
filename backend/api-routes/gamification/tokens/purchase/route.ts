import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../backend/services/gamificationService';
import { z } from 'zod';

const gamificationService = new GamificationService();

const purchaseSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  spendingOptionId: z.string().min(1, 'Spending option ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = purchaseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { userId, spendingOptionId } = validationResult.data;

    const transaction = await gamificationService.purchaseSpendingOption(userId, spendingOptionId);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error purchasing spending option:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Insufficient token balance') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      if (error.message === 'Spending option not found' || error.message === 'Spending option is not available') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to purchase spending option' },
      { status: 500 }
    );
  }
}