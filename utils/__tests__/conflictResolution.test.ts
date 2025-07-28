import {
  resolveConflict,
  detectConflict,
  conflictStrategies,
  ConflictRequiresUserInterventionError,
} from '../conflictResolution';

describe('conflictResolution', () => {
  const mockConflict = {
    clientVersion: { name: 'Client Name', age: 25, city: 'Client City' },
    serverVersion: { name: 'Server Name', age: 30, city: 'Server City' },
    baseVersion: { name: 'Base Name', age: 20, city: 'Base City' },
    timestamp: Date.now(),
    conflictType: 'data' as const,
  };

  describe('resolveConflict', () => {
    it('should resolve with client-wins strategy', async () => {
      const result = await resolveConflict(mockConflict, conflictStrategies.clientWins());
      expect(result).toEqual(mockConflict.clientVersion);
    });

    it('should resolve with server-wins strategy', async () => {
      const result = await resolveConflict(mockConflict, conflictStrategies.serverWins());
      expect(result).toEqual(mockConflict.serverVersion);
    });

    it('should resolve with deep-merge strategy', async () => {
      const conflict = {
        ...mockConflict,
        clientVersion: { name: 'Client Name', age: 25, preferences: { theme: 'dark' } },
        serverVersion: { name: 'Server Name', email: 'server@example.com', preferences: { notifications: true } },
      };

      const result = await resolveConflict(conflict, conflictStrategies.deepMerge());
      
      expect(result).toEqual({
        name: 'Server Name', // Server wins for conflicting fields
        age: 25, // Client-only field preserved
        email: 'server@example.com', // Server-only field preserved
        preferences: {
          theme: 'dark', // Client-only preference preserved
          notifications: true, // Server-only preference preserved
        },
      });
    });

    it('should resolve with field priority strategy', async () => {
      const fieldPriority = {
        name: 'client' as const,
        age: 'server' as const,
        city: 'client' as const,
      };

      const result = await resolveConflict(
        mockConflict,
        conflictStrategies.fieldPriority(fieldPriority)
      );

      expect(result).toEqual({
        name: 'Client Name', // Client priority
        age: 30, // Server priority
        city: 'Client City', // Client priority
      });
    });

    it('should throw error for prompt-user strategy', async () => {
      await expect(
        resolveConflict(mockConflict, conflictStrategies.promptUser())
      ).rejects.toThrow(ConflictRequiresUserInterventionError);
    });

    it('should resolve with custom strategy', async () => {
      const customResolver = jest.fn().mockResolvedValue({ custom: 'result' });
      const strategy = conflictStrategies.custom(customResolver);

      const result = await resolveConflict(mockConflict, strategy);

      expect(customResolver).toHaveBeenCalledWith(mockConflict);
      expect(result).toEqual({ custom: 'result' });
    });

    it('should handle async custom resolver', async () => {
      const customResolver = jest.fn().mockImplementation(async (conflict) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { resolved: conflict.clientVersion.name };
      });

      const strategy = conflictStrategies.custom(customResolver);
      const result = await resolveConflict(mockConflict, strategy);

      expect(result).toEqual({ resolved: 'Client Name' });
    });

    it('should throw error for unknown strategy type', async () => {
      const invalidStrategy = { type: 'unknown' as any };
      
      await expect(
        resolveConflict(mockConflict, invalidStrategy)
      ).rejects.toThrow('Unknown conflict resolution strategy: unknown');
    });

    it('should throw error for merge strategy without merge config', async () => {
      const invalidStrategy = { type: 'merge' as const };
      
      await expect(
        resolveConflict(mockConflict, invalidStrategy)
      ).rejects.toThrow('Merge strategy required for merge resolution');
    });

    it('should throw error for custom strategy without resolver', async () => {
      const invalidStrategy = { type: 'custom' as const };
      
      await expect(
        resolveConflict(mockConflict, invalidStrategy)
      ).rejects.toThrow('Custom resolver required for custom resolution');
    });
  });

  describe('detectConflict', () => {
    it('should detect conflict when versions differ', () => {
      const clientVersion = { name: 'Client', age: 25 };
      const serverVersion = { name: 'Server', age: 30 };

      const conflict = detectConflict(clientVersion, serverVersion);

      expect(conflict).not.toBeNull();
      expect(conflict!.clientVersion).toEqual(clientVersion);
      expect(conflict!.serverVersion).toEqual(serverVersion);
      expect(conflict!.conflictType).toBe('data');
      expect(typeof conflict!.timestamp).toBe('number');
    });

    it('should return null when versions are identical', () => {
      const version = { name: 'Same', age: 25 };

      const conflict = detectConflict(version, version);

      expect(conflict).toBeNull();
    });

    it('should include base version when provided', () => {
      const clientVersion = { name: 'Client', age: 25 };
      const serverVersion = { name: 'Server', age: 30 };
      const baseVersion = { name: 'Base', age: 20 };

      const conflict = detectConflict(clientVersion, serverVersion, baseVersion);

      expect(conflict).not.toBeNull();
      expect(conflict!.baseVersion).toEqual(baseVersion);
    });
  });

  describe('deep merge functionality', () => {
    it('should handle nested objects', async () => {
      const conflict = {
        ...mockConflict,
        clientVersion: {
          user: { name: 'Client', preferences: { theme: 'dark', lang: 'en' } },
          settings: { notifications: true },
        },
        serverVersion: {
          user: { name: 'Server', preferences: { theme: 'light', timezone: 'UTC' } },
          settings: { autoSave: false },
        },
      };

      const result = await resolveConflict(conflict, conflictStrategies.deepMerge());

      expect(result).toEqual({
        user: {
          name: 'Server', // Server wins for conflicts
          preferences: {
            theme: 'light', // Server wins for conflicts
            lang: 'en', // Client-only preserved
            timezone: 'UTC', // Server-only preserved
          },
        },
        settings: {
          notifications: true, // Client-only preserved
          autoSave: false, // Server-only preserved
        },
      });
    });

    it('should handle arrays with different merge strategies', async () => {
      const conflict = {
        ...mockConflict,
        clientVersion: { tags: ['client1', 'client2'], items: [1, 2] },
        serverVersion: { tags: ['server1', 'server2'], items: [3, 4] },
      };

      // Default behavior (replace)
      const result1 = await resolveConflict(conflict, conflictStrategies.deepMerge());
      expect(result1.tags).toEqual(['server1', 'server2']);
      expect(result1.items).toEqual([3, 4]);

      // Concat arrays
      const concatStrategy = conflictStrategies.deepMerge({ arrayMergeStrategy: 'concat' });
      const result2 = await resolveConflict(conflict, {
        type: 'merge',
        mergeStrategy: {
          type: 'deep-merge',
          customMerger: (client, server) => {
            const merged: any = { ...client };
            for (const key in server) {
              if (Array.isArray(client[key]) && Array.isArray(server[key])) {
                merged[key] = [...client[key], ...server[key]];
              } else {
                merged[key] = server[key];
              }
            }
            return merged;
          },
        },
      });
      expect(result2.tags).toEqual(['client1', 'client2', 'server1', 'server2']);
      expect(result2.items).toEqual([1, 2, 3, 4]);
    });
  });

  describe('ConflictRequiresUserInterventionError', () => {
    it('should contain conflict data', () => {
      const error = new ConflictRequiresUserInterventionError(mockConflict);
      
      expect(error.name).toBe('ConflictRequiresUserInterventionError');
      expect(error.message).toBe('Conflict requires user intervention');
      expect(error.conflict).toEqual(mockConflict);
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined values', async () => {
      const conflict = {
        ...mockConflict,
        clientVersion: { name: null, age: undefined, city: 'Client' },
        serverVersion: { name: 'Server', age: 30, city: null },
      };

      const result = await resolveConflict(conflict, conflictStrategies.deepMerge());
      
      expect(result).toEqual({
        name: 'Server', // Server value wins
        age: 30, // Server value wins
        city: null, // Server value wins
      });
    });

    it('should handle primitive values', async () => {
      const conflict = {
        ...mockConflict,
        clientVersion: 'client-string',
        serverVersion: 'server-string',
      };

      const result = await resolveConflict(conflict, conflictStrategies.deepMerge());
      expect(result).toBe('server-string'); // Fallback to server for non-objects
    });

    it('should handle empty objects', async () => {
      const conflict = {
        ...mockConflict,
        clientVersion: {},
        serverVersion: { name: 'Server' },
      };

      const result = await resolveConflict(conflict, conflictStrategies.deepMerge());
      expect(result).toEqual({ name: 'Server' });
    });
  });
});