import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { 
  MeditationSession, 
  BreathingExercise, 
  StressReductionActivity,
  UserMeditationSession,
  UserBreathingSession,
  UserStressActivity,
  MindfulnessProgress,
  MindfulnessRecommendation,
  MeditationType,
  DifficultyLevel,
  MeditationCategory
} from '@/types';

// Mock data for meditation sessions
const mockMeditationSessions: MeditationSession[] = [
  {
    id: '1',
    title: 'Mindful Breathing for Focus',
    description: 'A gentle guided meditation to improve concentration and mental clarity',
    type: 'breathing',
    category: 'focus',
    difficulty: 'beginner',
    duration: 10,
    audioUrl: '/audio/mindful-breathing-focus.mp3',
    scriptText: 'Find a comfortable position and close your eyes. Begin by taking three deep breaths...',
    instructorName: 'Sarah Chen',
    thumbnailUrl: '/images/meditation-breathing.jpg',
    tags: ['breathing', 'focus', 'beginner'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Body Scan for Stress Relief',
    description: 'Progressive body scan meditation to release tension and reduce stress',
    type: 'body-scan',
    category: 'stress-relief',
    difficulty: 'intermediate',
    duration: 20,
    audioUrl: '/audio/body-scan-stress.mp3',
    scriptText: 'Lie down comfortably and begin to notice your breath. Starting with your toes...',
    instructorName: 'Michael Rodriguez',
    thumbnailUrl: '/images/meditation-body-scan.jpg',
    tags: ['body-scan', 'stress-relief', 'relaxation'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Loving-Kindness for Confidence',
    description: 'Cultivate self-compassion and confidence through loving-kindness meditation',
    type: 'loving-kindness',
    category: 'confidence',
    difficulty: 'intermediate',
    duration: 15,
    audioUrl: '/audio/loving-kindness-confidence.mp3',
    scriptText: 'Begin by bringing to mind someone you love unconditionally...',
    instructorName: 'Dr. Emma Thompson',
    thumbnailUrl: '/images/meditation-loving-kindness.jpg',
    tags: ['loving-kindness', 'confidence', 'self-compassion'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Sleep Preparation Meditation',
    description: 'Gentle meditation to prepare your mind and body for restful sleep',
    type: 'guided',
    category: 'sleep',
    difficulty: 'beginner',
    duration: 25,
    audioUrl: '/audio/sleep-preparation.mp3',
    scriptText: 'As you settle into bed, allow your body to sink into the mattress...',
    instructorName: 'Lisa Park',
    thumbnailUrl: '/images/meditation-sleep.jpg',
    tags: ['sleep', 'relaxation', 'bedtime'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Creative Visualization',
    description: 'Enhance creativity and imagination through guided visualization',
    type: 'visualization',
    category: 'creativity',
    difficulty: 'advanced',
    duration: 18,
    audioUrl: '/audio/creative-visualization.mp3',
    scriptText: 'Imagine yourself in a beautiful, peaceful garden...',
    instructorName: 'David Kim',
    thumbnailUrl: '/images/meditation-visualization.jpg',
    tags: ['visualization', 'creativity', 'imagination'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock data for breathing exercises
const mockBreathingExercises: BreathingExercise[] = [
  {
    id: '1',
    name: 'Box Breathing',
    description: 'Equal count breathing technique used by Navy SEALs for stress management',
    technique: 'box-breathing',
    inhaleCount: 4,
    holdCount: 4,
    exhaleCount: 4,
    pauseCount: 4,
    cycles: 8,
    totalDuration: 5,
    instructions: [
      'Sit comfortably with your back straight',
      'Inhale for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale for 4 counts',
      'Hold empty for 4 counts',
      'Repeat for 8 cycles'
    ],
    benefits: ['Reduces stress', 'Improves focus', 'Calms nervous system'],
    difficulty: 'beginner',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '4-7-8 Breathing',
    description: 'Dr. Andrew Weil\'s relaxation technique for better sleep and anxiety relief',
    technique: '4-7-8',
    inhaleCount: 4,
    holdCount: 7,
    exhaleCount: 8,
    cycles: 4,
    totalDuration: 3,
    instructions: [
      'Place tongue tip against ridge behind upper teeth',
      'Exhale completely through mouth',
      'Inhale through nose for 4 counts',
      'Hold breath for 7 counts',
      'Exhale through mouth for 8 counts',
      'Repeat for 4 cycles'
    ],
    benefits: ['Promotes sleep', 'Reduces anxiety', 'Activates relaxation response'],
    difficulty: 'intermediate',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Triangle Breathing',
    description: 'Simple three-part breathing pattern for quick stress relief',
    technique: 'triangle',
    inhaleCount: 3,
    holdCount: 3,
    exhaleCount: 3,
    cycles: 10,
    totalDuration: 4,
    instructions: [
      'Sit or stand comfortably',
      'Inhale for 3 counts',
      'Hold for 3 counts',
      'Exhale for 3 counts',
      'Repeat without pause between cycles'
    ],
    benefits: ['Quick stress relief', 'Easy to remember', 'Can be done anywhere'],
    difficulty: 'beginner',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Coherent Breathing',
    description: 'Balanced breathing at 5 breaths per minute for optimal heart rate variability',
    technique: 'coherent',
    inhaleCount: 6,
    holdCount: 0,
    exhaleCount: 6,
    cycles: 25,
    totalDuration: 10,
    instructions: [
      'Breathe in for 6 seconds',
      'Breathe out for 6 seconds',
      'No pause between breaths',
      'Maintain smooth, even rhythm',
      'Continue for 10 minutes'
    ],
    benefits: ['Improves heart rate variability', 'Balances nervous system', 'Enhances focus'],
    difficulty: 'intermediate',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Mock data for stress reduction activities
const mockStressActivities: StressReductionActivity[] = [
  {
    id: '1',
    name: '5-4-3-2-1 Grounding Technique',
    description: 'Use your senses to ground yourself in the present moment',
    type: 'grounding',
    duration: 5,
    instructions: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste'
    ],
    benefits: ['Reduces anxiety', 'Grounds you in present', 'Interrupts panic'],
    difficulty: 'beginner',
    category: 'anxiety',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and relax muscle groups to release physical tension',
    type: 'progressive-relaxation',
    duration: 15,
    instructions: [
      'Start with your toes, tense for 5 seconds',
      'Release and notice the relaxation',
      'Move up to your calves, repeat',
      'Continue through each muscle group',
      'End with your face and scalp'
    ],
    benefits: ['Releases muscle tension', 'Promotes deep relaxation', 'Improves body awareness'],
    difficulty: 'beginner',
    category: 'stress-relief',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Quick Stress Reset',
    description: 'Rapid technique to reset your stress response in under 2 minutes',
    type: 'quick-relief',
    duration: 2,
    instructions: [
      'Take 3 deep breaths',
      'Drop your shoulders',
      'Unclench your jaw',
      'Soften your gaze',
      'Say "I am calm and in control"'
    ],
    benefits: ['Immediate stress relief', 'Can be done anywhere', 'Resets nervous system'],
    difficulty: 'beginner',
    category: 'stress-relief',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Mindful Walking',
    description: 'Transform a simple walk into a moving meditation',
    type: 'physical',
    duration: 10,
    instructions: [
      'Walk at a slower than normal pace',
      'Focus on the sensation of your feet touching the ground',
      'Notice your surroundings without judgment',
      'Coordinate your breathing with your steps',
      'Return attention to walking when mind wanders'
    ],
    benefits: ['Combines movement with mindfulness', 'Reduces rumination', 'Boosts mood'],
    difficulty: 'beginner',
    category: 'stress-relief',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Mock user data storage
let mockUserMeditationSessions: UserMeditationSession[] = [];
let mockUserBreathingSessions: UserBreathingSession[] = [];
let mockUserStressActivities: UserStressActivity[] = [];
let mockMindfulnessProgress: MindfulnessProgress[] = [];
let mockRecommendations: MindfulnessRecommendation[] = [];

// Helper function to get or create user progress
function getUserProgress(userId: string): MindfulnessProgress {
  let progress = mockMindfulnessProgress.find(p => p.userId === userId);
  
  if (!progress) {
    progress = {
      userId,
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      favoriteTypes: [],
      averageSessionDuration: 0,
      moodImprovementAverage: 0,
      stressReductionAverage: 0,
      focusImprovementAverage: 0,
      weeklyGoal: 60, // 60 minutes per week
      weeklyProgress: 0,
      monthlyStats: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockMindfulnessProgress.push(progress);
  }
  
  return progress;
}

// Helper function to update user progress
function updateUserProgress(userId: string, sessionDuration: number, sessionType: string, moodImprovement?: number, stressReduction?: number, focusImprovement?: number) {
  const progressIndex = mockMindfulnessProgress.findIndex(p => p.userId === userId);
  if (progressIndex >= 0) {
    const progress = mockMindfulnessProgress[progressIndex];
    
    mockMindfulnessProgress[progressIndex] = {
      ...progress,
      totalSessions: progress.totalSessions + 1,
      totalMinutes: progress.totalMinutes + sessionDuration,
      averageSessionDuration: (progress.totalMinutes + sessionDuration) / (progress.totalSessions + 1),
      moodImprovementAverage: moodImprovement ? 
        (progress.moodImprovementAverage * progress.totalSessions + moodImprovement) / (progress.totalSessions + 1) :
        progress.moodImprovementAverage,
      stressReductionAverage: stressReduction ?
        (progress.stressReductionAverage * progress.totalSessions + stressReduction) / (progress.totalSessions + 1) :
        progress.stressReductionAverage,
      focusImprovementAverage: focusImprovement ?
        (progress.focusImprovementAverage * progress.totalSessions + focusImprovement) / (progress.totalSessions + 1) :
        progress.focusImprovementAverage,
      weeklyProgress: progress.weeklyProgress + sessionDuration,
      lastSessionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user1';
  const action = searchParams.get('action');
  const category = searchParams.get('category') as MeditationCategory;
  const difficulty = searchParams.get('difficulty') as DifficultyLevel;
  const type = searchParams.get('type') as MeditationType;
  
  try {
    switch (action) {
      case 'meditation-sessions':
        let filteredSessions = mockMeditationSessions.filter(s => s.isActive);
        
        if (category) {
          filteredSessions = filteredSessions.filter(s => s.category === category);
        }
        if (difficulty) {
          filteredSessions = filteredSessions.filter(s => s.difficulty === difficulty);
        }
        if (type) {
          filteredSessions = filteredSessions.filter(s => s.type === type);
        }
        
        return NextResponse.json({ sessions: filteredSessions });
        
      case 'breathing-exercises':
        let filteredExercises = mockBreathingExercises.filter(e => e.isActive);
        
        if (difficulty) {
          filteredExercises = filteredExercises.filter(e => e.difficulty === difficulty);
        }
        
        return NextResponse.json({ exercises: filteredExercises });
        
      case 'stress-activities':
        let filteredActivities = mockStressActivities.filter(a => a.isActive);
        
        if (category) {
          filteredActivities = filteredActivities.filter(a => a.category === category);
        }
        if (difficulty) {
          filteredActivities = filteredActivities.filter(a => a.difficulty === difficulty);
        }
        
        return NextResponse.json({ activities: filteredActivities });
        
      case 'user-sessions':
        const userSessions = mockUserMeditationSessions.filter(s => s.userId === userId);
        return NextResponse.json({ sessions: userSessions });
        
      case 'user-breathing':
        const userBreathing = mockUserBreathingSessions.filter(s => s.userId === userId);
        return NextResponse.json({ sessions: userBreathing });
        
      case 'user-activities':
        const userActivities = mockUserStressActivities.filter(s => s.userId === userId);
        return NextResponse.json({ activities: userActivities });
        
      case 'progress':
        const progress = getUserProgress(userId);
        return NextResponse.json({ progress });
        
      case 'recommendations':
        const userRecommendations = mockRecommendations.filter(r => r.userId === userId);
        return NextResponse.json({ recommendations: userRecommendations });
        
      default:
        return NextResponse.json({ 
          sessions: mockMeditationSessions.filter(s => s.isActive),
          exercises: mockBreathingExercises.filter(e => e.isActive),
          activities: mockStressActivities.filter(a => a.isActive)
        });
    }
  } catch (error) {
    console.error('Error in mindfulness API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = 'user1' } = body;
    
    switch (action) {
      case 'start-meditation':
        const { sessionId } = body;
        
        const newMeditationSession: UserMeditationSession = {
          id: nanoid(),
          userId,
          sessionId,
          startTime: new Date().toISOString(),
          completedDuration: 0,
          wasCompleted: false,
          createdAt: new Date().toISOString(),
        };
        
        mockUserMeditationSessions.push(newMeditationSession);
        
        return NextResponse.json({ session: newMeditationSession });
        
      case 'complete-meditation':
        const { 
          userSessionId, 
          completedDuration, 
          wasCompleted, 
          moodBefore, 
          moodAfter, 
          stressBefore, 
          stressAfter,
          focusBefore,
          focusAfter,
          notes, 
          rating 
        } = body;
        
        const sessionIndex = mockUserMeditationSessions.findIndex(s => s.id === userSessionId && s.userId === userId);
        
        if (sessionIndex >= 0) {
          const session = mockUserMeditationSessions[sessionIndex];
          
          mockUserMeditationSessions[sessionIndex] = {
            ...session,
            endTime: new Date().toISOString(),
            completedDuration,
            wasCompleted,
            moodBefore,
            moodAfter,
            stressBefore,
            stressAfter,
            focusBefore,
            focusAfter,
            notes,
            rating,
          };
          
          // Update user progress
          const moodImprovement = moodBefore && moodAfter ? moodAfter - moodBefore : undefined;
          const stressReduction = stressBefore && stressAfter ? stressBefore - stressAfter : undefined;
          const focusImprovement = focusBefore && focusAfter ? focusAfter - focusBefore : undefined;
          
          updateUserProgress(userId, completedDuration, 'meditation', moodImprovement, stressReduction, focusImprovement);
          
          return NextResponse.json({ session: mockUserMeditationSessions[sessionIndex] });
        } else {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
      case 'start-breathing':
        const { exerciseId } = body;
        
        const newBreathingSession: UserBreathingSession = {
          id: nanoid(),
          userId,
          exerciseId,
          startTime: new Date().toISOString(),
          completedCycles: 0,
          targetCycles: mockBreathingExercises.find(e => e.id === exerciseId)?.cycles || 0,
          wasCompleted: false,
          createdAt: new Date().toISOString(),
        };
        
        mockUserBreathingSessions.push(newBreathingSession);
        
        return NextResponse.json({ session: newBreathingSession });
        
      case 'complete-breathing':
        const { 
          userBreathingId, 
          completedCycles, 
          wasCompleted: breathingCompleted,
          moodBefore: breathingMoodBefore,
          moodAfter: breathingMoodAfter,
          stressBefore: breathingStressBefore,
          stressAfter: breathingStressAfter,
          notes: breathingNotes,
          rating: breathingRating
        } = body;
        
        const breathingIndex = mockUserBreathingSessions.findIndex(s => s.id === userBreathingId && s.userId === userId);
        
        if (breathingIndex >= 0) {
          const session = mockUserBreathingSessions[breathingIndex];
          
          mockUserBreathingSessions[breathingIndex] = {
            ...session,
            endTime: new Date().toISOString(),
            completedCycles,
            wasCompleted: breathingCompleted,
            moodBefore: breathingMoodBefore,
            moodAfter: breathingMoodAfter,
            stressBefore: breathingStressBefore,
            stressAfter: breathingStressAfter,
            notes: breathingNotes,
            rating: breathingRating,
          };
          
          // Calculate duration based on exercise
          const exercise = mockBreathingExercises.find(e => e.id === session.exerciseId);
          const duration = exercise ? exercise.totalDuration : 5;
          
          // Update user progress
          const moodImprovement = breathingMoodBefore && breathingMoodAfter ? breathingMoodAfter - breathingMoodBefore : undefined;
          const stressReduction = breathingStressBefore && breathingStressAfter ? breathingStressBefore - breathingStressAfter : undefined;
          
          updateUserProgress(userId, duration, 'breathing', moodImprovement, stressReduction);
          
          return NextResponse.json({ session: mockUserBreathingSessions[breathingIndex] });
        } else {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
      case 'start-activity':
        const { activityId } = body;
        
        const newStressActivity: UserStressActivity = {
          id: nanoid(),
          userId,
          activityId,
          startTime: new Date().toISOString(),
          completedDuration: 0,
          wasCompleted: false,
          createdAt: new Date().toISOString(),
        };
        
        mockUserStressActivities.push(newStressActivity);
        
        return NextResponse.json({ activity: newStressActivity });
        
      case 'complete-activity':
        const { 
          userActivityId, 
          completedDuration: activityDuration, 
          wasCompleted: activityCompleted,
          stressBefore: activityStressBefore,
          stressAfter: activityStressAfter,
          effectiveness,
          notes: activityNotes
        } = body;
        
        const activityIndex = mockUserStressActivities.findIndex(s => s.id === userActivityId && s.userId === userId);
        
        if (activityIndex >= 0) {
          const activity = mockUserStressActivities[activityIndex];
          
          mockUserStressActivities[activityIndex] = {
            ...activity,
            endTime: new Date().toISOString(),
            completedDuration: activityDuration,
            wasCompleted: activityCompleted,
            stressBefore: activityStressBefore,
            stressAfter: activityStressAfter,
            effectiveness,
            notes: activityNotes,
          };
          
          // Update user progress
          const stressReduction = activityStressBefore && activityStressAfter ? activityStressBefore - activityStressAfter : undefined;
          
          updateUserProgress(userId, activityDuration, 'activity', undefined, stressReduction);
          
          return NextResponse.json({ activity: mockUserStressActivities[activityIndex] });
        } else {
          return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        }
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in mindfulness POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}