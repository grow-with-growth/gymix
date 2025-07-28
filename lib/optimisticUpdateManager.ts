import { nanoid } from 'nanoid';

// Enhanced types for optimistic update tracking
export interface OptimisticUpdateEntry<TData = any> {
  id: string;
  type: string;
  operation: 'create' | 'update' | 'delete' | 'custom';
  data: TData;
  originalData?: TData;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed' | 'rolled_back' | 'retrying';
  retryCount: number;
  maxRetries: number;
  error?: Error;
  conflictData?: TData;
  metadata?: Record<string, any>;
  
  // Tracking information
  entityId?: string;
  entityType?: string;
  userId?: string;
  sessionId?: string;
  
  // UI feedback configuration
  userFeedback?: {
    showProgress: boolean;
    showSuccess: boolean;
    showError: boolean;
    showRollback: boolean;
    customMessages?: {
      progress?: string;
      success?: string;
      error?: string;
      rollback?: string;
    };
  };
}

export interface OptimisticUpdateStats {
  total: number;
  pending: number;
  confirmed: number;
  failed: number;
  rolledBack: number;
  retrying: number;
  byType: Record<string, number>;
  byOperation: Record<string, number>;
  averageLatency: number;
  successRate: number;
}

export interface OptimisticUpdateFilter {
  status?: OptimisticUpdateEntry['status'][];
  type?: string[];
  operation?: OptimisticUpdateEntry['operation'][];
  entityType?: string[];
  userId?: string;
  timeRange?: {
    start: number;
    end: number;
  };
}

// Event types for the manager
export type OptimisticUpdateEvent = 
  | { type: 'update_added'; update: OptimisticUpdateEntry }
  | { type: 'update_changed'; update: OptimisticUpdateEntry; previousStatus: string }
  | { type: 'update_removed'; updateId: string }
  | { type: 'batch_processed'; updates: OptimisticUpdateEntry[] }
  | { type: 'conflict_detected'; update: OptimisticUpdateEntry; conflictData: any }
  | { type: 'rollback_initiated'; updateIds: string[] };

export type OptimisticUpdateEventListener = (event: OptimisticUpdateEvent) => void;

// Centralized optimistic update manager
export class OptimisticUpdateManager {
  private updates: Map<string, OptimisticUpdateEntry> = new Map();
  private listeners: Set<OptimisticUpdateEventListener> = new Set();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = nanoid();
    this.startCleanupInterval();
  }

  // Event management
  addEventListener(listener: OptimisticUpdateEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: OptimisticUpdateEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in optimistic update event listener:', error);
      }
    });
  }

  // Core update management
  addUpdate<TData = any>(update: Omit<OptimisticUpdateEntry<TData>, 'id' | 'timestamp' | 'sessionId'>): string {
    const id = nanoid();
    const fullUpdate: OptimisticUpdateEntry<TData> = {
      ...update,
      id,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      retryCount: update.retryCount || 0,
      maxRetries: update.maxRetries || 3,
    };

    this.updates.set(id, fullUpdate);
    this.emit({ type: 'update_added', update: fullUpdate });
    
    return id;
  }

  updateUpdate(id: string, changes: Partial<OptimisticUpdateEntry>): boolean {
    const existing = this.updates.get(id);
    if (!existing) return false;

    const previousStatus = existing.status;
    const updated = { ...existing, ...changes };
    this.updates.set(id, updated);
    
    this.emit({ 
      type: 'update_changed', 
      update: updated, 
      previousStatus 
    });
    
    return true;
  }

  removeUpdate(id: string): boolean {
    const removed = this.updates.delete(id);
    if (removed) {
      this.emit({ type: 'update_removed', updateId: id });
    }
    return removed;
  }

  getUpdate(id: string): OptimisticUpdateEntry | undefined {
    return this.updates.get(id);
  }

  // Query methods
  getAllUpdates(): OptimisticUpdateEntry[] {
    return Array.from(this.updates.values());
  }

  getUpdates(filter?: OptimisticUpdateFilter): OptimisticUpdateEntry[] {
    let updates = this.getAllUpdates();

    if (!filter) return updates;

    if (filter.status) {
      updates = updates.filter(update => filter.status!.includes(update.status));
    }

    if (filter.type) {
      updates = updates.filter(update => filter.type!.includes(update.type));
    }

    if (filter.operation) {
      updates = updates.filter(update => filter.operation!.includes(update.operation));
    }

    if (filter.entityType) {
      updates = updates.filter(update => 
        update.entityType && filter.entityType!.includes(update.entityType)
      );
    }

    if (filter.userId) {
      updates = updates.filter(update => update.userId === filter.userId);
    }

    if (filter.timeRange) {
      updates = updates.filter(update => 
        update.timestamp >= filter.timeRange!.start && 
        update.timestamp <= filter.timeRange!.end
      );
    }

    return updates;
  }

  getPendingUpdates(): OptimisticUpdateEntry[] {
    return this.getUpdates({ status: ['pending', 'retrying'] });
  }

  getFailedUpdates(): OptimisticUpdateEntry[] {
    return this.getUpdates({ status: ['failed'] });
  }

  getUpdatesByEntity(entityType: string, entityId: string): OptimisticUpdateEntry[] {
    return this.getAllUpdates().filter(update => 
      update.entityType === entityType && update.entityId === entityId
    );
  }

  // Statistics
  getStats(): OptimisticUpdateStats {
    const updates = this.getAllUpdates();
    const total = updates.length;
    
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      failed: 0,
      rolledBack: 0,
      retrying: 0,
    };

    const typeCounts: Record<string, number> = {};
    const operationCounts: Record<string, number> = {};
    let totalLatency = 0;
    let completedUpdates = 0;

    updates.forEach(update => {
      // Status counts
      if (update.status === 'pending') statusCounts.pending++;
      else if (update.status === 'confirmed') statusCounts.confirmed++;
      else if (update.status === 'failed') statusCounts.failed++;
      else if (update.status === 'rolled_back') statusCounts.rolledBack++;
      else if (update.status === 'retrying') statusCounts.retrying++;

      // Type counts
      typeCounts[update.type] = (typeCounts[update.type] || 0) + 1;

      // Operation counts
      operationCounts[update.operation] = (operationCounts[update.operation] || 0) + 1;

      // Latency calculation (for completed updates)
      if (update.status === 'confirmed' || update.status === 'failed') {
        totalLatency += Date.now() - update.timestamp;
        completedUpdates++;
      }
    });

    const averageLatency = completedUpdates > 0 ? totalLatency / completedUpdates : 0;
    const successRate = completedUpdates > 0 ? statusCounts.confirmed / completedUpdates : 0;

    return {
      total,
      pending: statusCounts.pending,
      confirmed: statusCounts.confirmed,
      failed: statusCounts.failed,
      rolledBack: statusCounts.rolledBack,
      retrying: statusCounts.retrying,
      byType: typeCounts,
      byOperation: operationCounts,
      averageLatency,
      successRate,
    };
  }

  // Batch operations
  processBatch(updateIds: string[]): void {
    const updates = updateIds
      .map(id => this.getUpdate(id))
      .filter((update): update is OptimisticUpdateEntry => update !== undefined);
    
    this.emit({ type: 'batch_processed', updates });
  }

  rollbackUpdates(updateIds: string[]): void {
    updateIds.forEach(id => {
      this.updateUpdate(id, { status: 'rolled_back' });
    });
    
    this.emit({ type: 'rollback_initiated', updateIds });
  }

  rollbackAll(): void {
    const rollbackableUpdates = this.getUpdates({ 
      status: ['pending', 'failed', 'retrying'] 
    });
    
    const updateIds = rollbackableUpdates.map(update => update.id);
    this.rollbackUpdates(updateIds);
  }

  // Conflict management
  detectConflict(updateId: string, serverData: any): void {
    const update = this.getUpdate(updateId);
    if (!update) return;

    this.updateUpdate(updateId, { conflictData: serverData });
    this.emit({ 
      type: 'conflict_detected', 
      update: { ...update, conflictData: serverData }, 
      conflictData: serverData 
    });
  }

  // Cleanup and maintenance
  private startCleanupInterval(): void {
    // Clean up old completed updates every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    const toRemove: string[] = [];

    this.updates.forEach((update, id) => {
      // Remove old completed updates
      if (
        (update.status === 'confirmed' || update.status === 'rolled_back') &&
        update.timestamp < cutoff
      ) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => this.removeUpdate(id));
  }

  // Persistence (optional)
  serialize(): string {
    const data = {
      updates: Array.from(this.updates.entries()),
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };
    return JSON.stringify(data);
  }

  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.updates = new Map(parsed.updates);
      this.sessionId = parsed.sessionId || nanoid();
    } catch (error) {
      console.error('Failed to deserialize optimistic updates:', error);
    }
  }

  // Utility methods
  hasConflicts(): boolean {
    return this.getAllUpdates().some(update => update.conflictData !== undefined);
  }

  getConflictedUpdates(): OptimisticUpdateEntry[] {
    return this.getAllUpdates().filter(update => update.conflictData !== undefined);
  }

  clear(): void {
    const updateIds = Array.from(this.updates.keys());
    this.updates.clear();
    updateIds.forEach(id => {
      this.emit({ type: 'update_removed', updateId: id });
    });
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
    this.listeners.clear();
  }
}

// Global instance
export const globalOptimisticUpdateManager = new OptimisticUpdateManager();

// React hook for using the manager
export function useOptimisticUpdateManager() {
  return globalOptimisticUpdateManager;
}

// Utility functions
export const optimisticUpdateUtils = {
  // Create a standardized update entry
  createUpdateEntry: <TData = any>(
    type: string,
    operation: OptimisticUpdateEntry['operation'],
    data: TData,
    options?: Partial<OptimisticUpdateEntry<TData>>
  ): Omit<OptimisticUpdateEntry<TData>, 'id' | 'timestamp' | 'sessionId'> => ({
    type,
    operation,
    data,
    status: 'pending',
    retryCount: 0,
    maxRetries: 3,
    ...options,
  }),

  // Generate entity tracking info
  createEntityInfo: (entityType: string, entityId: string, userId?: string) => ({
    entityType,
    entityId,
    userId,
  }),

  // Create user feedback configuration
  createUserFeedback: (options?: Partial<OptimisticUpdateEntry['userFeedback']>) => ({
    showProgress: true,
    showSuccess: true,
    showError: true,
    showRollback: true,
    ...options,
  }),

  // Calculate retry delay with exponential backoff
  calculateRetryDelay: (retryCount: number, baseDelay: number = 1000, maxDelay: number = 10000): number => {
    return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  },

  // Check if an update is retryable
  isRetryable: (update: OptimisticUpdateEntry): boolean => {
    return update.status === 'failed' && update.retryCount < update.maxRetries;
  },

  // Format update for display
  formatUpdateForDisplay: (update: OptimisticUpdateEntry) => ({
    id: update.id,
    type: update.type,
    operation: update.operation,
    status: update.status,
    timestamp: new Date(update.timestamp).toLocaleString(),
    retryInfo: update.retryCount > 0 ? `${update.retryCount}/${update.maxRetries}` : null,
    error: update.error?.message,
    hasConflict: !!update.conflictData,
  }),
};