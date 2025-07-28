import { OptimisticMutationConfig } from '../hooks/useOptimisticMutation';

// Common optimistic update patterns
export const optimisticPatterns = {
  // Create operation - add item optimistically
  create: <TData, TVariables extends { data: Partial<TData> }>(
    config: {
      generateId?: () => string;
      addToList?: (items: TData[], newItem: TData) => TData[];
      onSuccess?: (data: TData, variables: TVariables) => void;
      onError?: (error: Error, variables: TVariables, rollbackData?: TData) => void;
    } = {}
  ): Pick<OptimisticMutationConfig<TData, TVariables>, 'onOptimisticUpdate' | 'onSuccess' | 'onError'> => ({
    onOptimisticUpdate: (variables) => {
      const optimisticItem = {
        id: config.generateId?.() || `temp-${Date.now()}`,
        ...variables.data,
        _optimistic: true,
      } as TData;
      
      return optimisticItem;
    },
    onSuccess: config.onSuccess,
    onError: config.onError,
  }),

  // Update operation - modify item optimistically
  update: <TData, TVariables extends { id: string; data: Partial<TData> }>(
    config: {
      getCurrentData?: (id: string) => TData | undefined;
      onSuccess?: (data: TData, variables: TVariables) => void;
      onError?: (error: Error, variables: TVariables, rollbackData?: TData) => void;
    } = {}
  ): Pick<OptimisticMutationConfig<TData, TVariables>, 'onOptimisticUpdate' | 'onSuccess' | 'onError'> => ({
    onOptimisticUpdate: (variables) => {
      const currentData = config.getCurrentData?.(variables.id);
      if (!currentData) {
        throw new Error(`Cannot find item with id ${variables.id} for optimistic update`);
      }
      
      return {
        ...currentData,
        ...variables.data,
        _optimistic: true,
      } as TData;
    },
    onSuccess: config.onSuccess,
    onError: config.onError,
  }),

  // Delete operation - remove item optimistically
  delete: <TData, TVariables extends { id: string }>(
    config: {
      getCurrentData?: (id: string) => TData | undefined;
      onSuccess?: (data: any, variables: TVariables) => void;
      onError?: (error: Error, variables: TVariables, rollbackData?: TData) => void;
    } = {}
  ): Pick<OptimisticMutationConfig<any, TVariables>, 'onOptimisticUpdate' | 'onSuccess' | 'onError'> => ({
    onOptimisticUpdate: (variables) => {
      const currentData = config.getCurrentData?.(variables.id);
      return {
        id: variables.id,
        _deleted: true,
        _originalData: currentData,
      };
    },
    onSuccess: config.onSuccess,
    onError: config.onError,
  }),

  // Bulk operations - handle multiple items
  bulk: <TData, TVariables extends { items: Array<{ id: string; data: Partial<TData> }> }>(
    config: {
      operation: 'create' | 'update' | 'delete';
      getCurrentData?: (id: string) => TData | undefined;
      generateId?: () => string;
      onSuccess?: (data: TData[], variables: TVariables) => void;
      onError?: (error: Error, variables: TVariables, rollbackData?: TData[]) => void;
    }
  ): Pick<OptimisticMutationConfig<TData[], TVariables>, 'onOptimisticUpdate' | 'onSuccess' | 'onError'> => ({
    onOptimisticUpdate: (variables) => {
      return variables.items.map(item => {
        switch (config.operation) {
          case 'create':
            return {
              id: config.generateId?.() || `temp-${Date.now()}-${Math.random()}`,
              ...item.data,
              _optimistic: true,
            } as TData;
          
          case 'update':
            const currentData = config.getCurrentData?.(item.id);
            if (!currentData) {
              throw new Error(`Cannot find item with id ${item.id} for bulk update`);
            }
            return {
              ...currentData,
              ...item.data,
              _optimistic: true,
            } as TData;
          
          case 'delete':
            return {
              id: item.id,
              _deleted: true,
              _originalData: config.getCurrentData?.(item.id),
            } as TData;
          
          default:
            throw new Error(`Unknown bulk operation: ${config.operation}`);
        }
      });
    },
    onSuccess: config.onSuccess,
    onError: config.onError,
  }),
};

// Utility functions for managing optimistic state in lists
export const listOptimisticUtils = {
  // Add item to list optimistically
  addOptimisticItem: <T extends { id: string }>(
    list: T[],
    item: T,
    position: 'start' | 'end' = 'end'
  ): T[] => {
    const itemWithOptimistic = { ...item, _optimistic: true } as T;
    return position === 'start' 
      ? [itemWithOptimistic, ...list]
      : [...list, itemWithOptimistic];
  },

  // Update item in list optimistically
  updateOptimisticItem: <T extends { id: string }>(
    list: T[],
    id: string,
    updates: Partial<T>
  ): T[] => {
    return list.map(item => 
      item.id === id 
        ? { ...item, ...updates, _optimistic: true }
        : item
    );
  },

  // Remove item from list optimistically
  removeOptimisticItem: <T extends { id: string }>(
    list: T[],
    id: string
  ): T[] => {
    return list.filter(item => item.id !== id);
  },

  // Mark item as deleted (soft delete)
  markAsDeleted: <T extends { id: string }>(
    list: T[],
    id: string
  ): T[] => {
    return list.map(item => 
      item.id === id 
        ? { ...item, _deleted: true, _optimistic: true }
        : item
    );
  },

  // Filter out optimistic items
  filterOptimistic: <T extends { _optimistic?: boolean }>(list: T[]): T[] => {
    return list.filter(item => !item._optimistic);
  },

  // Filter out deleted items
  filterDeleted: <T extends { _deleted?: boolean }>(list: T[]): T[] => {
    return list.filter(item => !item._deleted);
  },

  // Get only optimistic items
  getOptimisticItems: <T extends { _optimistic?: boolean }>(list: T[]): T[] => {
    return list.filter(item => item._optimistic);
  },

  // Merge server data with optimistic updates
  mergeWithServer: <T extends { id: string; _optimistic?: boolean }>(
    optimisticList: T[],
    serverList: T[]
  ): T[] => {
    const serverMap = new Map(serverList.map(item => [item.id, item]));
    const result: T[] = [];

    // Add all server items
    serverList.forEach(serverItem => {
      result.push(serverItem);
    });

    // Add optimistic items that don't exist on server
    optimisticList.forEach(optimisticItem => {
      if (optimisticItem._optimistic && !serverMap.has(optimisticItem.id)) {
        result.push(optimisticItem);
      }
    });

    return result;
  },
};

// Conflict resolution helpers
export const conflictResolutionHelpers = {
  // Simple field-level conflict detection
  detectFieldConflicts: <T extends Record<string, any>>(
    clientData: T,
    serverData: T,
    ignoreFields: string[] = ['updatedAt', 'timestamp', '_optimistic']
  ): string[] => {
    const conflicts: string[] = [];
    
    Object.keys(clientData).forEach(key => {
      if (ignoreFields.includes(key)) return;
      
      if (clientData[key] !== serverData[key]) {
        conflicts.push(key);
      }
    });

    return conflicts;
  },

  // Automatic conflict resolution strategies
  resolveConflicts: <T extends Record<string, any>>(
    clientData: T,
    serverData: T,
    strategy: 'client-wins' | 'server-wins' | 'newest-wins' | 'merge',
    conflictFields?: string[]
  ): T => {
    switch (strategy) {
      case 'client-wins':
        return { ...serverData, ...clientData };
      
      case 'server-wins':
        return serverData;
      
      case 'newest-wins':
        const clientTime = clientData.updatedAt || clientData.timestamp || 0;
        const serverTime = serverData.updatedAt || serverData.timestamp || 0;
        return clientTime > serverTime ? clientData : serverData;
      
      case 'merge':
      default:
        const merged = { ...serverData };
        
        // If specific conflict fields are provided, only merge those
        if (conflictFields) {
          conflictFields.forEach(field => {
            if (clientData[field] !== undefined) {
              merged[field] = clientData[field];
            }
          });
        } else {
          // Merge all client changes
          Object.keys(clientData).forEach(key => {
            if (clientData[key] !== undefined) {
              merged[key] = clientData[key];
            }
          });
        }
        
        return merged;
    }
  },

  // Create a conflict resolution prompt
  createConflictPrompt: <T extends Record<string, any>>(
    clientData: T,
    serverData: T,
    conflictFields: string[]
  ) => ({
    title: 'Data Conflict Detected',
    message: `The data has been modified by another user. Please choose how to resolve the conflicts in: ${conflictFields.join(', ')}`,
    options: [
      { label: 'Keep My Changes', value: 'client-wins' },
      { label: 'Use Server Version', value: 'server-wins' },
      { label: 'Merge Changes', value: 'merge' },
    ],
    clientData,
    serverData,
    conflictFields,
  }),
};

// Performance optimization helpers
export const optimisticPerformanceHelpers = {
  // Debounce optimistic updates
  createDebouncedOptimistic: <T>(
    updateFn: (data: T) => void,
    delay: number = 300
  ) => {
    let timeoutId: NodeJS.Timeout;
    let latestData: T;

    return (data: T) => {
      latestData = data;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateFn(latestData), delay);
    };
  },

  // Throttle optimistic updates
  createThrottledOptimistic: <T>(
    updateFn: (data: T) => void,
    delay: number = 100
  ) => {
    let lastCall = 0;
    let timeoutId: NodeJS.Timeout;

    return (data: T) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        lastCall = now;
        updateFn(data);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          updateFn(data);
        }, delay - (now - lastCall));
      }
    };
  },

  // Batch multiple optimistic updates
  createBatchedOptimistic: <T>(
    updateFn: (data: T[]) => void,
    batchSize: number = 10,
    maxWaitTime: number = 1000
  ) => {
    let batch: T[] = [];
    let timeoutId: NodeJS.Timeout;

    return (data: T) => {
      batch.push(data);

      if (batch.length >= batchSize) {
        updateFn([...batch]);
        batch = [];
        clearTimeout(timeoutId);
      } else if (batch.length === 1) {
        // Start timer for first item in batch
        timeoutId = setTimeout(() => {
          if (batch.length > 0) {
            updateFn([...batch]);
            batch = [];
          }
        }, maxWaitTime);
      }
    };
  },
};