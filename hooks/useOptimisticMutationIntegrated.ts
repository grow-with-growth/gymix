import { useCallback, useRef, useState, useEffect } from 'react';
import { useApplicationStore } from '../stores/applicationStore';
import { 
  globalOptimisticUpdateManager, 
  OptimisticUpdateEntry,
  optimisticUpdateUtils 
} from '../lib/optimisticUpdateManager';

// Configuration for integrated optimistic mutations
export interface IntegratedOptimisticMutationConfig<TData, TVariables> {
  // Core mutation function
  mutationFn: (variables: TVariables) => Promise<TData>;
  
  // Optimistic update configuration
  onOptimisticUpdate?: (variables: TVariables, originalData?: TData) => TData;
  
  // Lifecycle callbacks
  onSuccess?: (data: TData, variables: TVariables, optimisticData?: TData) => void;
  onError?: (error: Error, variables: TVariables, optimisticData?: TData) => void;
  onRollback?: (rollbackData: TData, variables: TVariables) => void;
  onConflictResolved?: (resolvedData: TData, conflictData: { client: TData; server: TData }) => void;
  
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
  enableAutoRetry?: boolean;
  
  // Rollback configuration
  enableRollback?: boolean;
  enableStateSnapshot?: boolean;
  
  // Conflict resolution
  enableConflictDetection?: boolean;
  conflictResolution?: {
    strategy: 'client-wins' | 'server-wins' | 'merge' | 'prompt-user' | 'custom';
    customResolver?: (clientData: TData, serverData: TData) => TData;
    onConflictDetected?: (clientData: TData, serverData: TData) => void;
  };
  
  // UI feedback
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
  
  // Tracking metadata
  updateType?: string;
  operation?: OptimisticUpdateEntry['operation'];
  entityType?: string;
  entityId?: string;
  
  // Advanced features
  enableBatching?: boolean;
  batchDelay?: number;
  enablePersistence?: boolean;
}

export interface IntegratedOptimisticMutationResult<TData, TVariables> {
  // Core mutation functions
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  
  // State
  isLoading: boolean;
  pendingUpdates: OptimisticUpdateEntry[];
  
  // Control functions
  rollback: (updateId: string) => void;
  rollbackAll: () => void;
  retry: (updateId: string) => Promise<void>;
  
  // Utility functions
  getUpdateStats: () => ReturnType<typeof globalOptimisticUpdateManager.getStats>;
  hasConflicts: () => boolean;
  getConflictedUpdates: () => OptimisticUpdateEntry[];
}

// Main integrated hook
export function useOptimisticMutationIntegrated<TData = any, TVariables = any>(
  config: IntegratedOptimisticMutationConfig<TData, TVariables>
): IntegratedOptimisticMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdateEntry[]>([]);
  const { addNotification, setLoading } = useApplicationStore();
  
  // Batch processing
  const batchQueue = useRef<Array<{ variables: TVariables; updateId: string }>>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Configuration ref to avoid stale closures
  const configRef = useRef(config);
  configRef.current = config;
  
  // Subscribe to global update manager
  useEffect(() => {
    const unsubscribe = globalOptimisticUpdateManager.addEventListener((event) => {
      if (event.type === 'update_added' || event.type === 'update_changed' || event.type === 'update_removed') {
        // Update local pending updates
        const allUpdates = globalOptimisticUpdateManager.getAllUpdates();
        const relevantUpdates = allUpdates.filter(update => 
          update.type === (configRef.current.updateType || 'mutation') &&
          (update.status === 'pending' || update.status === 'retrying' || update.status === 'failed')
        );
        setPendingUpdates(relevantUpdates);
      }
    });
    
    return unsubscribe;
  }, []);
  
  // Conflict detection utility
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
  
  // Conflict resolution utility
  const resolveConflict = useCallback((
    clientData: TData,
    serverData: TData,
    strategy: NonNullable<IntegratedOptimisticMutationConfig<TData, TVariables>['conflictResolution']>
  ): TData => {
    switch (strategy.strategy) {
      case 'client-wins':
        return { ...serverData as any, ...clientData as any };
      case 'server-wins':
        return serverData;
      case 'merge':
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
        strategy.onConflictDetected?.(clientData, serverData);
        return serverData;
      default:
        return serverData;
    }
  }, []);
  
  // Rollback function
  const rollback = useCallback((updateId: string) => {
    const update = globalOptimisticUpdateManager.getUpdate(updateId);
    if (!update || !configRef.current.enableRollback) return;
    
    try {
      if (update.originalData && configRef.current.onRollback) {
        configRef.current.onRollback(update.originalData, update.data);
      }
      
      globalOptimisticUpdateManager.updateUpdate(updateId, { status: 'rolled_back' });
      
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
      setTimeout(() => {
        globalOptimisticUpdateManager.removeUpdate(updateId);
      }, 1000);
    } catch (error) {
      console.error('Failed to rollback update:', error);
      addNotification({
        type: 'error',
        title: 'Rollback Failed',
        message: 'Failed to rollback the update. Please refresh the page.',
      });
    }
  }, [addNotification]);
  
  // Retry function with exponential backoff
  const retry = useCallback(async (updateId: string) => {
    const update = globalOptimisticUpdateManager.getUpdate(updateId);
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
      globalOptimisticUpdateManager.updateUpdate(updateId, { 
        status: 'retrying', 
        retryCount: update.retryCount + 1 
      });
      
      // Exponential backoff delay
      const delay = optimisticUpdateUtils.calculateRetryDelay(
        update.retryCount, 
        configRef.current.retryDelay
      );
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const result = await configRef.current.mutationFn(update.data);
      
      // Check for conflicts if enabled
      if (configRef.current.enableConflictDetection && 
          configRef.current.conflictResolution &&
          detectConflicts(update.data as any, result as any)) {
        
        globalOptimisticUpdateManager.detectConflict(updateId, result);
        
        const resolvedData = resolveConflict(
          update.data, 
          result, 
          configRef.current.conflictResolution
        );
        
        globalOptimisticUpdateManager.updateUpdate(updateId, { 
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
        globalOptimisticUpdateManager.updateUpdate(updateId, { status: 'confirmed' });
      }
      
      if (configRef.current.onSuccess) {
        configRef.current.onSuccess(result, update.data, update.data);
      }
      
      addNotification({
        type: 'success',
        title: 'Update Successful',
        message: 'The retry was successful.',
      });
      
      setTimeout(() => {
        globalOptimisticUpdateManager.removeUpdate(updateId);
      }, 2000);
    } catch (error) {
      globalOptimisticUpdateManager.updateUpdate(updateId, { 
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
  }, [addNotification, detectConflicts, resolveConflict]);
  
  // Batch processing
  const processBatch = useCallback(async () => {
    if (batchQueue.current.length === 0) return;
    
    const batch = [...batchQueue.current];
    batchQueue.current = [];
    
    try {
      const promises = batch.map(({ variables, updateId }) => 
        configRef.current.mutationFn(variables).then(result => ({ updateId, result, variables }))
      );
      
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        const { updateId } = batch[index];
        
        if (result.status === 'fulfilled') {
          globalOptimisticUpdateManager.updateUpdate(updateId, { status: 'confirmed' });
          if (configRef.current.onSuccess) {
            configRef.current.onSuccess(result.value.result, result.value.variables);
          }
        } else {
          globalOptimisticUpdateManager.updateUpdate(updateId, { 
            status: 'failed',
            error: result.reason 
          });
          if (configRef.current.onError) {
            configRef.current.onError(result.reason, batch[index].variables);
          }
        }
      });
      
      globalOptimisticUpdateManager.processBatch(batch.map(b => b.updateId));
    } catch (error) {
      console.error('Batch processing failed:', error);
    }
  }, []);
  
  // Main mutation function
  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setLoading('optimistic-mutation', true);
    
    let optimisticData: TData | undefined;
    let updateId: string | undefined;
    
    try {
      // Apply optimistic update if provided
      if (configRef.current.onOptimisticUpdate) {
        optimisticData = configRef.current.onOptimisticUpdate(variables);
        
        // Create update entry
        const updateEntry = optimisticUpdateUtils.createUpdateEntry(
          configRef.current.updateType || 'mutation',
          configRef.current.operation || 'update',
          optimisticData,
          {
            originalData: undefined, // Could be provided by caller
            maxRetries: configRef.current.maxRetries || 3,
            entityType: configRef.current.entityType,
            entityId: configRef.current.entityId,
            userFeedback: optimisticUpdateUtils.createUserFeedback(configRef.current.userFeedback),
            metadata: {
              variables,
              timestamp: Date.now(),
            },
          }
        );
        
        updateId = globalOptimisticUpdateManager.addUpdate(updateEntry);
        
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
      if (configRef.current.enableBatching && updateId) {
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
      
      // Handle conflicts if enabled
      if (optimisticData && updateId &&
          configRef.current.enableConflictDetection && 
          configRef.current.conflictResolution &&
          detectConflicts(optimisticData as any, result as any)) {
        
        globalOptimisticUpdateManager.detectConflict(updateId, result);
        
        const resolvedData = resolveConflict(
          optimisticData, 
          result, 
          configRef.current.conflictResolution
        );
        
        globalOptimisticUpdateManager.updateUpdate(updateId, { 
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
        if (updateId) {
          globalOptimisticUpdateManager.updateUpdate(updateId, { status: 'confirmed' });
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
      if (updateId) {
        setTimeout(() => {
          globalOptimisticUpdateManager.removeUpdate(updateId!);
        }, 2000);
      }
      
      return result;
    } catch (error) {
      // Handle mutation failure
      if (updateId) {
        globalOptimisticUpdateManager.updateUpdate(updateId, { 
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
      if (configRef.current.enableAutoRetry && updateId) {
        setTimeout(() => retry(updateId!), 1000);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      setLoading('optimistic-mutation', false);
    }
  }, [addNotification, setLoading, detectConflicts, resolveConflict, retry, processBatch]);
  
  // Rollback all updates
  const rollbackAll = useCallback(() => {
    const rollbackableUpdates = pendingUpdates.filter(
      update => update.status === 'pending' || update.status === 'failed'
    );
    
    rollbackableUpdates.forEach(update => rollback(update.id));
  }, [pendingUpdates, rollback]);
  
  // Utility functions
  const getUpdateStats = useCallback(() => {
    return globalOptimisticUpdateManager.getStats();
  }, []);
  
  const hasConflicts = useCallback(() => {
    return globalOptimisticUpdateManager.hasConflicts();
  }, []);
  
  const getConflictedUpdates = useCallback(() => {
    return globalOptimisticUpdateManager.getConflictedUpdates();
  }, []);
  
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
    mutateAsync: mutate,
    
    // State
    isLoading,
    pendingUpdates,
    
    // Control functions
    rollback,
    rollbackAll,
    retry,
    
    // Utility functions
    getUpdateStats,
    hasConflicts,
    getConflictedUpdates,
  };
}