import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '../../../../backend/services/gamificationService';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const progress = await gamificationService.getProgressVisualization(userId);

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress visualization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress visualization' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const progress = await gamificationService.updateProgressVisualization(userId);

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress visualization:', error);
    return NextResponse.json(
      { error: 'Failed to update progress visualization' },
      { status: 500 }
    );
  }
}