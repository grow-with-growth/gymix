import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../backend/services/gamificationService';
import { tokenTransactionSchema } from '../../../../../backend/validation/schemas';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const transactions = await gamificationService.getTokenTransactions(userId, limit);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = tokenTransactionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { userId, amount, reason, type, relatedEntityId, relatedEntityType, metadata } = validationResult.data;

    let transaction;
    if (amount > 0) {
      transaction = await gamificationService.earnTokens(
        userId,
        amount,
        reason,
        type as 'earned' | 'bonus',
        relatedEntityId,
        relatedEntityType,
        metadata || {}
      );
    } else {
      transaction = await gamificationService.spendTokens(
        userId,
        Math.abs(amount),
        reason,
        relatedEntityId,
        metadata || {}
      );
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating token transaction:', error);
    
    if (error instanceof Error && error.message === 'Insufficient token balance') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create token transaction' },
      { status: 500 }
    );
  }
}