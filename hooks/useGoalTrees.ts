import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '../types';

interface UseGoalTreesOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseGoalTreesReturn {
  // State
  goals: Goal[];
  goalHierarchy: Goal[];
  loading: boolean;
  error: string | null;

  // Actions
  refreshGoals: () => Promise<void>;
  refreshGoalHierarchy: () => Promise<void>;
  createGoal: (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Goal>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (goalId: string) => Promise<void>;
  completeGoal: (goalId: string) => Promise<Goal>;
  updateGoalProgress: (goalId: string, progress: number) => Promise<Goal>;
  completeMilestone: (goalId: string, milestoneId: string) => Promise<Goal>;
  getGoalDependencies: (goalId: string) => Promise<{ dependencies: Goal[]; blockedGoals: Goal[] }>;
  canCompleteGoal: (goalId: string) => Promise<{ canComplete: boolean; reasons: string[] }>;
  refreshAll: () => Promise<void>;
}

export function useGoalTrees({
  userId,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute
}: UseGoalTreesOptions): UseGoalTreesReturn {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalHierarchy, setGoalHierarchy] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGoals = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/goals?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    }
  }, [userId]);

  const refreshGoalHierarchy = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/goals?userId=${userId}&hierarchy=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch goal hierarchy');
      }
      const data = await response.json();
      setGoalHierarchy(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goal hierarchy');
    }
  }, [userId]);

  const createGoal = useCallback(async (
    goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Goal> => {
    try {
      const response = await fetch('/api/gamification/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...goalData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create goal');
      }

      const goal = await response.json();
      
      // Refresh goals and hierarchy
      await Promise.all([refreshGoals(), refreshGoalHierarchy()]);
      
      return goal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshGoals, refreshGoalHierarchy]);

  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>): Promise<Goal> => {
    try {
      const response = await fetch(`/api/gamification/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update goal');
      }

      const goal = await response.json();
      
      // Refresh goals and hierarchy
      await Promise.all([refreshGoals(), refreshGoalHierarchy()]);
      
      return goal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshGoals, refreshGoalHierarchy]);

  const deleteGoal = useCallback(async (goalId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/gamification/goals/${goalId}?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete goal');
      }
      
      // Refresh goals and hierarchy
      await Promise.all([refreshGoals(), refreshGoalHierarchy()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshGoals, refreshGoalHierarchy]);

  const completeGoal = useCallback(async (goalId: string): Promise<Goal> => {
    try {
      const response = await fetch(`/api/gamification/goals/${goalId}/complete?userId=${userId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete goal');
      }

      const goal = await response.json();
      
      // Refresh goals and hierarchy
      await Promise.all([refreshGoals(), refreshGoalHierarchy()]);
      
      return goal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshGoals, refreshGoalHierarchy]);

  const updateGoalProgress = useCallback(async (goalId: string, progress: number): Promise<Goal> => {
    try {
      const response = await fetch(`/api/gamification/goals/${goalId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          progress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update goal progress');
      }

      const goal = await response.json();
      
      // Refresh goals and hierarchy
      await Promise.all([refreshGoals(), refreshGoalHierarchy()]);
      
      return goal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal progress';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshGoals, refreshGoalHierarchy]);

  const completeMilestone = useCallback(async (goalId: string, milestoneId: string): Promise<Goal> => {
    try {
      const response = await fetch(
        `/api/gamification/goals/${goalId}/milestones/${milestoneId}/complete?userId=${userId}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete milestone');
      }

      const goal = await response.json();
      
      // Refresh goals and hierarchy
      await Promise.all([refreshGoals(), refreshGoalHierarchy()]);
      
      return goal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete milestone';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshGoals, refreshGoalHierarchy]);

  const getGoalDependencies = useCallback(async (goalId: string): Promise<{
    dependencies: Goal[];
    blockedGoals: Goal[];
  }> => {
    try {
      const response = await fetch(`/api/gamification/goals/${goalId}/dependencies?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch goal dependencies');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch goal dependencies';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  const canCompleteGoal = useCallback(async (goalId: string): Promise<{
    canComplete: boolean;
    reasons: string[];
  }> => {
    try {
      const response = await fetch(`/api/gamification/goals/${goalId}/can-complete?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check goal completion eligibility');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check goal completion eligibility';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([refreshGoals(), refreshGoalHierarchy()]);
    } catch (err) {
      // Error is already set by individual refresh functions
    } finally {
      setLoading(false);
    }
  }, [refreshGoals, refreshGoalHierarchy]);

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
    goals,
    goalHierarchy,
    loading,
    error,

    // Actions
    refreshGoals,
    refreshGoalHierarchy,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    updateGoalProgress,
    completeMilestone,
    getGoalDependencies,
    canCompleteGoal,
    refreshAll,
  };
}