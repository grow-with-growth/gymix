// API endpoints for individual Learning Pathway

import { NextRequest, NextResponse } from 'next/server';
import { dbConnection } from '@/backend/db';
import { PocketBaseLearningGuideRepository } from '@/backend/repositories/pocketbase-learning-guide-repositories';
import { AILearningEngine } from '@/backend/services/ai-learning-engine';

// GET /api/learning-guide/pathways/[id] - Get pathway details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pb = dbConnection.getPocketBase();
    const repository = new PocketBaseLearningGuideRepository(pb);

    const pathway = await repository.pathways.findWithDetails(params.id);

    if (!pathway) {
      return NextResponse.json(
        { error: 'Pathway not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ pathway });
  } catch (error) {
    console.error('Error fetching pathway details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pathway details' },
      { status: 500 }
    );
  }
}

// PUT /api/learning-guide/pathways/[id] - Update pathway
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();

    const pb = dbConnection.getPocketBase();
    const repository = new PocketBaseLearningGuideRepository(pb);

    const updatedPathway = await repository.pathways.update(params.id, updates);

    if (!updatedPathway) {
      return NextResponse.json(
        { error: 'Pathway not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ pathway: updatedPathway });
  } catch (error) {
    console.error('Error updating pathway:', error);
    return NextResponse.json(
      { error: 'Failed to update pathway' },
      { status: 500 }
    );
  }
}

// DELETE /api/learning-guide/pathways/[id] - Delete pathway
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pb = dbConnection.getPocketBase();
    const repository = new PocketBaseLearningGuideRepository(pb);

    const success = await repository.pathways.delete(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Pathway not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pathway:', error);
    return NextResponse.json(
      { error: 'Failed to delete pathway' },
      { status: 500 }
    );
  }
}