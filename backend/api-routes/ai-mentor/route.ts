import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/db';
import {
  MentorConversation,
  MentorMessage,
  MentorResource,
  CrisisDetection,
  MentorAnalytics,
  MentorConversationType,
  CrisisLevel,
  MentorResponseType
} from '@/types';
import PocketBase, { Record } from 'pocketbase';

// --- Helper Functions ---

// Crisis detection keywords and patterns
const crisisKeywords = {
  high: ['suicide', 'kill myself', 'end it all', 'not worth living', 'want to die'],
  medium: ['depressed', 'hopeless', 'can\'t cope', 'overwhelmed', 'panic attack', 'anxiety attack'],
  low: ['stressed', 'worried', 'anxious', 'sad', 'frustrated', 'tired'],
};

// Helper function to detect crisis level
function detectCrisisLevel(message: string): { level: CrisisLevel; indicators: string[]; confidence: number } {
  const lowerMessage = message.toLowerCase();
  const indicators: string[] = [];
  let level: CrisisLevel = 'low';
  let confidence = 0;

  for (const keyword of crisisKeywords.high) {
    if (lowerMessage.includes(keyword)) {
      indicators.push(keyword);
      level = 'high';
      confidence = Math.max(confidence, 0.9);
    }
  }

  if (level !== 'high') {
    for (const keyword of crisisKeywords.medium) {
      if (lowerMessage.includes(keyword)) {
        indicators.push(keyword);
        level = 'medium';
        confidence = Math.max(confidence, 0.6);
      }
    }
  }

  if (level === 'low') {
    for (const keyword of crisisKeywords.low) {
      if (lowerMessage.includes(keyword)) {
        indicators.push(keyword);
        confidence = Math.max(confidence, 0.3);
      }
    }
  }

  return { level, indicators, confidence };
}

// Helper function to generate AI response
async function generateAIResponse(pb: PocketBase, message: string, conversationType: MentorConversationType, crisisLevel?: CrisisLevel): Promise<{
  content: string;
  responseType: MentorResponseType;
  suggestedActions?: string[];
  resources?: MentorResource[];
}> {
  const lowerMessage = message.toLowerCase();

  if (crisisLevel === 'high') {
    const resources = await pb.collection('ai_mentor_resources').getFullList({ filter: "isEmergency = true" });
    return {
      content: "I'm very concerned about what you're sharing with me. Your safety and wellbeing are the most important things right now. Please know that you're not alone, and there are people who want to help you. I strongly encourage you to reach out to a crisis counselor or trusted adult immediately. Would you like me to provide you with some emergency resources?",
      responseType: 'crisis-intervention',
      suggestedActions: [
        'Contact crisis hotline immediately',
        'Reach out to a trusted adult',
        'Go to nearest emergency room if in immediate danger',
        'Call 911 if in immediate danger'
      ],
      resources: resources as MentorResource[],
    };
  }

  if (crisisLevel === 'medium') {
    const resources = await pb.collection('ai_mentor_resources').getFullList({ filter: "category = 'wellness' || priority = 'high'" });
    return {
      content: "I can hear that you're going through a really difficult time right now. It takes courage to share these feelings, and I want you to know that what you're experiencing is valid. While I'm here to support you, I think it would be really helpful for you to talk to a counselor or trusted adult who can provide more personalized support. In the meantime, let's explore some strategies that might help you cope with these feelings.",
      responseType: 'referral',
      suggestedActions: [
        'Schedule appointment with school counselor',
        'Talk to a trusted teacher or adult',
        'Practice stress-reduction techniques',
        'Consider reaching out to friends or family'
      ],
      resources: resources as MentorResource[],
    };
  }
  
  // TODO: Implement real AI logic here. For now, using canned responses.
  
  // Default supportive response
  return {
    content: "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about what's on your mind or how you're feeling right now?",
    responseType: 'question',
    suggestedActions: [
      'Take some time to reflect on your feelings',
      'Consider what support you might need',
      'Think about what would help you feel better'
    ],
  };
}

// --- API Handlers ---

export async function GET(request: NextRequest) {
  try {
    const pb = await getDb();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const conversationId = searchParams.get('conversationId');

    // For all actions, we need the user ID from the authenticated user
    const user = pb.authStore.model;
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = user.id;

    switch (action) {
      case 'conversations': {
        const records = await pb.collection('ai_mentor_conversations').getFullList({
          filter: `userId = '${userId}'`,
          sort: '-lastMessageAt',
        });
        return NextResponse.json({ conversations: records });
      }

      case 'messages': {
        if (!conversationId) {
          return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
        }
        // Ensure the user owns this conversation
        await pb.collection('ai_mentor_conversations').getFirstListItem(`id = '${conversationId}' && userId = '${userId}'`);
        
        const records = await pb.collection('ai_mentor_messages').getFullList({
          filter: `conversationId = '${conversationId}'`,
          sort: 'timestamp',
        });
        return NextResponse.json({ messages: records });
      }

      case 'resources': {
        const category = searchParams.get('category');
        const filter = category ? `category = '${category}'` : '';
        const records = await pb.collection('ai_mentor_resources').getFullList({ filter });
        return NextResponse.json({ resources: records });
      }
        
      case 'analytics': {
        // TODO: Implement real analytics based on database data
        const analytics: Partial<MentorAnalytics> = {
          userId,
          totalConversations: 0,
          activeConversations: 0,
          crisisInterventions: 0,
        };
        return NextResponse.json({ analytics });
      }

      case 'crisis-detections': {
        const records = await pb.collection('ai_mentor_crisis_detections').getFullList({
          filter: `userId = '${userId}'`,
          sort: '-created',
        });
        return NextResponse.json({ crisisDetections: records });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in AI mentor GET API:', error);
    const status = error.name === 'ClientResponseError' && error.status === 404 ? 404 : 500;
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const pb = await getDb();
    const body = await request.json();
    const { action } = body;

    const user = pb.authStore.model;
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = user.id;

    switch (action) {
      case 'create-conversation': {
        const { type, title } = body;
        const newConversation = await pb.collection('ai_mentor_conversations').create({
          userId,
          type: type || 'personal',
          title: title || 'New Conversation',
          isActive: true,
          lastMessageAt: new Date().toISOString(),
          messageCount: 0,
        });
        return NextResponse.json({ conversation: newConversation });
      }

      case 'send-message': {
        const { conversationId, content, type: conversationType } = body;
        
        const conversation = await pb.collection('ai_mentor_conversations').getOne(conversationId);
        if (conversation.userId !== userId) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const userMessage = await pb.collection('ai_mentor_messages').create({
          conversationId,
          sender: 'user',
          content,
          timestamp: new Date().toISOString(),
          isRead: true,
        });

        const crisisDetection = detectCrisisLevel(content);
        let crisisRecord = null;

        if (crisisDetection.level !== 'low' || crisisDetection.confidence > 0.5) {
          crisisRecord = await pb.collection('ai_mentor_crisis_detections').create({
            userId,
            conversationId,
            messageId: userMessage.id,
            level: crisisDetection.level,
            indicators: crisisDetection.indicators,
            confidence: crisisDetection.confidence,
            isResolved: false,
          });
          await pb.collection('ai_mentor_conversations').update(conversationId, { crisisLevel: crisisDetection.level });
        }

        const aiResponse = await generateAIResponse(pb, content, conversationType || conversation.type, crisisDetection.level);
        
        const aiMessage = await pb.collection('ai_mentor_messages').create({
            conversationId,
            sender: 'mentor',
            content: aiResponse.content,
            responseType: aiResponse.responseType,
            suggestedActions: aiResponse.suggestedActions,
            resources: aiResponse.resources,
            timestamp: new Date(Date.now() + 100).toISOString(),
            isRead: false,
        });

        await pb.collection('ai_mentor_conversations').update(conversationId, {
          'lastMessageAt': aiMessage.created,
          'messageCount+': 2,
        });

        return NextResponse.json({
          userMessage,
          aiMessage,
          crisisDetected: !!crisisRecord,
          crisisDetails: crisisRecord,
        });
      }

      case 'mark-crisis-resolved': {
        const { crisisId, resolvedBy, notes } = body;
        const crisis = await pb.collection('ai_mentor_crisis_detections').getOne(crisisId);
        if (crisis.userId !== userId) {
             return NextResponse.json({ error: 'Crisis detection not found' }, { status: 404 });
        }
        
        const updatedCrisis = await pb.collection('ai_mentor_crisis_detections').update(crisisId, {
          isResolved: true,
          resolvedAt: new Date().toISOString(),
          resolvedBy: resolvedBy || userId,
          notes,
        });
        return NextResponse.json({ success: true, crisis: updatedCrisis });
      }
        
      case 'end-conversation': {
        const { conversationId } = body;
        const conversation = await pb.collection('ai_mentor_conversations').getOne(conversationId);
        if (conversation.userId !== userId) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }
        const updatedConversation = await pb.collection('ai_mentor_conversations').update(conversationId, { isActive: false });
        return NextResponse.json({ success: true, conversation: updatedConversation });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in AI mentor POST API:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const pb = await getDb();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    const user = pb.authStore.model;
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = user.id;
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    
    const conversation = await pb.collection('ai_mentor_conversations').getOne(conversationId);
    if (conversation.userId !== userId) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Delete associated messages
    const messages = await pb.collection('ai_mentor_messages').getFullList({ filter: `conversationId = '${conversationId}'`});
    for(const message of messages) {
        await pb.collection('ai_mentor_messages').delete(message.id);
    }

    // Delete associated crisis detections
    const detections = await pb.collection('ai_mentor_crisis_detections').getFullList({ filter: `conversationId = '${conversationId}'`});
    for(const detection of detections) {
        await pb.collection('ai_mentor_crisis_detections').delete(detection.id);
    }
    
    // Delete conversation
    await pb.collection('ai_mentor_conversations').delete(conversationId);
    
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in AI mentor DELETE API:', error);
    const status = error.name === 'ClientResponseError' && error.status === 404 ? 404 : 500;
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status });
  }
}
