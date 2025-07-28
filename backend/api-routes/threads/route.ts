import { NextRequest, NextResponse } from 'next/server';
import { messageThreads } from '@/lib/backend-integration';
import { messageThreadSchema } from '@/backend/validation/schemas';

export async function GET(request: NextRequest) {
  try {
    const threads = await messageThreads.getAll();
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Failed to fetch threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = messageThreadSchema.omit({ id: true }).safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid thread data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { subject, participants } = validationResult.data;
    const thread = await messageThreads.create(subject, participants);
    
    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Failed to create thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}