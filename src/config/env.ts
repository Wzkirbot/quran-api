import dotenv from 'dotenv';
import path from 'node:path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  database: {
    url: process.env.DATABASE_URL || 'postgres://quran_user:quran_pass@localhost:5432/quran_db',
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '20', 10)
  },

  redis: {
    url: process.env.REDIS_URL || undefined,
    enabled: Boolean(process.env.REDIS_URL && process.env.REDIS_URL.trim().length > 0)
  },

  cache: {
    ttlDefault: parseInt(process.env.CACHE_TTL_DEFAULT || '3600', 10), // 1 hour
    ttlSurahs: parseInt(process.env.CACHE_TTL_SURAHS || '86400', 10), // 24 hours
    ttlSearch: parseInt(process.env.CACHE_TTL_SEARCH || '1800', 10) // 30 minutes
  },

  rateLimit: {
    windowMs: parseWindowMs(process.env.RATE_LIMIT_WINDOW || '1m'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },

  logger: {
    level: process.env.LOG_LEVEL || 'info'
  },

  apiKey: {
    required: process.env.REQUIRE_API_KEY === 'true',
    headerName: 'x-api-key'
  }
};

function parseWindowMs(str: string): number {
  const match = str.trim().match(/^(\d+)([smhd])$/);
  if (!match) return 60 * 1000; // default 1 minute

  const val = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return val * 1000;
    case 'm': return val * 60 * 1000;
    case 'h': return val * 60 * 60 * 1000;
    case 'd': return val * 24 * 60 * 60 * 1000;
    default: return 60 * 1000;
  }
}
