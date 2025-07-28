import { useCallback, useRef, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useApplicationStore } from '../stores/applicationStore';

// Enhanced types for optimistic updates with better tracking
export interface OptimisticUpdateTracker<TData = any> {
  id: string;
  type: string;
  data: TData;
  originalData?: TData;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed' | 'rolled_back' | 'retrying';
  retryCount: number;
  maxRetries: number;
  error?: Error;
  conflictData?: TData;
  userFeedback?: {
    showProgress: boolean;
    showSuccess: boolean;
    showError: boolean;
    customMessages?: {
      progress?: string;
      success?: string;
      error?: string;
    };
  };
}

export interface ConflictResolutionStrategy<TData = any> {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'prompt-user' | 'custom';
  customResolver?: (clientData: TData, serverData: TData) => TData;
  onConflictDetected?: (clientData: TData, serverData: TData) => void;
}

export interface OptimisticMutationUtilitiesConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onOptimisticUpdate?: (variables: TVariables, originalData?: TData) => TData;
  onSuccess?: (data: TData, variables: TVariables, optimisticData?: TData) => void;
  onError?: (error: Error, variables: TVariables, optimisticData?: TData) => void;
  onRollback?: (rollbackData: TData, variables: TVariables) => void;
  onConflictResolved?: (resolvedData: TData, conflictData: { client: TData; server: TData }) => void;
  
  // Enhanced configuration
  maxRetries?: number;
  retryDelay?: number;
  enableRollback?: boolean;
  enableAutoRetry?: boolean;
  conflictResolution?: ConflictResolutionStrategy<TData>;
  
  // UI feedback configuration
  userFeedback?: {
    showProgress?: boolean;
    showSuccess?: boolean;
    showError?: boolean;
    showRollback?: boolean;
    customMessages?: {
      progress?: string;
      success?: string;
      error?: string;
      rollback?: string;
    };
  };
  
  // Advanced features
  enableOptimisticBatching?: boolean;
  batchDelay?: number;
  enableConflictDetection?: boolean;
  enableStateSnapshot?: boolean;
}

// Enhanced optimistic mutation utilities hook
export function useOptimisticMutationUtilities<TData = any, TVariables = any>(
  config: OptimisticMutationUtilitiesConfig<TData, TVariables>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdateTracker<TData>[]>([]);
  const [stateSnapshots, setStateSnapshots] = useState<Map<string, TData>>(new Map());
  const { addNotification, setLoading } = useApplicationStore();
  
  // Batch processing for optimistic updates
  const batchQueue = useRef<Array<{ variables: TVariables; updateId: string }>>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Configuration ref to avoid stale closures
  const configRef = useRef(config);
  configRef.current = config;
  
  // Enhanced update tracking
  const addPendingUpdate = useCallback((update: OptimisticUpdateTracker<TData>) => {
    setPendingUpdates(prev => [...prev, update]);
    
    // Store state snapshot if enabled
    if (configRef.current.enableStateSnapshot && update.originalData) {
      setStateSnapshots(prev => new Map(prev).set(update.id, update.originalData!));
    }
  }, []);
  
  const updatePendingUpdate = useCallback((id: string, updates: Partial<OptimisticUpdateTracker<TData>>) => {
    setPendingUpdates(prev => 
      prev.map(update => 
        update.id === id ? { ...update, ...updates } : update
      )
    );
  }, []);
  
  const removePendingUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => prev.filter(update => update.id !== id));
    setStateSnapshots(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);
  
  // Enhanced conflict detection
  const detectConflicts = useCallback(<T extends Record<string, any>>(
    clientData: T,
    serverData: T,
    ignoreKeys: string[] = ['timestamp', 'updatedAt', 'id']
  ): boolean => {
    const clientKeys = Object.keys(clientData).filter(key => !ignoreKeys.includes(key));
    const serverKeys = Object.keys(serverData).filter(key => !ignoreKeys.includes(key));
    
    const allKeys = new Set([...clientKeys, ...serverKeys]);
    
    for (const key of allKeys) {
      if (clientData[key] !== serverData[key]) {
        return true;
      }
    }
    
    return false;
  }, []);
  
  // Enhanced conflict resolution
  const resolveConflict = useCallback((
    clientData: TData,
    serverData: TData,
    strategy: ConflictResolutionStrategy<TData>
  ): TData => {
    switch (strategy.strategy) {
      case 'client-wins':
        return { ...serverData as any, ...clientData as any };
      case 'server-wins':
        return serverData;
      case 'merge':
        // Intelligent merge - server data takes precedence for conflicts
        const merged = { ...clientData as any };
        Object.keys(serverData as any).forEach(key => {
          if ((serverData as any)[key] !== undefined) {
            (merged as any)[key] = (serverData as any)[key];
          }
        });
        return merged;
      case 'custom':
        return strategy.customResolver?.(clientData, serverData) ?? serverData;
      case 'prompt-user':
        // This would typically trigger a UI modal for user decision
        strategy.onConflictDetected?.(clientData, serverData);
        return serverData; // Default to server data while waiting for user input
      default:
        return serverData;
    }
  }, []);
  
  // Enhanced rollback mechanism with state snapshots
  const rollback = useCallback((updateId: string) => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update || !configRef.current.enableRollback) return;
    
    try {
      let rollbackData = update.originalData;
      
      // Use state snapshot if available
      if (configRef.current.enableStateSnapshot) {
        const snapshot = stateSnapshots.get(updateId);
        if (snapshot) {
          rollbackData = snapshot;
        }
      }
      
      if (rollbackData && configRef.current.onRollback) {
        configRef.current.onRollback(rollbackData, update.data);
      }
      
      updatePendingUpdate(updateId, { status: 'rolled_back' });
      
      // Show rollback feedback if enabled
      if (configRef.current.userFeedback?.showRollback !== false) {
        addNotification({
          type: 'info',
          title: 'Update Rolled Back',
          message: configRef.current.userFeedback?.customMessages?.rollback || 
                  'The optimistic update has been rolled back to its previous state.',
        });
      }
      
      // Remove after delay
      setTimeout(() => removePendingUpdate(updateId), 1000);
    } catch (error) {
      console.error('Failed to rollback update:', error);
      addNotification({
        type: 'error',
        title: 'Rollback Failed',
        message: 'Failed to rollback the update. Please refresh the page.',
      });
    }
  }, [pendingUpdates, updatePendingUpdate, removePendingUpdate, addNotification, stateSnapshots]);
  
  // Enhanced retry mechanism with exponential backoff
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
        status: 'retrying', 
        retryCount: update.retryCount + 1 
      });
      
      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, update.retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const result = await configRef.current.mutationFn(update.data);
      
      // Check for conflicts if enabled
      if (configRef.current.enableConflictDetection && 
          configRef.current.conflictResolution &&
          detectConflicts(update.data as any, result as any)) {
        
        const resolvedData = resolveConflict(
          update.data, 
          result, 
          configRef.current.conflictResolution
        );
        
        updatePendingUpdate(updateId, { 
          status: 'confirmed',
          conflictData: result 
        });
        
        if (configRef.current.onConflictResolved) {
          configRef.current.onConflictResolved(resolvedData, {
            client: update.data,
            server: result
          });
        }
      } else {
        updatePendingUpdate(updateId, { status: 'confirmed' });
      }
      
      if (configRef.current.onSuccess) {
        configRef.current.onSuccess(result, update.data, update.data);
      }
      
      addNotification({
        type: 'success',
        title: 'Update Successful',
        message: 'The retry was successful.',
      });
      
      setTimeout(() => removePendingUpdate(updateId), 2000);
    } catch (error) {
      updatePendingUpdate(updateId, { 
        status: 'failed',
        error: error as Error 
      });
      
      addNotification({
        type: 'error',
        title: 'Retry Failed',
        message: `Retry attempt ${update.retryCount + 1} failed. ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      // Auto-retry if enabled and within limits
      if (configRef.current.enableAutoRetry && update.retryCount < update.maxRetries - 1) {
        setTimeout(() => retry(updateId), 2000);
      }
    }
  }, [pendingUpdates, updatePendingUpdate, removePendingUpdate, addNotification, detectConflicts, resolveConflict]);
  
  // Batch processing for optimistic updates
  const processBatch = useCallback(async () => {
    if (batchQueue.current.length === 0) return;
    
    const batch = [...batchQueue.current];
    batchQueue.current = [];
    
    try {
      // Process all batched updates
      const promises = batch.map(({ variables, updateId }) => 
        configRef.current.mutationFn(variables).then(result => ({ updateId, result, variables }))
      );
      
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        const { updateId } = batch[index];
        
        if (result.status === 'fulfilled') {
          updatePendingUpdate(updateId, { status: 'confirmed' });
          if (configRef.current.onSuccess) {
            configRef.current.onSuccess(result.value.result, result.value.variables);
          }
        } else {
          updatePendingUpdate(updateId, { 
            status: 'failed',
            error: result.reason 
          });
          if (configRef.current.onError) {
            configRef.current.onError(result.reason, batch[index].variables);
          }
        }
      });
    } catch (error) {
      console.error('Batch processing failed:', error);
    }
  }, [updatePendingUpdate]);
  
  // Main mutation function with enhanced features
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
        optimisticData = configRef.current.onOptimisticUpdate(variables, originalData);
        
        const update: OptimisticUpdateTracker<TData> = {
          id: updateId,
          type: 'mutation',
          data: optimisticData,
          originalData,
          timestamp,
          status: 'pending',
          retryCount: 0,
          maxRetries,
          userFeedback: configRef.current.userFeedback,
        };
        
        addPendingUpdate(update);
        
        // Show progress feedback if enabled
        if (configRef.current.userFeedback?.showProgress !== false) {
          addNotification({
            type: 'info',
            title: 'Update in Progress',
            message: configRef.current.userFeedback?.customMessages?.progress || 
                    'Your changes are being saved...',
          });
        }
      }
      
      // Handle batching if enabled
      if (configRef.current.enableOptimisticBatching) {
        batchQueue.current.push({ variables, updateId });
        
        if (batchTimeoutRef.current) {
          clearTimeout(batchTimeoutRef.current);
        }
        
        batchTimeoutRef.current = setTimeout(() => {
          processBatch();
        }, configRef.current.batchDelay ?? 100);
        
        // Return optimistic data immediately for batched operations
        if (optimisticData) {
          return optimisticData;
        }
      }
      
      // Perform the actual mutation
      const result = await configRef.current.mutationFn(variables);
      
      // Check for conflicts if enabled
      if (optimisticData && 
          configRef.current.enableConflictDetection && 
          configRef.current.conflictResolution &&
          detectConflicts(optimisticData as any, result as any)) {
        
        const resolvedData = resolveConflict(
          optimisticData, 
          result, 
          configRef.current.conflictResolution
        );
        
        updatePendingUpdate(updateId, { 
          status: 'confirmed',
          conflictData: result 
        });
        
        if (configRef.current.onConflictResolved) {
          configRef.current.onConflictResolved(resolvedData, {
            client: optimisticData,
            server: result
          });
        }
        
        return resolvedData;
      } else {
        // No conflicts, update status to confirmed
        if (optimisticData) {
          updatePendingUpdate(updateId, { status: 'confirmed' });
        }
      }
      
      // Call success callback
      if (configRef.current.onSuccess) {
        configRef.current.onSuccess(result, variables, optimisticData);
      }
      
      // Show success feedback if enabled
      if (configRef.current.userFeedback?.showSuccess !== false) {
        addNotification({
          type: 'success',
          title: 'Update Successful',
          message: configRef.current.userFeedback?.customMessages?.success || 
                  'Your changes have been saved successfully.',
        });
      }
      
      // Remove confirmed update after delay
      if (optimisticData) {
        setTimeout(() => removePendingUpdate(updateId), 2000);
      }
      
      return result;
    } catch (error) {
      // Handle mutation failure
      if (optimisticData) {
        updatePendingUpdate(updateId, { 
          status: 'failed',
          error: error as Error 
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Call error callback
      if (configRef.current.onError) {
        configRef.current.onError(error as Error, variables, optimisticData);
      }
      
      // Show error feedback if enabled
      if (configRef.current.userFeedback?.showError !== false) {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: configRef.current.userFeedback?.customMessages?.error || 
                  `${errorMessage}. You can retry or rollback the changes.`,
        });
      }
      
      // Auto-retry if enabled
      if (configRef.current.enableAutoRetry && optimisticData) {
        setTimeout(() => retry(updateId), 1000);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      setLoading('optimistic-mutation', false);
    }
  }, [addPendingUpdate, updatePendingUpdate, removePendingUpdate, addNotification, setLoading, detectConflicts, resolveConflict, retry, processBatch]);
  
  // Rollback all updates
  const rollbackAll = useCallback(() => {
    const rollbackableUpdates = pendingUpdates.filter(
      update => update.status === 'pending' || update.status === 'failed'
    );
    
    rollbackableUpdates.forEach(update => rollback(update.id));
  }, [pendingUpdates, rollback]);
  
  // Get update statistics
  const getUpdateStats = useCallback(() => {
    const stats = {
      total: pendingUpdates.length,
      pending: 0,
      confirmed: 0,
      failed: 0,
      rolledBack: 0,
      retrying: 0,
    };
    
    pendingUpdates.forEach(update => {
      switch (update.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'confirmed':
          stats.confirmed++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'rolled_back':
          stats.rolledBack++;
          break;
        case 'retrying':
          stats.retrying++;
          break;
      }
    });
    
    return stats;
  }, [pendingUpdates]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    // Core functions
    mutate,
    rollback,
    rollbackAll,
    retry,
    
    // State
    isLoading,
    pendingUpdates,
    stateSnapshots: Array.from(stateSnapshots.entries()),
    
    // Statistics and utilities
    getUpdateStats,
    hasConflicts: (clientData: TData, serverData: TData) => 
      detectConflicts(clientData as any, serverData as any),
    resolveConflict: (clientData: TData, serverData: TData, strategy: ConflictResolutionStrategy<TData>) =>
      resolveConflict(clientData, serverData, strategy),
    
    // Batch processing
    processBatch,
    batchQueueLength: batchQueue.current.length,
  };
}

// Utility functions for optimistic updates
export const optimisticMutationUtils = {
  // Create a debounced optimistic update
  createDebouncedUpdate: <T>(
    updateFn: (data: T) => void,
    delay: number = 300
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return (data: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateFn(data), delay);
    };
  },

  // Create a throttled optimistic update
  createThrottledUpdate: <T>(
    updateFn: (data: T) => void,
    delay: number = 300
  ) => {
    let lastCall = 0;
    
    return (data: T) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        updateFn(data);
      }
    };
  },

  // Validate optimistic update data
  validateOptimisticData: <T>(
    data: T,
    validator: (data: T) => boolean,
    fallback?: T
  ): T => {
    if (validator(data)) {
      return data;
    }
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw new Error('Invalid optimistic update data');
  },

  // Create conflict-free merge
  createConflictFreeMerge: <T extends Record<string, any>>(
    priorityKeys: string[] = []
  ) => {
    return (clientData: T, serverData: T): T => {
      const merged = { ...serverData };
      
      // Apply client data for priority keys
      priorityKeys.forEach(key => {
        if (clientData[key] !== undefined) {
          merged[key] = clientData[key];
        }
      });
      
      return merged;
    };
  },
};