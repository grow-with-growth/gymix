import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { StudySession, StudySessionType } from '@/types';

// Mock data storage
let mockStudySessions: StudySession[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user1';
  const playlistId = searchParams.get('playlistId');
  const sessionType = searchParams.get('sessionType') as StudySessionType;
  const limit = parseInt(searchParams.get('limit') || '50');
  
  try {
    let filteredSessions = mockStudySessions.filter(session => session.userId === userId);
    
    if (playlistId) {
      filteredSessions = filteredSessions.filter(session => session.playlistId === playlistId);
    }
    
    if (sessionType) {
      filteredSessions = filteredSessions.filter(session => session.sessionType === sessionType);
    }
    
    // Sort by most recent first
    filteredSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply limit
    filteredSessions = filteredSessions.slice(0, limit);
    
    return NextResponse.json({ sessions: filteredSessions });
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = 'user1' } = body;
    
    switch (action) {
      case 'start':
        const { playlistId, sessionType } = body;
        
        const newSession: StudySession = {
          id: nanoid(),
          userId,
          playlistId,
          sessionType,
          startTime: new Date().toISOString(),
          tracksPlayed: [],
          createdAt: new Date().toISOString(),
        };
        
        mockStudySessions.push(newSession);
        
        return NextResponse.json({ session: newSession });
        
      case 'end':
        const { sessionId, focusRating, productivityRating, notes, tracksPlayed } = body;
        
        const sessionIndex = mockStudySessions.findIndex(s => s.id === sessionId && s.userId === userId);
        
        if (sessionIndex >= 0) {
          const session = mockStudySessions[sessionIndex];
          const endTime = new Date().toISOString();
          const duration = Math.round((new Date(endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60));
          
          mockStudySessions[sessionIndex] = {
            ...session,
            endTime,
            duration,
            focusRating,
            productivityRating,
            notes,
            tracksPlayed: tracksPlayed || session.tracksPlayed,
          };
          
          return NextResponse.json({ session: mockStudySessions[sessionIndex] });
        } else {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
      case 'update':
        const { sessionId: updateSessionId, tracksPlayed: updateTracksPlayed } = body;
        
        const updateSessionIndex = mockStudySessions.findIndex(s => s.id === updateSessionId && s.userId === userId);
        
        if (updateSessionIndex >= 0) {
          mockStudySessions[updateSessionIndex].tracksPlayed = updateTracksPlayed;
          return NextResponse.json({ session: mockStudySessions[updateSessionIndex] });
        } else {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in study sessions POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId') || 'user1';
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    const sessionIndex = mockStudySessions.findIndex(s => s.id === sessionId && s.userId === userId);
    
    if (sessionIndex >= 0) {
      mockStudySessions.splice(sessionIndex, 1);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in study sessions DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}