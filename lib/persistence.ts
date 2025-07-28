import { StateStorage } from 'zustand/middleware';

// State versioning interface
export interface VersionedState {
  version: number;
  data: any;
  timestamp: number;
}

// Persistence configuration
export interface PersistenceConfig {
  name: string;
  version: number;
  migrate?: (persistedState: any, version: number) => any;
  partialize?: (state: any) => any;
  storage?: StateStorage;
}

// Custom storage implementation with versioning
export class VersionedStorage implements StateStorage {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  getItem(name: string): string | null {
    try {
      const item = this.storage.getItem(name);
      if (!item) return null;

      const parsed = JSON.parse(item) as VersionedState;
      return JSON.stringify(parsed.data);
    } catch (error) {
      console.warn(`Failed to parse persisted state for ${name}:`, error);
      return null;
    }
  }

  setItem(name: string, value: string): void {
    try {
      const versionedState: VersionedState = {
        version: 1, // Default version, will be overridden by store config
        data: JSON.parse(value),
        timestamp: Date.now(),
      };

      this.storage.setItem(name, JSON.stringify(versionedState));
    } catch (error) {
      console.error(`Failed to persist state for ${name}:`, error);
    }
  }

  removeItem(name: string): void {
    this.storage.removeItem(name);
  }
}

// Enhanced persistence middleware factory
export function createVersionedPersist<T>(config: PersistenceConfig) {
  const storage = new VersionedStorage(config.storage?.getItem ? config.storage as Storage : localStorage);

  return {
    name: config.name,
    storage: {
      getItem: (name: string): string | null => {
        try {
          const item = localStorage.getItem(name);
          if (!item) return null;

          const parsed = JSON.parse(item) as VersionedState;
          
          // Check if migration is needed
          if (parsed.version !== config.version && config.migrate) {
            console.log(`Migrating ${name} from version ${parsed.version} to ${config.version}`);
            const migratedData = config.migrate(parsed.data, parsed.version);
            
            // Save migrated data
            const newVersionedState: VersionedState = {
              version: config.version,
              data: migratedData,
              timestamp: Date.now(),
            };
            
            localStorage.setItem(name, JSON.stringify(newVersionedState));
            return JSON.stringify(migratedData);
          }

          return JSON.stringify(parsed.data);
        } catch (error) {
          console.warn(`Failed to parse persisted state for ${name}:`, error);
          return null;
        }
      },
      
      setItem: (name: string, value: string): void => {
        try {
          let parsedData;
          try {
            parsedData = JSON.parse(value);
          } catch {
            // If value is not valid JSON, treat it as a string
            parsedData = value;
          }

          const versionedState: VersionedState = {
            version: config.version,
            data: parsedData,
            timestamp: Date.now(),
          };

          localStorage.setItem(name, JSON.stringify(versionedState));
        } catch (error) {
          console.error(`Failed to persist state for ${name}:`, error);
        }
      },
      
      removeItem: (name: string): void => {
        localStorage.removeItem(name);
      },
    },
    partialize: config.partialize,
  };
}

// Utility functions for state management
export const persistenceUtils = {
  // Clear all persisted state
  clearAllPersistedState: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('-storage')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get persisted state info
  getPersistedStateInfo: (name: string): VersionedState | null => {
    try {
      const item = localStorage.getItem(name);
      if (!item) return null;
      return JSON.parse(item) as VersionedState;
    } catch (error) {
      console.warn(`Failed to get state info for ${name}:`, error);
      return null;
    }
  },

  // Check if state needs migration
  needsMigration: (name: string, currentVersion: number): boolean => {
    const stateInfo = persistenceUtils.getPersistedStateInfo(name);
    return stateInfo ? stateInfo.version !== currentVersion : false;
  },

  // Get all persisted store names
  getPersistedStoreNames: (): string[] => {
    const keys = Object.keys(localStorage);
    return keys.filter(key => key.includes('-storage'));
  },

  // Export persisted state for backup
  exportPersistedState: (): Record<string, VersionedState> => {
    const result: Record<string, VersionedState> = {};
    const storeNames = persistenceUtils.getPersistedStoreNames();
    
    storeNames.forEach(name => {
      const stateInfo = persistenceUtils.getPersistedStateInfo(name);
      if (stateInfo) {
        result[name] = stateInfo;
      }
    });
    
    return result;
  },

  // Import persisted state from backup
  importPersistedState: (backup: Record<string, VersionedState>): void => {
    Object.entries(backup).forEach(([name, state]) => {
      localStorage.setItem(name, JSON.stringify(state));
    });
  },
};