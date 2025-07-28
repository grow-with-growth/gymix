# Optimistic Mutation Utilities

This document provides a comprehensive guide to using the optimistic mutation utilities in the application. These utilities provide a responsive user experience by immediately updating the UI while the actual server request is processed in the background.

## Overview

The optimistic mutation system consists of several key components:

1. **Core Hooks**: `useOptimisticMutation`, `useOptimisticMutationUtilities`, `useOptimisticMutationIntegrated`
2. **Global Manager**: `OptimisticUpdateManager` for centralized tracking
3. **UI Components**: Feedback components for user notifications
4. **State Management**: Integration with application store for notifications

## Key Features

- ✅ **Optimistic Updates**: Immediate UI updates before server confirmation
- ✅ **Error Handling**: Automatic rollback on failures with retry mechanisms
- ✅ **Conflict Resolution**: Handle conflicts between client and server data
- ✅ **UI Feedback**: Visual indicators for pending, successful, and failed updates
- ✅ **Batch Processing**: Group multiple updates for efficiency
- ✅ **State Snapshots**: Preserve state for reliable rollbacks
- ✅ **Global Tracking**: Centralized monitoring of all optimistic updates

## Basic Usage

### 1. Simple Optimistic Mutation

```typescript
import { useOptimisticMutation } from '../hooks/useOptimisticMutation';

function TodoComponent() {
  const [todos, setTodos] = useState([]);
  
  const createTodoMutation = useOptimisticMutation({
    mutationFn: async (newTodo) => {
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
      });
      return response.json();
    },
    onOptimisticUpdate: (newTodo) => {
      const optimisticTodo = { ...newTodo, id: `temp-${Date.now()}` };
      setTodos(prev => [optimisticTodo, ...prev]);
      return optimisticTodo;
    },
    onSuccess: (serverTodo, variables, optimisticTodo) => {
      setTodos(prev => prev.map(todo => 
        todo.id === optimisticTodo.id ? serverTodo : todo
      ));
    },
    onError: (error, variables, optimisticTodo) => {
      setTodos(prev => prev.filter(todo => todo.id !== optimisticTodo.id));
    },
    enableRollback: true,
    maxRetries: 3,
  });

  const handleCreateTodo = async (title) => {
    try {
      await createTodoMutation.mutate({ title, completed: false });
    } catch (error) {
      // Error handling is done by the hook
    }
  };

  return (
    <div>
      {/* Your UI here */}
      <button onClick={() => handleCreateTodo('New Todo')}>
        Add Todo
      </button>
      
      {/* Show pending updates */}
      {createTodoMutation.pendingUpdates.length > 0 && (
        <div>Pending updates: {createTodoMutation.pendingUpdates.length}</div>
      )}
    </div>
  );
}
```

### 2. Enhanced Optimistic Mutation with Full Features

```typescript
import { useOptimisticMutationIntegrated } from '../hooks/useOptimisticMutationIntegrated';

function AdvancedTodoComponent() {
  const updateTodoMutation = useOptimisticMutationIntegrated({
    mutationFn: async ({ id, updates }) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onOptimisticUpdate: ({ id, updates }, originalData) => {
      const updatedTodo = { ...originalData, ...updates };
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
      return updatedTodo;
    },
    onSuccess: (serverTodo) => {
      setTodos(prev => prev.map(todo => 
        todo.id === serverTodo.id ? serverTodo : todo
      ));
    },
    onConflictResolved: (resolvedData, { client, server }) => {
      console.log('Conflict resolved:', { client, server, resolved: resolvedData });
    },
    
    // Configuration
    updateType: 'update-todo',
    operation: 'update',
    entityType: 'todo',
    enableRollback: true,
    enableConflictDetection: true,
    enableAutoRetry: true,
    maxRetries: 3,
    
    // Conflict resolution
    conflictResolution: {
      strategy: 'merge', // 'client-wins', 'server-wins', 'merge', 'custom'
      customResolver: (clientData, serverData) => {
        // Custom merge logic
        return { ...serverData, ...clientData };
      },
    },
    
    // UI feedback
    userFeedback: {
      showProgress: true,
      showSuccess: true,
      showError: true,
      customMessages: {
        progress: 'Updating todo...',
        success: 'Todo updated successfully!',
        error: 'Failed to update todo. You can retry or rollback.',
      },
    },
  });

  return (
    <div>
      {/* Your component UI */}
      
      {/* Retry failed updates */}
      {updateTodoMutation.pendingUpdates
        .filter(update => update.status === 'failed')
        .map(update => (
          <button 
            key={update.id}
            onClick={() => updateTodoMutation.retry(update.id)}
          >
            Retry {update.type}
          </button>
        ))
      }
      
      {/* Rollback all updates */}
      <button onClick={() => updateTodoMutation.rollbackAll()}>
        Rollback All
      </button>
    </div>
  );
}
```

## UI Feedback Components

### 1. Optimistic Update Feedback

```typescript
import { OptimisticUpdateFeedback } from '../components/ui/OptimisticUpdateFeedback';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      {/* Global optimistic update feedback */}
      <OptimisticUpdateFeedback 
        showDetails={true}
        maxVisible={5}
        className="custom-feedback-styles"
      />
    </div>
  );
}
```

### 2. Status Badge

```typescript
import { OptimisticUpdateStatusBadge } from '../components/ui/OptimisticUpdateFeedback';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <OptimisticUpdateStatusBadge className="ml-4" />
    </header>
  );
}
```

## Global Update Management

### Using the Global Manager

```typescript
import { useOptimisticUpdateManager } from '../lib/optimisticUpdateManager';

function AdminPanel() {
  const manager = useOptimisticUpdateManager();
  
  const stats = manager.getStats();
  const pendingUpdates = manager.getPendingUpdates();
  const failedUpdates = manager.getFailedUpdates();
  
  return (
    <div>
      <h2>System Status</h2>
      <p>Total Updates: {stats.total}</p>
      <p>Pending: {stats.pending}</p>
      <p>Failed: {stats.failed}</p>
      <p>Success Rate: {(stats.successRate * 100).toFixed(1)}%</p>
      
      <button onClick={() => manager.rollbackAll()}>
        Rollback All Updates
      </button>
      
      <button onClick={() => manager.clear()}>
        Clear All Updates
      </button>
    </div>
  );
}
```

## Configuration Options

### Mutation Configuration

```typescript
interface OptimisticMutationConfig {
  // Core function
  mutationFn: (variables: TVariables) => Promise<TData>;
  
  // Lifecycle callbacks
  onOptimisticUpdate?: (variables: TVariables, originalData?: TData) => TData;
  onSuccess?: (data: TData, variables: TVariables, optimisticData?: TData) => void;
  onError?: (error: Error, variables: TVariables, optimisticData?: TData) => void;
  onRollback?: (rollbackData: TData, variables: TVariables) => void;
  onConflictResolved?: (resolvedData: TData, conflictData: { client: TData; server: TData }) => void;
  
  // Retry configuration
  maxRetries?: number; // Default: 3
  retryDelay?: number; // Default: 1000ms
  enableAutoRetry?: boolean; // Default: false
  
  // Rollback configuration
  enableRollback?: boolean; // Default: true
  enableStateSnapshot?: boolean; // Default: false
  
  // Conflict resolution
  enableConflictDetection?: boolean; // Default: false
  conflictResolution?: {
    strategy: 'client-wins' | 'server-wins' | 'merge' | 'prompt-user' | 'custom';
    customResolver?: (clientData: TData, serverData: TData) => TData;
    onConflictDetected?: (clientData: TData, serverData: TData) => void;
  };
  
  // UI feedback
  userFeedback?: {
    showProgress?: boolean; // Default: true
    showSuccess?: boolean; // Default: true
    showError?: boolean; // Default: true
    showRollback?: boolean; // Default: true
    customMessages?: {
      progress?: string;
      success?: string;
      error?: string;
      rollback?: string;
    };
  };
  
  // Tracking metadata
  updateType?: string; // For categorization
  operation?: 'create' | 'update' | 'delete' | 'custom';
  entityType?: string; // e.g., 'todo', 'user', 'post'
  entityId?: string; // Specific entity identifier
  
  // Advanced features
  enableBatching?: boolean; // Default: false
  batchDelay?: number; // Default: 100ms
  enablePersistence?: boolean; // Default: false
}
```

## Best Practices

### 1. Error Handling

```typescript
const mutation = useOptimisticMutation({
  mutationFn: async (data) => {
    // Always handle network errors
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to create item: ${error.message}`);
    }
  },
  onError: (error, variables, optimisticData) => {
    // Log error for debugging
    console.error('Mutation failed:', { error, variables, optimisticData });
    
    // Revert optimistic changes
    if (optimisticData) {
      // Revert your local state here
    }
  },
});
```

### 2. Conflict Resolution

```typescript
const mutation = useOptimisticMutationIntegrated({
  mutationFn: updateUser,
  enableConflictDetection: true,
  conflictResolution: {
    strategy: 'custom',
    customResolver: (clientData, serverData) => {
      // Merge strategy: server wins for system fields, client wins for user fields
      return {
        ...serverData, // Server data as base
        name: clientData.name, // User input takes precedence
        email: clientData.email,
        preferences: {
          ...serverData.preferences,
          ...clientData.preferences, // Merge preferences
        },
      };
    },
    onConflictDetected: (clientData, serverData) => {
      console.warn('Data conflict detected:', { clientData, serverData });
    },
  },
});
```

### 3. Performance Optimization

```typescript
// Use batching for multiple rapid updates
const mutation = useOptimisticMutationIntegrated({
  mutationFn: batchUpdateItems,
  enableBatching: true,
  batchDelay: 200, // Wait 200ms to collect more updates
  
  // Use state snapshots for complex rollbacks
  enableStateSnapshot: true,
  
  // Limit retries for non-critical updates
  maxRetries: 1,
  enableAutoRetry: false,
});
```

### 4. Testing

```typescript
// Mock the mutation hook in tests
jest.mock('../hooks/useOptimisticMutation', () => ({
  useOptimisticMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    pendingUpdates: [],
    rollback: jest.fn(),
    retry: jest.fn(),
  })),
}));

// Test optimistic updates
test('should show optimistic update immediately', async () => {
  const mockMutate = jest.fn().mockResolvedValue({ id: '1', title: 'New Todo' });
  
  render(<TodoComponent />);
  
  fireEvent.click(screen.getByText('Add Todo'));
  
  // Should show optimistic update immediately
  expect(screen.getByText('New Todo (creating...)')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('New Todo')).toBeInTheDocument();
    expect(screen.queryByText('(creating...)')).not.toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Updates not rolling back**: Ensure `enableRollback: true` and implement `onRollback` callback
2. **Conflicts not detected**: Enable `enableConflictDetection: true` and provide conflict resolution strategy
3. **Memory leaks**: The global manager automatically cleans up old updates, but you can call `manager.cleanup()` manually
4. **Performance issues**: Use batching for rapid updates and limit the number of concurrent optimistic updates

### Debugging

```typescript
// Enable debug logging
const mutation = useOptimisticMutationIntegrated({
  // ... your config
  onSuccess: (data, variables, optimisticData) => {
    console.log('Mutation succeeded:', { data, variables, optimisticData });
  },
  onError: (error, variables, optimisticData) => {
    console.error('Mutation failed:', { error, variables, optimisticData });
  },
  onConflictResolved: (resolvedData, conflictData) => {
    console.log('Conflict resolved:', { resolvedData, conflictData });
  },
});

// Monitor global state
const manager = useOptimisticUpdateManager();
useEffect(() => {
  const unsubscribe = manager.addEventListener((event) => {
    console.log('Optimistic update event:', event);
  });
  return unsubscribe;
}, []);
```

## Migration Guide

If you're migrating from a simpler optimistic update implementation:

1. Replace direct state mutations with `useOptimisticMutation`
2. Add error handling and rollback logic
3. Implement UI feedback components
4. Consider enabling conflict detection for critical data
5. Add retry mechanisms for failed updates

This comprehensive system provides a robust foundation for optimistic UI updates while maintaining data consistency and providing excellent user experience.