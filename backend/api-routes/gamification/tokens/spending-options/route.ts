import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../backend/services/gamificationService';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  try {
    const spendingOptions = await gamificationService.getTokenSpendingOptions();

    return NextResponse.json(spendingOptions);
  } catch (error) {
    console.error('Error fetching token spending options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token spending options' },
      { status: 500 }
    );
  }
}