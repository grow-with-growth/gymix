import { NextRequest, NextResponse } from 'next/server';
import { AILearningEngine } from '../../../../backend/services/ai-learning-engine';
import { PocketBaseLearningGuideRepository } from '../../../../backend/repositories/pocketbase-learning-guide-repositories';
import { dbConnection } from '../../../../backend/db';

// Get content suggestions for an objective
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');
    const objectiveId = url.searchParams.get('objectiveId');
    
    if (!studentId || !objectiveId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and Objective ID are required'
      }, { status: 400 });
    }
    
    const pb = dbConnection.getPocketBase();
    const repository = new PocketBaseLearningGuideRepository(pb);
    const engine = new AILearningEngine(repository);
    
    const suggestions = await engine.generateContentSuggestions(studentId, objectiveId);
    
    return NextResponse.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching content suggestions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch content suggestions'
    }, { status: 500 });
  }
}