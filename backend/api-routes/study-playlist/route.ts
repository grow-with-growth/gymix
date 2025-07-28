import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { 
  StudyPlaylist, 
  AudioTrack, 
  PlaylistPreferences, 
  StudySessionType, 
  PlaylistMood, 
  MusicGenre,
  PlaylistRecommendation,
  MusicPreferenceProfile
} from '@/types';

// Mock data for audio tracks
const mockAudioTracks: AudioTrack[] = [
  {
    id: '1',
    title: 'Forest Rain',
    artist: 'Nature Sounds',
    duration: 1800, // 30 minutes
    genre: 'nature',
    mood: ['calming', 'focused'],
    focusLevel: 8,
    energyLevel: 3,
    url: '/audio/forest-rain.mp3',
    thumbnailUrl: '/images/forest-rain.jpg',
    tags: ['rain', 'forest', 'ambient'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Deep Focus Piano',
    artist: 'Study Music',
    duration: 2400, // 40 minutes
    genre: 'classical',
    mood: ['focused', 'calming'],
    focusLevel: 9,
    energyLevel: 4,
    url: '/audio/deep-focus-piano.mp3',
    thumbnailUrl: '/images/piano.jpg',
    tags: ['piano', 'classical', 'instrumental'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Lo-Fi Study Beats',
    artist: 'Chill Hop',
    duration: 3600, // 60 minutes
    genre: 'lo-fi',
    mood: ['focused', 'creative'],
    focusLevel: 7,
    energyLevel: 5,
    url: '/audio/lofi-study-beats.mp3',
    thumbnailUrl: '/images/lofi.jpg',
    tags: ['lo-fi', 'beats', 'hip-hop'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Binaural Focus 40Hz',
    artist: 'Brainwave Entrainment',
    duration: 1800, // 30 minutes
    genre: 'binaural',
    mood: ['focused'],
    focusLevel: 10,
    energyLevel: 6,
    url: '/audio/binaural-40hz.mp3',
    thumbnailUrl: '/images/binaural.jpg',
    tags: ['binaural', 'gamma', 'focus'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Ambient Space',
    artist: 'Cosmic Sounds',
    duration: 2700, // 45 minutes
    genre: 'ambient',
    mood: ['calming', 'creative'],
    focusLevel: 6,
    energyLevel: 3,
    url: '/audio/ambient-space.mp3',
    thumbnailUrl: '/images/space.jpg',
    tags: ['ambient', 'space', 'ethereal'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Energizing Jazz',
    artist: 'Study Jazz Ensemble',
    duration: 2100, // 35 minutes
    genre: 'jazz',
    mood: ['energizing', 'creative'],
    focusLevel: 6,
    energyLevel: 8,
    url: '/audio/energizing-jazz.mp3',
    thumbnailUrl: '/images/jazz.jpg',
    tags: ['jazz', 'upbeat', 'instrumental'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Mock user playlists storage
let mockPlaylists: StudyPlaylist[] = [];

// Mock user preference profiles
let mockPreferenceProfiles: MusicPreferenceProfile[] = [];

// Helper function to generate personalized playlist
function generatePersonalizedPlaylist(
  userId: string,
  sessionType: StudySessionType,
  targetMood: PlaylistMood,
  duration: number,
  preferences: PlaylistPreferences
): StudyPlaylist {
  // Filter tracks based on preferences
  let filteredTracks = mockAudioTracks.filter(track => {
    // Check genre preferences
    if (preferences.preferredGenres.length > 0 && !preferences.preferredGenres.includes(track.genre)) {
      return false;
    }
    
    // Check avoided genres
    if (preferences.avoidedGenres.includes(track.genre)) {
      return false;
    }
    
    // Check mood compatibility
    if (!track.mood.includes(targetMood)) {
      return false;
    }
    
    // Check focus level range
    if (track.focusLevel < preferences.focusLevelRange.min || track.focusLevel > preferences.focusLevelRange.max) {
      return false;
    }
    
    // Check energy level range
    if (track.energyLevel < preferences.energyLevelRange.min || track.energyLevel > preferences.energyLevelRange.max) {
      return false;
    }
    
    // Check track duration
    if (track.duration > preferences.maxTrackDuration) {
      return false;
    }
    
    return track.isActive;
  });
  
  // Sort tracks by relevance (focus level + mood match)
  filteredTracks.sort((a, b) => {
    const aScore = a.focusLevel + (a.mood.includes(targetMood) ? 2 : 0);
    const bScore = b.focusLevel + (b.mood.includes(targetMood) ? 2 : 0);
    return bScore - aScore;
  });
  
  // Select tracks to fill the duration
  const selectedTracks: AudioTrack[] = [];
  let totalDuration = 0;
  const targetDurationSeconds = duration * 60;
  
  while (totalDuration < targetDurationSeconds && filteredTracks.length > 0) {
    for (const track of filteredTracks) {
      if (totalDuration + track.duration <= targetDurationSeconds + 300) { // 5 min buffer
        selectedTracks.push(track);
        totalDuration += track.duration;
        
        if (!preferences.allowRepeats) {
          filteredTracks.splice(filteredTracks.indexOf(track), 1);
        }
        
        if (totalDuration >= targetDurationSeconds) break;
      }
    }
    
    // Prevent infinite loop
    if (selectedTracks.length === 0 || (!preferences.allowRepeats && filteredTracks.length === 0)) {
      break;
    }
  }
  
  // If we don't have enough tracks, add some fallbacks
  if (selectedTracks.length === 0) {
    selectedTracks.push(mockAudioTracks[0]); // Add at least one track
  }
  
  return {
    id: nanoid(),
    userId,
    name: `${sessionType.replace('-', ' ')} - ${targetMood} (${duration}min)`,
    description: `Personalized playlist for ${sessionType} sessions with ${targetMood} mood`,
    sessionType,
    targetMood,
    duration,
    tracks: selectedTracks,
    isPersonalized: true,
    preferences,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };
}

// Helper function to get or create user preference profile
function getUserPreferenceProfile(userId: string): MusicPreferenceProfile {
  let profile = mockPreferenceProfiles.find(p => p.userId === userId);
  
  if (!profile) {
    profile = {
      userId,
      preferredGenres: [
        { genre: 'lo-fi', weight: 0.8 },
        { genre: 'classical', weight: 0.7 },
        { genre: 'ambient', weight: 0.6 },
      ],
      preferredMoods: [
        { mood: 'focused', weight: 0.9 },
        { mood: 'calming', weight: 0.7 },
        { mood: 'creative', weight: 0.6 },
      ],
      optimalFocusLevel: 7,
      optimalEnergyLevel: 5,
      sessionTypePreferences: [
        { type: 'deep-focus', frequency: 0.4 },
        { type: 'light-reading', frequency: 0.3 },
        { type: 'creative-work', frequency: 0.2 },
      ],
      timeOfDayPreferences: [
        { hour: 9, preferredMood: 'energizing' },
        { hour: 14, preferredMood: 'focused' },
        { hour: 20, preferredMood: 'calming' },
      ],
      averageSessionDuration: 45,
      lastUpdated: new Date().toISOString(),
    };
    
    mockPreferenceProfiles.push(profile);
  }
  
  return profile;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user1';
  const action = searchParams.get('action');
  
  try {
    switch (action) {
      case 'playlists':
        const userPlaylists = mockPlaylists.filter(p => p.userId === userId);
        return NextResponse.json({ playlists: userPlaylists });
        
      case 'tracks':
        return NextResponse.json({ tracks: mockAudioTracks });
        
      case 'profile':
        const profile = getUserPreferenceProfile(userId);
        return NextResponse.json({ profile });
        
      case 'recommendations':
        // Generate playlist recommendations based on user profile
        const userProfile = getUserPreferenceProfile(userId);
        const recommendations: PlaylistRecommendation[] = [];
        
        // Recommend based on most used session types
        userProfile.sessionTypePreferences.forEach(pref => {
          const topMood = userProfile.preferredMoods[0];
          const playlist = generatePersonalizedPlaylist(
            userId,
            pref.type,
            topMood.mood,
            userProfile.averageSessionDuration,
            {
              preferredGenres: userProfile.preferredGenres.map(g => g.genre),
              avoidedGenres: [],
              preferredMoods: userProfile.preferredMoods.map(m => m.mood),
              focusLevelRange: { min: userProfile.optimalFocusLevel - 2, max: userProfile.optimalFocusLevel + 2 },
              energyLevelRange: { min: userProfile.optimalEnergyLevel - 2, max: userProfile.optimalEnergyLevel + 2 },
              maxTrackDuration: 3600,
              allowVocals: false,
              allowRepeats: true,
              fadeInOut: true,
              volumeLevel: 70,
            }
          );
          
          recommendations.push({
            id: nanoid(),
            userId,
            recommendedPlaylistId: playlist.id,
            reason: `Based on your frequent ${pref.type} sessions and preference for ${topMood.mood} music`,
            confidence: pref.frequency * topMood.weight,
            basedOnSessions: [],
            createdAt: new Date().toISOString(),
          });
        });
        
        return NextResponse.json({ recommendations });
        
      default:
        return NextResponse.json({ playlists: mockPlaylists.filter(p => p.userId === userId) });
    }
  } catch (error) {
    console.error('Error in study playlist API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = 'user1' } = body;
    
    switch (action) {
      case 'generate':
        const { sessionType, targetMood, duration, preferences } = body;
        
        const playlist = generatePersonalizedPlaylist(
          userId,
          sessionType,
          targetMood,
          duration,
          preferences
        );
        
        mockPlaylists.push(playlist);
        
        return NextResponse.json({ playlist });
        
      case 'save':
        const { playlist: playlistToSave } = body;
        const existingIndex = mockPlaylists.findIndex(p => p.id === playlistToSave.id);
        
        if (existingIndex >= 0) {
          mockPlaylists[existingIndex] = { ...playlistToSave, updatedAt: new Date().toISOString() };
        } else {
          mockPlaylists.push({ ...playlistToSave, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        }
        
        return NextResponse.json({ success: true, playlist: playlistToSave });
        
      case 'update-preferences':
        const { preferences: newPreferences } = body;
        let profile = mockPreferenceProfiles.find(p => p.userId === userId);
        
        if (profile) {
          profile = { ...profile, ...newPreferences, lastUpdated: new Date().toISOString() };
          const index = mockPreferenceProfiles.findIndex(p => p.userId === userId);
          mockPreferenceProfiles[index] = profile;
        } else {
          profile = {
            userId,
            ...newPreferences,
            lastUpdated: new Date().toISOString(),
          };
          mockPreferenceProfiles.push(profile);
        }
        
        return NextResponse.json({ success: true, profile });
        
      case 'track-usage':
        const { playlistId } = body;
        const playlistIndex = mockPlaylists.findIndex(p => p.id === playlistId);
        
        if (playlistIndex >= 0) {
          mockPlaylists[playlistIndex].usageCount += 1;
          mockPlaylists[playlistIndex].lastUsed = new Date().toISOString();
        }
        
        return NextResponse.json({ success: true });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in study playlist POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');
    const userId = searchParams.get('userId') || 'user1';
    
    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }
    
    const playlistIndex = mockPlaylists.findIndex(p => p.id === playlistId && p.userId === userId);
    
    if (playlistIndex >= 0) {
      mockPlaylists.splice(playlistIndex, 1);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in study playlist DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}