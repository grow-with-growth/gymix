import { NextRequest, NextResponse } from 'next/server';
import { messageThreads } from '@/lib/backend-integration';

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const thread = await messageThreads.getById(params.threadId);
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(thread);
  } catch (error) {
    console.error('Failed to fetch thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const body = await request.json();
    const thread = await messageThreads.update(params.threadId, body);
    
    return NextResponse.json(thread);
  } catch (error) {
    console.error('Failed to update thread:', error);
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}