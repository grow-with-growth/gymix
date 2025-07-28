import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import type {
  Achievement,
  UserAchievement,
  ProgressVisualization,
  Milestone,
} from '../types';

interface UseGamificationOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseGamificationReturn {
  // State
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  progress: ProgressVisualization | null;
  milestones: Milestone[];
  loading: boolean;
  error: string | null;

  // Actions
  refreshAchievements: () => Promise<void>;
  refreshUserAchievements: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  refreshMilestones: () => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<UserAchievement>;
  checkMilestoneUnlocks: () => Promise<Milestone[]>;
  refreshAll: () => Promise<void>;
}

export function useGamification({
  userId,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute
}: UseGamificationOptions): UseGamificationReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [progress, setProgress] = useState<ProgressVisualization | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAchievements = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.gamification}/achievements`);
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      const data = await response.json();
      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
    }
  }, []);

  const refreshUserAchievements = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.gamification}/achievements?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user achievements');
      }
      const data = await response.json();
      setUserAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user achievements');
    }
  }, [userId]);

  const refreshProgress = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.gamification}/progress?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    }
  }, [userId]);

  const refreshMilestones = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.gamification}/milestones?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch milestones');
      }
      const data = await response.json();
      setMilestones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestones');
    }
  }, [userId]);

  const unlockAchievement = useCallback(async (achievementId: string): Promise<UserAchievement> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.gamification}/achievements/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          achievementId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlock achievement');
      }

      const userAchievement = await response.json();
      
      // Refresh user achievements and progress
      await Promise.all([refreshUserAchievements(), refreshProgress()]);
      
      return userAchievement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlock achievement';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshUserAchievements, refreshProgress]);

  const checkMilestoneUnlocks = useCallback(async (): Promise<Milestone[]> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.gamification}/milestones/check?userId=${userId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to check milestone unlocks');
      }

      const data = await response.json();
      
      // Refresh milestones and progress if any were unlocked
      if (data.count > 0) {
        await Promise.all([refreshMilestones(), refreshProgress()]);
      }
      
      return data.unlockedMilestones;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check milestone unlocks';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshMilestones, refreshProgress]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        refreshAchievements(),
        refreshUserAchievements(),
        refreshProgress(),
        refreshMilestones(),
      ]);
    } catch (err) {
      // Error is already set by individual refresh functions
    } finally {
      setLoading(false);
    }
  }, [refreshAchievements, refreshUserAchievements, refreshProgress, refreshMilestones]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAll();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshAll]);

  return {
    // State
    achievements,
    userAchievements,
    progress,
    milestones,
    loading,
    error,

    // Actions
    refreshAchievements,
    refreshUserAchievements,
    refreshProgress,
    refreshMilestones,
    unlockAchievement,
    checkMilestoneUnlocks,
    refreshAll,
  };
}