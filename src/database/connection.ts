import pg from 'pg';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export class Database {
  private pool: pg.Pool | null = null;
  private isConnected = false;

  constructor() {
    this.initPool();
  }

  private initPool(): void {
    try {
      this.pool = new Pool({
        connectionString: config.database.url,
        min: config.database.poolMin,
        max: config.database.poolMax,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 4000
      });

      this.pool.on('error', (err) => {
        logger.warn(`PostgreSQL Pool unexpected error: ${err.message}`);
        this.isConnected = false;
      });
    } catch (err: any) {
      logger.warn(`Failed to initialize PostgreSQL pool: ${err.message}`);
      this.isConnected = false;
    }
  }

  public async testConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.isConnected = true;
      return true;
    } catch (err: any) {
      this.isConnected = false;
      return false;
    }
  }

  public async query<T extends pg.QueryResultRow = any>(text: string, params: any[] = []): Promise<pg.QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database connection pool is not initialized');
    }
    const start = Date.now();
    try {
      const res = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug({ query: text, duration, rows: res.rowCount }, 'Executed SQL query');
      return res;
    } catch (err: any) {
      logger.error({ query: text, error: err.message }, 'Database query error');
      throw err;
    }
  }

  public getPool(): pg.Pool | null {
    return this.pool;
  }

  public getStatus(): { connected: boolean; provider: string } {
    return {
      connected: this.isConnected,
      provider: 'postgresql'
    };
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
    }
  }
}

export const db = new Database();
