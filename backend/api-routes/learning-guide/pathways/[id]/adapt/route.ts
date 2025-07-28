// API endpoint for adaptive pathway adjustments

import { NextRequest, NextResponse } from 'next/server';
import { dbConnection } from '@/backend/db';
import { PocketBaseLearningGuideRepository } from '@/backend/repositories/pocketbase-learning-guide-repositories';
import { AILearningEngine } from '@/backend/services/ai-learning-engine';

// POST /api/learning-guide/pathways/[id]/adapt - Adapt learning pathway based on performance
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pb = dbConnection.getPocketBase();
    const repository = new PocketBaseLearningGuideRepository(pb);
    const aiEngine = new AILearningEngine(repository);

    // Analyze and adapt the pathway
    const adaptedPathway = await aiEngine.adaptLearningPathway(params.id);

    if (!adaptedPathway) {
      return NextResponse.json(
        { error: 'Pathway not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ pathway: adaptedPathway });
  } catch (error) {
    console.error('Error adapting pathway:', error);
    return NextResponse.json(
      { error: 'Failed to adapt pathway' },
      { status: 500 }
    );
  }
}