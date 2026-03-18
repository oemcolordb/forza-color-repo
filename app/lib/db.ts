import { createClient, Client } from '@libsql/client';

/**
 * Database Connection Pool Manager
 * Singleton pattern to reuse database connections
 */
class DatabasePool {
  private client: Client | null = null;
  private isInitialized = false;

  /**
   * Get or create database client
   * @returns Database client instance
   */
  getClient(): Client | null {
    // Check if database is configured
    if (!process.env.TURSO_DATABASE_URL || 
        process.env.TURSO_DATABASE_URL === 'your_turso_database_url_here') {
      console.warn('Database not configured');
      return null;
    }

    // Return existing client if available
    if (this.client && this.isInitialized) {
      return this.client;
    }

    // Create new client
    try {
      this.client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      });
      
      this.isInitialized = true;
      console.log('Database client initialized');
      
      return this.client;
    } catch (error) {
      console.error('Failed to create database client:', error);
      return null;
    }
  }

  /**
   * Close database connection
   * Should be called on application shutdown
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.client = null;
        this.isInitialized = false;
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }

  /**
   * Check if client is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * Get connection statistics
   */
  getStats(): { isInitialized: boolean; hasClient: boolean } {
    return {
      isInitialized: this.isInitialized,
      hasClient: this.client !== null
    };
  }
}

// Singleton instance
const dbPool = new DatabasePool();

/**
 * Get database client from pool
 * @returns Database client or null if not configured
 */
export function getDbClient(): Client | null {
  return dbPool.getClient();
}

/**
 * Close database connection
 * Call this on application shutdown
 */
export async function closeDbConnection(): Promise<void> {
  await dbPool.close();
}

/**
 * Check if database is ready
 */
export function isDatabaseReady(): boolean {
  return dbPool.isReady();
}

/**
 * Get database pool statistics
 */
export function getDbStats() {
  return dbPool.getStats();
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connection...');
    await closeDbConnection();
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connection...');
    await closeDbConnection();
  });
}
