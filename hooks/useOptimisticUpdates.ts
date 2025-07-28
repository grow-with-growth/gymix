import { useCallback, useRef, useState, useEffect } from 'react';
import { useOptimisticMutation, OptimisticUpdate } from './useOptimisticMutation';

// Global optimistic updates manager
class OptimisticUpdatesManager {
  private updates: Map<string, OptimisticUpdate> = new Map();
  private listeners: Set<(updates: OptimisticUpdate[]) => void> = new Set();

  addUpdate(update: OptimisticUpdate) {
    this.updates.set(update.id, update);
    this.notifyListeners();
  }

  updateUpdate(id: string, changes: Partial<OptimisticUpdate>) {
    const existing = this.updates.get(id);
    if (existing) {
      this.updates.set(id, { ...existing, ...changes });
      this.notifyListeners();
    }
  }

  removeUpdate(id: string) {
    this.updates.delete(id);
    this.notifyListeners();
  }

  getUpdates(): OptimisticUpdate[] {
    return Array.from(this.updates.values());
  }

  getPendingUpdates(): OptimisticUpdate[] {
    return this.getUpdates().filter(update => update.status === 'pending');
  }

  getFailedUpdates(): OptimisticUpdate[] {
    return this.getUpdates().filter(update => update.status === 'failed');
  }

  subscribe(listener: (updates: OptimisticUpdate[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const updates = this.getUpdates();
    this.listeners.forEach(listener => listener(updates));
  }

  clear() {
    this.updates.clear();
    this.notifyListeners();
  }

  rollbackAll() {
    const rollbackableUpdates = this.getUpdates().filter(
      update => update.status === 'pending' || update.status === 'failed'
    );
    
    rollbackableUpdates.forEach(update => {
      this.updateUpdate(update.id, { status: 'rolled_back' });
    });
  }
}

// Global instance
const globalOptimisticManager = new OptimisticUpdatesManager();

// Hook to access global optimistic updates
export function useGlobalOptimisticUpdates() {
  const [updates, setUpdates] = useState<OptimisticUpdate[]>([]);

  useEffect(() => {
    const unsubscribe = globalOptimisticManager.subscribe(setUpdates);
    setUpdates(globalOptimisticManager.getUpdates());
    return unsubscribe;
  }, []);

  const addUpdate = useCallback((update: OptimisticUpdate) => {
    globalOptimisticManager.addUpdate(update);
  }, []);

  const updateUpdate = useCallback((id: string, changes: Partial<OptimisticUpdate>) => {
    globalOptimisticManager.updateUpdate(id, changes);
  }, []);

  const removeUpdate = useCallback((id: string) => {
    globalOptimisticManager.removeUpdate(id);
  }, []);

  const rollbackAll = useCallback(() => {
    globalOptimisticManager.rollbackAll();
  }, []);

  const clear = useCallback(() => {
    globalOptimisticManager.clear();
  }, []);

  return {
    updates,
    pendingUpdates: globalOptimisticManager.getPendingUpdates(),
    failedUpdates: globalOptimisticManager.getFailedUpdates(),
    pendingCount: globalOptimisticManager.getPendingUpdates().length,
    failedCount: globalOptimisticManager.getFailedUpdates().length,
    addUpdate,
    updateUpdate,
    removeUpdate,
    rollbackAll,
    clear,
  };
}

// Hook for conflict resolution
export function useConflictResolution() {
  const [conflicts, setConflicts] = useState<Array<{
    id: string;
    clientData: any;
    serverData: any;
    timestamp: number;
  }>>([]);

  const addConflict = useCallback((conflict: {
    id: string;
    clientData: any;
    serverData: any;
  }) => {
    setConflicts(prev => [...prev, { ...conflict, timestamp: Date.now() }]);
  }, []);

  const resolveConflict = useCallback((
    conflictId: string, 
    resolution: 'client' | 'server' | 'merge',
    mergedData?: any
  ) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return null;

    let resolvedData;
    switch (resolution) {
      case 'client':
        resolvedData = conflict.clientData;
        break;
      case 'server':
        resolvedData = conflict.serverData;
        break;
      case 'merge':
        resolvedData = mergedData || { ...conflict.serverData, ...conflict.clientData };
        break;
      default:
        resolvedData = conflict.serverData;
    }

    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    return resolvedData;
  }, [conflicts]);

  const clearConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  return {
    conflicts,
    addConflict,
    resolveConflict,
    clearConflicts,
  };
}

// Hook for rollback mechanism
export function useRollbackMechanism() {
  const rollbackStack = useRef<Array<{
    id: string;
    data: any;
    timestamp: number;
    action: string;
  }>>([]);

  const pushToRollbackStack = useCallback((item: {
    id: string;
    data: any;
    action: string;
  }) => {
    rollbackStack.current.push({
      ...item,
      timestamp: Date.now(),
    });

    // Keep only last 50 items to prevent memory leaks
    if (rollbackStack.current.length > 50) {
      rollbackStack.current = rollbackStack.current.slice(-50);
    }
  }, []);

  const rollbackToPoint = useCallback((targetId: string) => {
    const targetIndex = rollbackStack.current.findIndex(item => item.id === targetId);
    if (targetIndex === -1) return null;

    const itemsToRollback = rollbackStack.current.slice(targetIndex);
    rollbackStack.current = rollbackStack.current.slice(0, targetIndex);

    return itemsToRollback.reverse(); // Rollback in reverse order
  }, []);

  const getLastRollbackPoint = useCallback(() => {
    return rollbackStack.current[rollbackStack.current.length - 1] || null;
  }, []);

  const clearRollbackStack = useCallback(() => {
    rollbackStack.current = [];
  }, []);

  const getRollbackStack = useCallback(() => {
    return [...rollbackStack.current];
  }, []);

  return {
    pushToRollbackStack,
    rollbackToPoint,
    getLastRollbackPoint,
    clearRollbackStack,
    getRollbackStack,
  };
}

// Enhanced optimistic mutation hook with global tracking
export function useOptimisticMutationWithTracking<TData = any, TVariables = any>(
  config: OptimisticMutationConfig<TData, TVariables>
) {
  const { addUpdate } = useGlobalOptimisticUpdates();
  
  const enhancedConfig: OptimisticMutationConfig<TData, TVariables> = {
    ...config,
    onOptimisticUpdate: (variables: TVariables) => {
      const result = config.onOptimisticUpdate?.(variables);
      
      // Add to global tracking if optimistic update is applied
      if (result) {
        const update: OptimisticUpdate<TData> = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'mutation',
          data: result,
          timestamp: Date.now(),
          status: 'pending',
          retryCount: 0,
          maxRetries: config.maxRetries ?? 3,
        };
        addUpdate(update);
      }
      
      return result;
    },
    onSuccess: (data: TData, variables: TVariables) => {
      config.onSuccess?.(data, variables);
      // Update global tracking status handled by the base hook
    },
    onError: (error: Error, variables: TVariables, rollbackData?: TData) => {
      config.onError?.(error, variables, rollbackData);
      // Update global tracking status handled by the base hook
    },
  };

  return useOptimisticMutation(enhancedConfig);
}

// Utility functions
export const optimisticUtils = {
  // Create a debounced optimistic update
  createDebouncedOptimisticUpdate: <T>(
    updateFn: (data: T) => void,
    delay: number = 300
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return (data: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateFn(data), delay);
    };
  },

  // Merge optimistic updates with server data
  mergeOptimisticWithServer: <T extends Record<string, any>>(
    optimisticData: T,
    serverData: T,
    strategy: 'client-wins' | 'server-wins' | 'merge' = 'merge'
  ): T => {
    switch (strategy) {
      case 'client-wins':
        return { ...serverData, ...optimisticData };
      case 'server-wins':
        return serverData;
      case 'merge':
      default:
        // Deep merge with server data taking precedence for conflicts
        const merged = { ...optimisticData };
        Object.keys(serverData).forEach(key => {
          if (serverData[key] !== undefined) {
            (merged as any)[key] = serverData[key];
          }
        });
        return merged;
    }
  },

  // Check if data has conflicts
  hasConflicts: <T extends Record<string, any>>(
    clientData: T,
    serverData: T,
    ignoreKeys: string[] = ['timestamp', 'updatedAt']
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
  },
};

export { globalOptimisticManager };