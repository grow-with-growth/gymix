import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import type { MoodFocusCheckIn, CheckInSummary, CheckInTrends } from '../types';

interface UseMoodFocusCheckInOptions {
  userId: string;
  autoLoad?: boolean;
}

interface UseMoodFocusCheckInReturn {
  // State
  checkIns: MoodFocusCheckIn[];
  todaysCheckIn: MoodFocusCheckIn | null;
  summary: CheckInSummary | null;
  trends: CheckInTrends | null;
  insights: any[];
  hasCheckedInToday: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  createCheckIn: (checkInData: Omit<MoodFocusCheckIn, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<MoodFocusCheckIn>;
  updateCheckIn: (checkInId: string, updates: Partial<MoodFocusCheckIn>) => Promise<MoodFocusCheckIn>;
  deleteCheckIn: (checkInId: string) => Promise<void>;
  loadCheckIns: (limit?: number) => Promise<void>;
  loadTodaysCheckIn: () => Promise<void>;
  loadSummary: () => Promise<void>;
  loadTrends: (startDate: string, endDate: string) => Promise<void>;
  loadInsights: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMoodFocusCheckIn({ 
  userId, 
  autoLoad = true 
}: UseMoodFocusCheckInOptions): UseMoodFocusCheckInReturn {
  const [checkIns, setCheckIns] = useState<MoodFocusCheckIn[]>([]);
  const [todaysCheckIn, setTodaysCheckIn] = useState<MoodFocusCheckIn | null>(null);
  const [summary, setSummary] = useState<CheckInSummary | null>(null);
  const [trends, setTrends] = useState<CheckInTrends | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }, []);

  const loadCheckIns = useCallback(async (limit?: number) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({ userId });
      if (limit) params.append('limit', limit.toString());
      
      const response = await fetch(`${API_ENDPOINTS.moodFocus}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load check-ins');
      }
      
      const data = await response.json();
      setCheckIns(data);
    } catch (error) {
      handleError(error, 'loadCheckIns');
    } finally {
      setIsLoading(false);
    }
  }, [userId, handleError]);

  const loadTodaysCheckIn = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.moodFocus}?userId=${userId}&type=today`);
      if (!response.ok) {
        throw new Error('Failed to load today\'s check-in');
      }
      
      const data = await response.json();
      setTodaysCheckIn(data);
      setHasCheckedInToday(!!data);
    } catch (error) {
      handleError(error, 'loadTodaysCheckIn');
    }
  }, [userId, handleError]);

  const loadSummary = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.moodFocus}?userId=${userId}&type=summary`);
      if (!response.ok) {
        throw new Error('Failed to load summary');
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      handleError(error, 'loadSummary');
    }
  }, [userId, handleError]);

  const loadTrends = useCallback(async (startDate: string, endDate: string) => {
    if (!userId) return;
    
    try {
      const response = await fetch(
        `${API_ENDPOINTS.moodFocus}?userId=${userId}&type=trends&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('Failed to load trends');
      }
      
      const data = await response.json();
      setTrends(data);
    } catch (error) {
      handleError(error, 'loadTrends');
    }
  }, [userId, handleError]);

  const loadInsights = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.moodFocus}?userId=${userId}&type=insights`);
      if (!response.ok) {
        throw new Error('Failed to load insights');
      }
      
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      handleError(error, 'loadInsights');
    }
  }, [userId, handleError]);

  const createCheckIn = useCallback(async (
    checkInData: Omit<MoodFocusCheckIn, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<MoodFocusCheckIn> => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.moodFocus, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...checkInData })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create check-in');
      }
      
      const newCheckIn = await response.json();
      
      // Update local state
      setCheckIns(prev => [newCheckIn, ...prev.filter(c => c.date !== newCheckIn.date)]);
      if (newCheckIn.date === new Date().toISOString().split('T')[0]) {
        setTodaysCheckIn(newCheckIn);
        setHasCheckedInToday(true);
      }
      
      return newCheckIn;
    } catch (error) {
      handleError(error, 'createCheckIn');
      throw error;
    }
  }, [userId, handleError]);

  const updateCheckIn = useCallback(async (
    checkInId: string, 
    updates: Partial<MoodFocusCheckIn>
  ): Promise<MoodFocusCheckIn> => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.moodFocus, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, id: checkInId, ...updates })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update check-in');
      }
      
      const updatedCheckIn = await response.json();
      
      // Update local state
      setCheckIns(prev => prev.map(c => c.id === checkInId ? updatedCheckIn : c));
      if (updatedCheckIn.date === new Date().toISOString().split('T')[0]) {
        setTodaysCheckIn(updatedCheckIn);
      }
      
      return updatedCheckIn;
    } catch (error) {
      handleError(error, 'updateCheckIn');
      throw error;
    }
  }, [userId, handleError]);

  const deleteCheckIn = useCallback(async (checkInId: string): Promise<void> => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setError(null);
      
      const response = await fetch(`${API_ENDPOINTS.moodFocus}?userId=${userId}&id=${checkInId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete check-in');
      }
      
      // Update local state
      setCheckIns(prev => prev.filter(c => c.id !== checkInId));
      if (todaysCheckIn?.id === checkInId) {
        setTodaysCheckIn(null);
        setHasCheckedInToday(false);
      }
    } catch (error) {
      handleError(error, 'deleteCheckIn');
      throw error;
    }
  }, [userId, todaysCheckIn, handleError]);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadCheckIns(10),
      loadTodaysCheckIn(),
      loadSummary(),
      loadInsights()
    ]);
  }, [loadCheckIns, loadTodaysCheckIn, loadSummary, loadInsights]);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad && userId) {
      refresh();
    }
  }, [autoLoad, userId, refresh]);

  return {
    // State
    checkIns,
    todaysCheckIn,
    summary,
    trends,
    insights,
    hasCheckedInToday,
    isLoading,
    error,

    // Actions
    createCheckIn,
    updateCheckIn,
    deleteCheckIn,
    loadCheckIns,
    loadTodaysCheckIn,
    loadSummary,
    loadTrends,
    loadInsights,
    refresh
  };
}