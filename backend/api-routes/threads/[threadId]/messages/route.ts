import { NextRequest, NextResponse } from 'next/server';
import { threadMessages } from '@/lib/backend-integration';
import { threadMessageCreateSchema } from '@/backend/validation/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const messages = await threadMessages.getByThreadId(params.threadId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch thread messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const body = await request.json();
    
    // Ensure threadId matches the URL parameter
    body.threadId = params.threadId;
    
    // Validate the request body
    const validationResult = threadMessageCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid message data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const message = await threadMessages.create(validationResult.data);
    
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Failed to create thread message:', error);
    return NextResponse.json(
      { error: 'Failed to create thread message' },
      { status: 500 }
    );
  }
}