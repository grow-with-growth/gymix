/**
 * Example usage of the connection pooling system
 */

import { ConnectionManager, createConnectionManagerFromEnv } from './connectionManager';
import { ConnectionPool, ConnectionPoolConfig } from './connectionPool';

// Example 1: Using Connection Manager with pooling
async function exampleWithPooling() {
  console.log('=== Connection Manager with Pooling Example ===');
  
  // Create connection manager with pooling enabled
  const manager = createConnectionManagerFromEnv();
  
  try {
    // Connect to the database
    await manager.connect();
    console.log('Connected to database with pooling');
    
    // Use a connection for database operations
    await manager.withConnection(async (pb) => {
      // Perform database operations
      console.log('Performing health check...');
      await pb.health.check();
      console.log('Health check successful');
    });
    
    // Get pool statistics
    const stats = manager.getPoolStats();
    if (stats) {
      console.log('Pool statistics:', stats);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    await manager.disconnect();
    console.log('Disconnected from database');
  }
}

// Example 2: Using Connection Manager without pooling
async function exampleWithoutPooling() {
  console.log('=== Connection Manager without Pooling Example ===');
  
  // Create connection manager without pooling
  const manager = new ConnectionManager({
    usePooling: false,
    singleConnectionConfig: {
      url: process.env.POCKETBASE_URL || 'http://127.0.0.1:8090',
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      healthCheckInterval: 30000
    }
  });
  
  try {
    // Connect to the database
    await manager.connect();
    console.log('Connected to database without pooling');
    
    // Use the connection
    await manager.withConnection(async (pb) => {
      console.log('Performing health check...');
      await pb.health.check();
      console.log('Health check successful');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    await manager.disconnect();
    console.log('Disconnected from database');
  }
}

// Example 3: Direct Connection Pool usage
async function exampleDirectPool() {
  console.log('=== Direct Connection Pool Example ===');
  
  const poolConfig: ConnectionPoolConfig = {
    minConnections: 2,
    maxConnections: 5,
    acquireTimeout: 10000,
    idleTimeout: 60000,
    connectionConfig: {
      url: process.env.POCKETBASE_URL || 'http://127.0.0.1:8090',
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      healthCheckInterval: 30000
    }
  };
  
  const pool = new ConnectionPool(poolConfig);
  
  try {
    console.log('Pool created, acquiring connection...');
    
    // Acquire a connection
    const connection = await pool.acquire();
    console.log('Connection acquired');
    
    // Use the connection
    const pb = connection.getInstance();
    await pb.health.check();
    console.log('Health check successful');
    
    // Release the connection back to the pool
    await pool.release(connection);
    console.log('Connection released');
    
    // Get pool statistics
    const stats = pool.getStats();
    console.log('Pool statistics:', stats);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up the pool
    await pool.destroy();
    console.log('Pool destroyed');
  }
}

// Example 4: Multiple concurrent connections
async function exampleConcurrentConnections() {
  console.log('=== Concurrent Connections Example ===');
  
  const manager = createConnectionManagerFromEnv();
  
  try {
    await manager.connect();
    console.log('Connected to database');
    
    // Simulate multiple concurrent operations
    const operations = Array.from({ length: 5 }, (_, i) => 
      manager.withConnection(async (pb) => {
        console.log(`Operation ${i + 1} starting...`);
        await pb.health.check();
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
        console.log(`Operation ${i + 1} completed`);
        return `Result ${i + 1}`;
      })
    );
    
    const results = await Promise.all(operations);
    console.log('All operations completed:', results);
    
    // Show final pool stats
    const stats = manager.getPoolStats();
    if (stats) {
      console.log('Final pool statistics:', stats);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await manager.disconnect();
    console.log('Disconnected from database');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  async function runExamples() {
    try {
      await exampleWithoutPooling();
      console.log('\n');
      
      await exampleWithPooling();
      console.log('\n');
      
      await exampleDirectPool();
      console.log('\n');
      
      await exampleConcurrentConnections();
      
    } catch (error) {
      console.error('Example failed:', error);
    }
  }
  
  runExamples();
}

export {
  exampleWithPooling,
  exampleWithoutPooling,
  exampleDirectPool,
  exampleConcurrentConnections
};