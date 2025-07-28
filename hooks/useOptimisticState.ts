import { useState, useCallback, useRef, useEffect } from 'react';
import { useOptimisticMutation, OptimisticMutationConfig } from './useOptimisticMutation';

// Hook for managing optimistic state updates
export function useOptimisticState<T>(
  initialState: T,
  mutationConfig?: Partial<OptimisticMutationConfig<T, Partial<T>>>
) {
  const [state, setState] = useState<T>(initialState);
  const [optimisticState, setOptimisticState] = useState<T>(initialState);
  const rollbackRef = useRef<T>(initialState);
  
  // Track if we have pending optimistic updates
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false);
  
  const mutation = useOptimisticMutation<T, Partial<T>>({
    mutationFn: async (updates) => {
      // This would typically be an API call
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...state, ...updates };
    },
    onOptimisticUpdate: (updates) => {
      rollbackRef.current = state;
      const newState = { ...state, ...updates };
      setOptimisticState(newState);
      setHasPendingUpdates(true);
      return newState;
    },
    onSuccess: (data) => {
      setState(data);
      setOptimisticState(data);
      setHasPendingUpdates(false);
    },
    onError: () => {
      // Rollback to previous state on error
      setOptimisticState(rollbackRef.current);
      setHasPendingUpdates(false);
    },
    onRollback: (rollbackData) => {
      setOptimisticState(rollbackData);
      setHasPendingUpdates(false);
    },
    enableRollback: true,
    maxRetries: 3,
    ...mutationConfig,
  });
  
  // Update optimistic state when actual state changes
  useEffect(() => {
    if (!hasPendingUpdates) {
      setOptimisticState(state);
    }
  }, [state, hasPendingUpdates]);
  
  const updateState = useCallback(async (updates: Partial<T>) => {
    try {
      await mutation.mutate(updates);
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('State update failed:', error);
    }
  }, [mutation]);
  
  const rollbackState = useCallback(() => {
    if (mutation.pendingUpdates.length > 0) {
      mutation.rollbackAll();
    }
  }, [mutation]);
  
  return {
    // Current state (optimistic if pending, actual if confirmed)
    state: optimisticState,
    // Actual confirmed state
    confirmedState: state,
    // Update function
    updateState,
    // Rollback function
    rollbackState,
    // Mutation state
    isLoading: mutation.isLoading,
    pendingUpdates: mutation.pendingUpdates,
    hasPendingUpdates,
    // Direct access to mutation functions
    retry: mutation.retry,
    rollback: mutation.rollback,
  };
}

// Hook for optimistic list operations
export function useOptimisticList<T extends { id: string }>(
  initialList: T[],
  mutationConfig?: {
    onAdd?: (item: Omit<T, 'id'>) => Promise<T>;
    onUpdate?: (id: string, updates: Partial<T>) => Promise<T>;
    onDelete?: (id: string) => Promise<void>;
    onReorder?: (fromIndex: number, toIndex: number) => Promise<T[]>;
  }
) {
  const [list, setList] = useState<T[]>(initialList);
  const [optimisticList, setOptimisticList] = useState<T[]>(initialList);
  const rollbackRef = useRef<T[]>(initialList);
  
  const [pendingOperations, setPendingOperations] = useState<{
    [key: string]: 'add' | 'update' | 'delete' | 'reorder';
  }>({});
  
  // Add item optimistically
  const addItem = useCallback(async (item: Omit<T, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...item, id: tempId } as T;
    
    // Store rollback state
    rollbackRef.current = optimisticList;
    
    // Apply optimistic update
    const newList = [...optimisticList, optimisticItem];
    setOptimisticList(newList);
    setPendingOperations(prev => ({ ...prev, [tempId]: 'add' }));
    
    try {
      if (mutationConfig?.onAdd) {
        const confirmedItem = await mutationConfig.onAdd(item);
        
        // Replace optimistic item with confirmed item
        setList(prev => [...prev, confirmedItem]);
        setOptimisticList(prev => 
          prev.map(listItem => 
            listItem.id === tempId ? confirmedItem : listItem
          )
        );
      }
      
      setPendingOperations(prev => {
        const { [tempId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      // Rollback on error
      setOptimisticList(rollbackRef.current);
      setPendingOperations(prev => {
        const { [tempId]: _, ...rest } = prev;
        return rest;
      });
      throw error;
    }
  }, [optimisticList, mutationConfig]);
  
  // Update item optimistically
  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    // Store rollback state
    rollbackRef.current = optimisticList;
    
    // Apply optimistic update
    const newList = optimisticList.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setOptimisticList(newList);
    setPendingOperations(prev => ({ ...prev, [id]: 'update' }));
    
    try {
      if (mutationConfig?.onUpdate) {
        const confirmedItem = await mutationConfig.onUpdate(id, updates);
        
        // Update with confirmed data
        setList(prev => prev.map(item => 
          item.id === id ? confirmedItem : item
        ));
        setOptimisticList(prev => prev.map(item => 
          item.id === id ? confirmedItem : item
        ));
      }
      
      setPendingOperations(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      // Rollback on error
      setOptimisticList(rollbackRef.current);
      setPendingOperations(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      throw error;
    }
  }, [optimisticList, mutationConfig]);
  
  // Delete item optimistically
  const deleteItem = useCallback(async (id: string) => {
    // Store rollback state
    rollbackRef.current = optimisticList;
    
    // Apply optimistic update
    const newList = optimisticList.filter(item => item.id !== id);
    setOptimisticList(newList);
    setPendingOperations(prev => ({ ...prev, [id]: 'delete' }));
    
    try {
      if (mutationConfig?.onDelete) {
        await mutationConfig.onDelete(id);
        
        // Confirm deletion
        setList(prev => prev.filter(item => item.id !== id));
      }
      
      setPendingOperations(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      // Rollback on error
      setOptimisticList(rollbackRef.current);
      setPendingOperations(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      throw error;
    }
  }, [optimisticList, mutationConfig]);
  
  // Reorder items optimistically
  const reorderItems = useCallback(async (fromIndex: number, toIndex: number) => {
    // Store rollback state
    rollbackRef.current = optimisticList;
    
    // Apply optimistic reorder
    const newList = [...optimisticList];
    const [movedItem] = newList.splice(fromIndex, 1);
    newList.splice(toIndex, 0, movedItem);
    
    setOptimisticList(newList);
    const operationId = `reorder-${Date.now()}`;
    setPendingOperations(prev => ({ ...prev, [operationId]: 'reorder' }));
    
    try {
      if (mutationConfig?.onReorder) {
        const confirmedList = await mutationConfig.onReorder(fromIndex, toIndex);
        
        // Update with confirmed order
        setList(confirmedList);
        setOptimisticList(confirmedList);
      }
      
      setPendingOperations(prev => {
        const { [operationId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      // Rollback on error
      setOptimisticList(rollbackRef.current);
      setPendingOperations(prev => {
        const { [operationId]: _, ...rest } = prev;
        return rest;
      });
      throw error;
    }
  }, [optimisticList, mutationConfig]);
  
  // Rollback all pending operations
  const rollbackAll = useCallback(() => {
    setOptimisticList(rollbackRef.current);
    setPendingOperations({});
  }, []);
  
  return {
    // Current list (optimistic)
    list: optimisticList,
    // Confirmed list
    confirmedList: list,
    // Operations
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    rollbackAll,
    // State
    pendingOperations,
    hasPendingOperations: Object.keys(pendingOperations).length > 0,
  };
}