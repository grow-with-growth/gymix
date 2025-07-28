// Conflict resolution utilities for optimistic updates

export interface ConflictData<T = any> {
  clientVersion: T;
  serverVersion: T;
  baseVersion?: T;
  timestamp: number;
  conflictType: 'data' | 'version' | 'concurrent';
}

export interface ConflictResolutionStrategy<T = any> {
  type: 'client-wins' | 'server-wins' | 'merge' | 'prompt-user' | 'custom';
  resolver?: (conflict: ConflictData<T>) => Promise<T> | T;
  mergeStrategy?: MergeStrategy<T>;
}

export interface MergeStrategy<T = any> {
  type: 'deep-merge' | 'field-level' | 'timestamp-based' | 'custom';
  customMerger?: (client: T, server: T, base?: T) => T;
  fieldPriority?: Record<string, 'client' | 'server' | 'latest'>;
}

// Deep merge utility
function deepMerge<T extends Record<string, any>>(
  target: T,
  source: T,
  options: { arrayMergeStrategy?: 'replace' | 'concat' | 'unique' } = {}
): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const targetValue = target[key];
      const sourceValue = source[key];
      
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        switch (options.arrayMergeStrategy) {
          case 'concat':
            result[key] = [...targetValue, ...sourceValue] as any;
            break;
          case 'unique':
            result[key] = [...new Set([...targetValue, ...sourceValue])] as any;
            break;
          case 'replace':
          default:
            result[key] = sourceValue;
            break;
        }
      } else if (
        typeof targetValue === 'object' &&
        targetValue !== null &&
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(targetValue) &&
        !Array.isArray(sourceValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue, options);
      } else {
        result[key] = sourceValue;
      }
    }
  }
  
  return result;
}

// Field-level merge based on timestamps or priority
function fieldLevelMerge<T extends Record<string, any>>(
  client: T,
  server: T,
  strategy: MergeStrategy<T>
): T {
  const result = { ...client };
  
  for (const key in server) {
    if (server.hasOwnProperty(key)) {
      const priority = strategy.fieldPriority?.[key] || 'server';
      
      switch (priority) {
        case 'client':
          // Keep client value
          break;
        case 'server':
          result[key] = server[key];
          break;
        case 'latest':
          // This would require timestamp metadata on fields
          // For now, default to server
          result[key] = server[key];
          break;
      }
    }
  }
  
  return result;
}

// Main conflict resolution function
export async function resolveConflict<T>(
  conflict: ConflictData<T>,
  strategy: ConflictResolutionStrategy<T>
): Promise<T> {
  switch (strategy.type) {
    case 'client-wins':
      return conflict.clientVersion;
      
    case 'server-wins':
      return conflict.serverVersion;
      
    case 'merge':
      if (!strategy.mergeStrategy) {
        throw new Error('Merge strategy required for merge resolution');
      }
      return performMerge(conflict, strategy.mergeStrategy);
      
    case 'prompt-user':
      // This would typically show a UI for user decision
      // For now, we'll throw an error to indicate user intervention needed
      throw new ConflictRequiresUserInterventionError(conflict);
      
    case 'custom':
      if (!strategy.resolver) {
        throw new Error('Custom resolver required for custom resolution');
      }
      return await strategy.resolver(conflict);
      
    default:
      throw new Error(`Unknown conflict resolution strategy: ${strategy.type}`);
  }
}

// Perform merge based on merge strategy
function performMerge<T>(
  conflict: ConflictData<T>,
  mergeStrategy: MergeStrategy<T>
): T {
  const { clientVersion, serverVersion, baseVersion } = conflict;
  
  switch (mergeStrategy.type) {
    case 'deep-merge':
      if (typeof clientVersion === 'object' && typeof serverVersion === 'object') {
        return deepMerge(
          clientVersion as Record<string, any>,
          serverVersion as Record<string, any>
        ) as T;
      }
      return serverVersion; // Fallback to server version
      
    case 'field-level':
      if (typeof clientVersion === 'object' && typeof serverVersion === 'object') {
        return fieldLevelMerge(
          clientVersion as Record<string, any>,
          serverVersion as Record<string, any>,
          mergeStrategy
        ) as T;
      }
      return serverVersion; // Fallback to server version
      
    case 'timestamp-based':
      // This would require timestamp metadata
      // For now, default to server version
      return serverVersion;
      
    case 'custom':
      if (!mergeStrategy.customMerger) {
        throw new Error('Custom merger required for custom merge strategy');
      }
      return mergeStrategy.customMerger(clientVersion, serverVersion, baseVersion);
      
    default:
      throw new Error(`Unknown merge strategy: ${mergeStrategy.type}`);
  }
}

// Custom error for user intervention
export class ConflictRequiresUserInterventionError<T = any> extends Error {
  constructor(public conflict: ConflictData<T>) {
    super('Conflict requires user intervention');
    this.name = 'ConflictRequiresUserInterventionError';
  }
}

// Utility to detect conflicts
export function detectConflict<T>(
  clientVersion: T,
  serverVersion: T,
  baseVersion?: T
): ConflictData<T> | null {
  // Simple conflict detection - in a real app, this would be more sophisticated
  const hasConflict = JSON.stringify(clientVersion) !== JSON.stringify(serverVersion);
  
  if (!hasConflict) {
    return null;
  }
  
  return {
    clientVersion,
    serverVersion,
    baseVersion,
    timestamp: Date.now(),
    conflictType: 'data', // Could be more sophisticated
  };
}

// Predefined conflict resolution strategies
export const conflictStrategies = {
  clientWins: (): ConflictResolutionStrategy => ({
    type: 'client-wins',
  }),
  
  serverWins: (): ConflictResolutionStrategy => ({
    type: 'server-wins',
  }),
  
  deepMerge: (options?: { arrayMergeStrategy?: 'replace' | 'concat' | 'unique' }): ConflictResolutionStrategy => ({
    type: 'merge',
    mergeStrategy: {
      type: 'deep-merge',
      customMerger: (client, server) => deepMerge(client as any, server as any, options),
    },
  }),
  
  fieldPriority: (fieldPriority: Record<string, 'client' | 'server' | 'latest'>): ConflictResolutionStrategy => ({
    type: 'merge',
    mergeStrategy: {
      type: 'field-level',
      fieldPriority,
    },
  }),
  
  promptUser: (): ConflictResolutionStrategy => ({
    type: 'prompt-user',
  }),
  
  custom: <T>(resolver: (conflict: ConflictData<T>) => Promise<T> | T): ConflictResolutionStrategy<T> => ({
    type: 'custom',
    resolver,
  }),
};

// Hook for conflict resolution in React components
export function useConflictResolution<T>() {
  const resolveConflictWithStrategy = async (
    conflict: ConflictData<T>,
    strategy: ConflictResolutionStrategy<T>
  ): Promise<T> => {
    try {
      return await resolveConflict(conflict, strategy);
    } catch (error) {
      if (error instanceof ConflictRequiresUserInterventionError) {
        // In a real app, this would open a modal or navigate to a conflict resolution page
        console.log('User intervention required for conflict resolution');
        throw error;
      }
      throw error;
    }
  };
  
  return {
    resolveConflict: resolveConflictWithStrategy,
    detectConflict,
    strategies: conflictStrategies,
  };
}