import { ConnectionPool, ConnectionPoolConfig } from '../connectionPool';
import { ConnectionFactory } from '../connectionFactory';
import PocketBase from 'pocketbase';

// Mock the connection factory
jest.mock('../connectionFactory');
jest.mock('pocketbase');

describe('ConnectionPool', () => {
  let mockConnectionFactory: jest.Mocked<typeof ConnectionFactory>;
  let mockConnection: any;
  let poolConfig: ConnectionPoolConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock PocketBase
    (PocketBase as any).mockImplementation(() => ({
      health: {
        check: jest.fn().mockResolvedValue({})
      }
    }));

    // Mock connection
    mockConnection = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      isConnectionActive: jest.fn().mockReturnValue(true),
      getInstance: jest.fn().mockReturnValue({})
    };

    // Mock ConnectionFactory
    mockConnectionFactory = ConnectionFactory as jest.Mocked<typeof ConnectionFactory>;
    mockConnectionFactory.create = jest.fn().mockReturnValue(mockConnection);

    poolConfig = {
      minConnections: 2,
      maxConnections: 5,
      acquireTimeout: 5000,
      idleTimeout: 10000,
      connectionConfig: {
        url: 'http://localhost:8090'
      }
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create a connection pool with valid configuration', () => {
      const pool = new ConnectionPool(poolConfig);
      expect(pool).toBeInstanceOf(ConnectionPool);
    });

    it('should throw error for invalid minConnections', () => {
      expect(() => {
        new ConnectionPool({ ...poolConfig, minConnections: -1 });
      }).toThrow('minConnections must be >= 0');
    });

    it('should throw error when maxConnections < minConnections', () => {
      expect(() => {
        new ConnectionPool({ ...poolConfig, minConnections: 5, maxConnections: 3 });
      }).toThrow('maxConnections must be >= minConnections');
    });

    it('should throw error for invalid acquireTimeout', () => {
      expect(() => {
        new ConnectionPool({ ...poolConfig, acquireTimeout: 0 });
      }).toThrow('acquireTimeout must be > 0');
    });

    it('should throw error for invalid idleTimeout', () => {
      expect(() => {
        new ConnectionPool({ ...poolConfig, idleTimeout: -1 });
      }).toThrow('idleTimeout must be > 0');
    });
  });

  describe('acquire and release', () => {
    it('should acquire a connection from the pool', async () => {
      const pool = new ConnectionPool(poolConfig);
      
      // Fast-forward timers to allow initialization
      jest.runAllTimers();
      
      const connection = await pool.acquire();
      expect(connection).toBe(mockConnection);
      expect(mockConnectionFactory.create).toHaveBeenCalled();
    });

    it('should release a connection back to the pool', async () => {
      const pool = new ConnectionPool(poolConfig);
      
      jest.runAllTimers();
      
      const connection = await pool.acquire();
      await pool.release(connection);
      
      // Connection should be available for reuse
      const connection2 = await pool.acquire();
      expect(connection2).toBe(mockConnection);
    });

    it('should reuse idle connections', async () => {
      const pool = new ConnectionPool(poolConfig);
      
      jest.runAllTimers();
      
      const connection1 = await pool.acquire();
      await pool.release(connection1);
      
      const connection2 = await pool.acquire();
      expect(connection2).toBe(connection1);
      
      await pool.destroy();
    });

    it('should create new connections up to maxConnections', async () => {
      const pool = new ConnectionPool({ ...poolConfig, minConnections: 1, maxConnections: 3 });
      
      jest.runAllTimers();
      
      const connections = [];
      for (let i = 0; i < 3; i++) {
        connections.push(await pool.acquire());
      }
      
      expect(mockConnectionFactory.create).toHaveBeenCalledTimes(3);
      
      // Clean up
      for (const conn of connections) {
        await pool.release(conn);
      }
      await pool.destroy();
    });

    it('should queue requests when pool is exhausted', async () => {
      const pool = new ConnectionPool({ ...poolConfig, minConnections: 1, maxConnections: 1 });
      
      jest.runAllTimers();
      
      const connection1 = await pool.acquire();
      
      // This should be queued
      const acquirePromise = pool.acquire();
      
      // Release the first connection
      await pool.release(connection1);
      
      // The queued request should now be fulfilled
      const connection2 = await acquirePromise;
      expect(connection2).toBe(connection1);
      
      await pool.release(connection2);
      await pool.destroy();
    });

    it('should timeout acquire requests', async () => {
      const pool = new ConnectionPool({ 
        ...poolConfig, 
        minConnections: 1, 
        maxConnections: 1, 
        acquireTimeout: 1000 
      });
      
      jest.runAllTimers();
      
      const connection1 = await pool.acquire();
      
      // This should timeout
      const acquirePromise = pool.acquire();
      
      // Fast-forward past the timeout
      jest.advanceTimersByTime(1001);
      
      await expect(acquirePromise).rejects.toThrow('Connection acquire timeout');
      
      await pool.release(connection1);
      await pool.destroy();
    });
  });

  describe('statistics', () => {
    it('should provide accurate pool statistics', async () => {
      const pool = new ConnectionPool(poolConfig);
      
      jest.runAllTimers();
      
      const stats = pool.getStats();
      expect(stats.totalConnections).toBeGreaterThan(0);
      expect(stats.activeConnections).toBe(0);
      expect(stats.idleConnections).toBeGreaterThan(0);
      
      await pool.destroy();
    });

    it('should update statistics when connections are acquired and released', async () => {
      const pool = new ConnectionPool(poolConfig);
      
      jest.runAllTimers();
      
      const connection = await pool.acquire();
      let stats = pool.getStats();
      expect(stats.activeConnections).toBe(1);
      
      await pool.release(connection);
      stats = pool.getStats();
      expect(stats.activeConnections).toBe(0);
      
      await pool.destroy();
    });
  });

  describe('cleanup', () => {
    it('should clean up idle connections after timeout', async () => {
      const pool = new ConnectionPool({ 
        ...poolConfig, 
        minConnections: 1, 
        maxConnections: 3,
        idleTimeout: 5000 
      });
      
      jest.runAllTimers();
      
      // Acquire and release multiple connections
      const connections = [];
      for (let i = 0; i < 3; i++) {
        connections.push(await pool.acquire());
      }
      
      for (const conn of connections) {
        await pool.release(conn);
      }
      
      let stats = pool.getStats();
      expect(stats.totalConnections).toBe(3);
      
      // Fast-forward past idle timeout
      jest.advanceTimersByTime(6000);
      
      stats = pool.getStats();
      // Should have cleaned up excess connections, keeping only minConnections
      expect(stats.totalConnections).toBe(poolConfig.minConnections);
      
      await pool.destroy();
    });
  });

  describe('destroy', () => {
    it('should destroy all connections and reject pending requests', async () => {
      const pool = new ConnectionPool(poolConfig);
      
      jest.runAllTimers();
      
      const connection = await pool.acquire();
      const pendingAcquire = pool.acquire();
      
      await pool.destroy();
      
      await expect(pendingAcquire).rejects.toThrow('Connection pool destroyed');
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(mockConnection.destroy).toHaveBeenCalled();
    });

    it('should handle destroy being called multiple times', async () => {
      const pool = new ConnectionPool(poolConfig);
      
      jest.runAllTimers();
      
      await pool.destroy();
      await pool.destroy(); // Should not throw
    });
  });
});