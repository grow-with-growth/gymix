import { ConnectionFactory, PocketBaseConnection } from '../connectionFactory';
import PocketBase from 'pocketbase';

// Mock PocketBase
jest.mock('pocketbase', () => {
  return jest.fn().mockImplementation((url: string) => ({
    health: {
      check: jest.fn()
    },
    beforeSend: null
  }));
});

describe('ConnectionFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('should create a PocketBase connection with provided config', () => {
      const config = {
        url: 'http://localhost:8090',
        timeout: 3000,
        retryAttempts: 2
      };

      const connection = ConnectionFactory.create(config);
      expect(connection).toBeInstanceOf(PocketBaseConnection);
    });

    it('should use default values for missing config options', () => {
      const config = {
        url: 'http://localhost:8090'
      };

      const connection = ConnectionFactory.create(config);
      expect(connection).toBeInstanceOf(PocketBaseConnection);
    });
  });

  describe('createFromEnv', () => {
    it('should create connection from environment variables', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        POCKETBASE_URL: 'http://test:8090',
        POCKETBASE_TIMEOUT: '10000',
        POCKETBASE_RETRY_ATTEMPTS: '5'
      };

      const connection = ConnectionFactory.createFromEnv();
      expect(connection).toBeInstanceOf(PocketBaseConnection);

      process.env = originalEnv;
    });

    it('should use default values when environment variables are not set', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.POCKETBASE_URL;

      const connection = ConnectionFactory.createFromEnv();
      expect(connection).toBeInstanceOf(PocketBaseConnection);

      process.env = originalEnv;
    });
  });

  describe('setDefaults', () => {
    it('should update default configuration', () => {
      const newDefaults = {
        timeout: 8000,
        retryAttempts: 5
      };

      ConnectionFactory.setDefaults(newDefaults);

      const connection = ConnectionFactory.create({ url: 'http://localhost:8090' });
      expect(connection).toBeInstanceOf(PocketBaseConnection);
    });
  });
});

describe('PocketBaseConnection', () => {
  let mockPb: any;
  let connection: PocketBaseConnection;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockPb = {
      health: {
        check: jest.fn()
      },
      beforeSend: null
    };

    (PocketBase as any).mockImplementation(() => mockPb);

    connection = new PocketBaseConnection({
      url: 'http://localhost:8090',
      timeout: 1000,
      retryAttempts: 2,
      retryDelay: 100,
      healthCheckInterval: 5000
    });
  });

  afterEach(() => {
    connection.destroy();
    jest.useRealTimers();
  });

  describe('getInstance', () => {
    it('should return the PocketBase instance', () => {
      const instance = connection.getInstance();
      expect(instance).toBe(mockPb);
    });
  });

  describe('connect', () => {
    it('should connect successfully on first attempt', async () => {
      mockPb.health.check.mockResolvedValue({});

      const connectPromise = connection.connect();
      
      // Fast-forward timers to complete the connection
      jest.runAllTimers();
      
      await expect(connectPromise).resolves.toBeUndefined();
      expect(connection.isConnectionActive()).toBe(true);
    });

    it('should retry on failure and eventually succeed', async () => {
      mockPb.health.check
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({});

      await expect(connection.connect()).resolves.toBeUndefined();
      expect(mockPb.health.check).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retry attempts', async () => {
      mockPb.health.check.mockRejectedValue(new Error('Connection failed'));

      await expect(connection.connect()).rejects.toThrow('Failed to connect to PocketBase after 2 attempts');
    });

    it('should emit connected event on successful connection', async () => {
      mockPb.health.check.mockResolvedValue({});
      
      const listener = jest.fn();
      connection.on('connected', listener);

      const connectPromise = connection.connect();
      jest.runAllTimers();
      await connectPromise;

      expect(listener).toHaveBeenCalledWith('connected', expect.any(Object));
    });

    it('should emit error event on connection failure', async () => {
      mockPb.health.check.mockRejectedValue(new Error('Connection failed'));
      
      const listener = jest.fn();
      connection.on('error', listener);

      await expect(connection.connect()).rejects.toThrow();
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should disconnect and emit disconnected event', async () => {
      const listener = jest.fn();
      connection.on('disconnected', listener);

      await connection.disconnect();

      expect(connection.isConnectionActive()).toBe(false);
      expect(listener).toHaveBeenCalledWith('disconnected', undefined);
    });
  });

  describe('performHealthCheck', () => {
    it('should return healthy status on successful check', async () => {
      mockPb.health.check.mockResolvedValue({});

      const health = await connection.performHealthCheck();

      expect(health.isHealthy).toBe(true);
      expect(typeof health.responseTime).toBe('number');
      expect(health.error).toBeUndefined();
    });

    it('should return unhealthy status on failed check', async () => {
      const error = new Error('Health check failed');
      mockPb.health.check.mockRejectedValue(error);

      await expect(connection.performHealthCheck()).rejects.toThrow('Health check failed');
      
      const health = connection.getHealth();
      expect(health.isHealthy).toBe(false);
      expect(health.error).toBe('Health check failed');
    });

    it('should emit health-check event', async () => {
      mockPb.health.check.mockResolvedValue({});
      
      const listener = jest.fn();
      connection.on('health-check', listener);

      await connection.performHealthCheck();

      expect(listener).toHaveBeenCalledWith('health-check', expect.objectContaining({
        isHealthy: true
      }));
    });
  });

  describe('event listeners', () => {
    it('should add and remove event listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      connection.on('connected', listener1);
      connection.on('connected', listener2);

      // Remove one listener
      connection.off('connected', listener1);

      // Manually emit event to test
      (connection as any).emit('connected', {});

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('health check timer', () => {
    it('should start health check timer after connection', async () => {
      mockPb.health.check.mockResolvedValue({});

      await connection.connect();
      
      // Fast-forward to trigger health check
      jest.advanceTimersByTime(5000);
      
      // Should have been called once during connect and once by timer
      expect(mockPb.health.check).toHaveBeenCalledTimes(2);
    });

    it('should stop health check timer after disconnection', async () => {
      mockPb.health.check.mockResolvedValue({});

      await connection.connect();
      await connection.disconnect();
      
      // Clear previous calls
      mockPb.health.check.mockClear();
      
      // Fast-forward time
      jest.advanceTimersByTime(10000);
      
      // Should not be called after disconnection
      expect(mockPb.health.check).not.toHaveBeenCalled();
    });
  });
});