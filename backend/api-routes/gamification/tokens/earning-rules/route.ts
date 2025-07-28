import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../../backend/services/gamificationService';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  try {
    const earningRules = await gamificationService.getTokenEarningRules();

    return NextResponse.json(earningRules);
  } catch (error) {
    console.error('Error fetching token earning rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token earning rules' },
      { status: 500 }
    );
  }
}