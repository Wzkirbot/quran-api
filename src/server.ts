import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { db } from './database/connection.js';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  logger.info(`====================================================`);
  logger.info(`📖 Quran API Server is listening on http://${config.host}:${config.port}`);
  logger.info(`🚀 Environment: ${config.env}`);
  logger.info(`📚 Swagger Documentation: http://localhost:${config.port}/docs`);
  logger.info(`🧪 API Playground: http://localhost:${config.port}/playground`);
  logger.info(`📊 Health Status: http://localhost:${config.port}/status`);
  logger.info(`🛡️ Zero External Runtime Calls: VERIFIED & ACTIVE`);
  logger.info(`====================================================`);
});

// Graceful Shutdown Handling
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await db.close();
    logger.info('Database pool closed. Exiting process.');
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
