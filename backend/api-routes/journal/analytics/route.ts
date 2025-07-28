import { NextRequest, NextResponse } from 'next/server';
import { JournalService } from '../../../../backend/services/journalService';

const journalService = new JournalService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (type === 'analytics') {
      const analytics = await journalService.getJournalAnalytics(userId, startDate || undefined, endDate || undefined);
      return NextResponse.json(analytics);
    } else if (type === 'mood-trends') {
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'Start date and end date are required for mood trends' },
          { status: 400 }
        );
      }
      const trends = await journalService.getMoodTrends(userId, startDate, endDate);
      return NextResponse.json(trends);
    } else if (type === 'progress-trends') {
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'Start date and end date are required for progress trends' },
          { status: 400 }
        );
      }
      const trends = await journalService.getProgressTrends(userId, startDate, endDate);
      return NextResponse.json(trends);
    } else if (type === 'insights') {
      const insights = await journalService.getJournalInsights(userId);
      return NextResponse.json(insights);
    } else if (type === 'streak') {
      const streak = await journalService.getJournalStreak(userId);
      return NextResponse.json(streak);
    } else if (type === 'top-tags') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const topTags = await journalService.getTopTags(userId, limit);
      return NextResponse.json(topTags);
    } else if (type === 'summary') {
      const summary = await journalService.getJournalSummary(userId);
      return NextResponse.json(summary);
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be analytics, mood-trends, progress-trends, insights, streak, top-tags, or summary' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching journal analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}