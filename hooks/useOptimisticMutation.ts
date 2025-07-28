import { useCallback, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { useApplicationStore } from '../stores/applicationStore';

// Types for optimistic updates
export interface OptimisticUpdate<TData = any> {
  id: string;
  type: string;
  data: TData;
  originalData?: TData;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed' | 'rolled_back';
  retryCount: number;
  maxRetries: number;
}

export interface OptimisticMutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onOptimisticUpdate?: (variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, rollbackData?: TData) => void;
  onRollback?: (rollbackData: TData, variables: TVariables) => void;
  maxRetries?: number;
  retryDelay?: number;
  enableRollback?: boolean;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'prompt-user';
}

export interface OptimisticMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  pendingUpdates: OptimisticUpdate<TData>[];
  rollback: (updateId: string) => void;
  rollbackAll: () => void;
  retry: (updateId: string) => Promise<void>;
}

// Custom hook for optimistic mutations
export function useOptimisticMutation<TData = any, TVariables = any>(
  config: OptimisticMutationConfig<TData, TVariables>
): OptimisticMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<TData>[]>([]);
  const { addNotification, setLoading } = useApplicationStore();
  
  // Use ref to store the latest config to avoid stale closures
  const configRef = useRef(config);
  configRef.current = config;
  
  // Track pending updates
  const addPendingUpdate = useCallback((update: OptimisticUpdate<TData>) => {
    setPendingUpdates(prev => [...prev, update]);
  }, []);
  
  const updatePendingUpdate = useCallback((id: string, updates: Partial<OptimisticUpdate<TData>>) => {
    setPendingUpdates(prev => 
      prev.map(update => 
        update.id === id ? { ...update, ...updates } : update
      )
    );
  }, []);
  
  const removePendingUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => prev.filter(update => update.id !== id));
  }, []);
  
  // Rollback functionality
  const rollback = useCallback((updateId: string) => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update || !configRef.current.enableRollback) return;
    
    try {
      if (update.originalData && configRef.current.onRollback) {
        configRef.current.onRollback(update.originalData, update.data);
      }
      
      updatePendingUpdate(updateId, { status: 'rolled_back' });
      
      addNotification({
        type: 'info',
        title: 'Update Rolled Back',
        message: 'The optimistic update has been rolled back to its previous state.',
      });
      
      // Remove after a delay to allow UI to show rollback state
      setTimeout(() => removePendingUpdate(updateId), 1000);
    } catch (error) {
      console.error('Failed to rollback update:', error);
      addNotification({
        type: 'error',
        title: 'Rollback Failed',
        message: 'Failed to rollback the update. Please refresh the page.',
      });
    }
  }, [pendingUpdates, updatePendingUpdate, removePendingUpdate, addNotification]);
  
  // Rollback all pending updates
  const rollbackAll = useCallback(() => {
    const rollbackableUpdates = pendingUpdates.filter(
      update => update.status === 'pending' || update.status === 'failed'
    );
    
    rollbackableUpdates.forEach(update => rollback(update.id));
  }, [pendingUpdates, rollback]);
  
  // Retry failed update
  const retry = useCallback(async (updateId: string) => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update || update.status !== 'failed') return;
    
    if (update.retryCount >= update.maxRetries) {
      addNotification({
        type: 'error',
        title: 'Max Retries Reached',
        message: 'The update has failed too many times and cannot be retried.',
      });
      return;
    }
    
    try {
      updatePendingUpdate(updateId, { 
        status: 'pending', 
        retryCount: update.retryCount + 1 
      });
      
      const result = await configRef.current.mutationFn(update.data);
      
      updatePendingUpdate(updateId, { status: 'confirmed' });
      
      if (configRef.current.onSuccess) {
        configRef.current.onSuccess(result, update.data);
      }
      
      addNotification({
        type: 'success',
        title: 'Update Successful',
        message: 'The retry was successful.',
      });
      
      // Remove confirmed update after delay
      setTimeout(() => removePendingUpdate(updateId), 2000);
    } catch (error) {
      updatePendingUpdate(updateId, { status: 'failed' });
      
      addNotification({
        type: 'error',
        title: 'Retry Failed',
        message: `Retry attempt ${update.retryCount + 1} failed. ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [pendingUpdates, updatePendingUpdate, removePendingUpdate, addNotification]);
  
  // Main mutation function
  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    const updateId = nanoid();
    const timestamp = Date.now();
    const maxRetries = configRef.current.maxRetries ?? 3;
    
    setIsLoading(true);
    setLoading('optimistic-mutation', true);
    
    let optimisticData: TData | undefined;
    let originalData: TData | undefined;
    
    try {
      // Apply optimistic update if provided
      if (configRef.current.onOptimisticUpdate) {
        optimisticData = configRef.current.onOptimisticUpdate(variables);
        
        // Store the optimistic update
        const update: OptimisticUpdate<TData> = {
          id: updateId,
          type: 'mutation',
          data: optimisticData,
          originalData,
          timestamp,
          status: 'pending',
          retryCount: 0,
          maxRetries,
        };
        
        addPendingUpdate(update);
        
        // Show optimistic feedback
        addNotification({
          type: 'info',
          title: 'Update in Progress',
          message: 'Your changes are being saved...',
        });
      }
      
      // Perform the actual mutation
      const result = await configRef.current.mutationFn(variables);
      
      // Update status to confirmed
      if (optimisticData) {
        updatePendingUpdate(updateId, { status: 'confirmed' });
      }
      
      // Call success callback
      if (configRef.current.onSuccess) {
        configRef.current.onSuccess(result, variables);
      }
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Update Successful',
        message: 'Your changes have been saved successfully.',
      });
      
      // Remove confirmed update after delay
      if (optimisticData) {
        setTimeout(() => removePendingUpdate(updateId), 2000);
      }
      
      return result;
    } catch (error) {
      // Handle mutation failure
      if (optimisticData) {
        updatePendingUpdate(updateId, { status: 'failed' });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Call error callback
      if (configRef.current.onError) {
        configRef.current.onError(error as Error, variables, originalData);
      }
      
      // Show error notification with retry option
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: `${errorMessage}. You can retry or rollback the changes.`,
      });
      
      // Handle conflict resolution
      if (configRef.current.conflictResolution === 'prompt-user') {
        // This would typically open a modal for user decision
        console.log('Conflict detected, user intervention required');
      } else if (configRef.current.conflictResolution === 'client-wins' && optimisticData) {
        // Keep optimistic update
        console.log('Conflict resolved: client wins');
      } else if (configRef.current.conflictResolution === 'server-wins') {
        // Rollback optimistic update
        if (optimisticData && configRef.current.enableRollback) {
          rollback(updateId);
        }
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      setLoading('optimistic-mutation', false);
    }
  }, [addPendingUpdate, updatePendingUpdate, removePendingUpdate, addNotification, setLoading, rollback]);
  
  // Async version of mutate
  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    return mutate(variables);
  }, [mutate]);
  
  return {
    mutate,
    mutateAsync,
    isLoading,
    pendingUpdates,
    rollback,
    rollbackAll,
    retry,
  };
}

// Utility hook for tracking optimistic updates across the app
export function useOptimisticUpdates() {
  const [globalUpdates, setGlobalUpdates] = useState<OptimisticUpdate[]>([]);
  
  const addGlobalUpdate = useCallback((update: OptimisticUpdate) => {
    setGlobalUpdates(prev => [...prev, update]);
  }, []);
  
  const removeGlobalUpdate = useCallback((id: string) => {
    setGlobalUpdates(prev => prev.filter(update => update.id !== id));
  }, []);
  
  const getPendingUpdatesCount = useCallback(() => {
    return globalUpdates.filter(update => update.status === 'pending').length;
  }, [globalUpdates]);
  
  const getFailedUpdatesCount = useCallback(() => {
    return globalUpdates.filter(update => update.status === 'failed').length;
  }, [globalUpdates]);
  
  return {
    globalUpdates,
    addGlobalUpdate,
    removeGlobalUpdate,
    getPendingUpdatesCount,
    getFailedUpdatesCount,
  };
}