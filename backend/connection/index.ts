/**
 * Connection management system for PocketBase
 * 
 * This module provides:
 * - Connection factory for creating PocketBase connections with health checks
 * - Connection pooling for managing multiple connections efficiently
 * - Connection manager for unified connection handling
 * 
 * Usage:
 * 
 * 1. Simple connection management:
 * ```typescript
 * import { createConnectionManagerFromEnv } from './connection';
 * 
 * const manager = createConnectionManagerFromEnv();
 * await manager.connect();
 * 
 * await manager.withConnection(async (pb) => {
 *   // Use PocketBase instance
 *   const records = await pb.collection('users').getFullList();
 * });
 * 
 * await manager.disconnect();
 * ```
 * 
 * 2. Connection pooling:
 * ```typescript
 * import { ConnectionPool } from './connection';
 * 
 * const pool = new ConnectionPool({
 *   minConnections: 2,
 *   maxConnections: 10,
 *   acquireTimeout: 30000,
 *   idleTimeout: 300000,
 *   connectionConfig: {
 *     url: 'http://localhost:8090'
 *   }
 * });
 * 
 * const connection = await pool.acquire();
 * // Use connection
 * await pool.release(connection);
 * ```
 * 
 * Environment Variables:
 * - USE_CONNECTION_POOLING: 'true' to enable pooling
 * - POCKETBASE_URL: PocketBase server URL
 * - POOL_MIN_CONNECTIONS: Minimum pool connections (default: 2)
 * - POOL_MAX_CONNECTIONS: Maximum pool connections (default: 10)
 * - POOL_ACQUIRE_TIMEOUT: Connection acquire timeout in ms (default: 30000)
 * - POOL_IDLE_TIMEOUT: Idle connection timeout in ms (default: 300000)
 * - POCKETBASE_TIMEOUT: Request timeout in ms (default: 5000)
 * - POCKETBASE_RETRY_ATTEMPTS: Retry attempts (default: 3)
 * - POCKETBASE_RETRY_DELAY: Retry delay in ms (default: 1000)
 * - POCKETBASE_HEALTH_CHECK_INTERVAL: Health check interval in ms (default: 30000)
 */

// Connection Factory
export {
  ConnectionFactory,
  PocketBaseConnection,
  type PocketBaseConnectionConfig,
  type ConnectionHealth,
  type ConnectionEvent,
  type ConnectionEventListener
} from './connectionFactory';

// Connection Pool
export {
  ConnectionPool,
  initializeConnectionPool,
  getConnectionPool,
  destroyConnectionPool,
  type ConnectionPoolConfig,
  type PoolStats
} from './connectionPool';

// Connection Manager
export {
  ConnectionManager,
  createConnectionManagerFromEnv,
  type ConnectionManagerConfig
} from './connectionManager';

// Examples
export {
  exampleWithPooling,
  exampleWithoutPooling,
  exampleDirectPool,
  exampleConcurrentConnections
} from './example';