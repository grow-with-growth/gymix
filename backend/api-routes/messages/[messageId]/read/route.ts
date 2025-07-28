import { NextRequest, NextResponse } from 'next/server';
import { threadMessages } from '@/lib/backend-integration';

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    await threadMessages.markAsRead(params.messageId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}