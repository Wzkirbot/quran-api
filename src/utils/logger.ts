import pino from 'pino';
import { config } from '../config/env.js';

export const logger = pino({
  level: config.logger.level,
  redact: {
    paths: ['req.headers.authorization', 'req.headers["x-api-key"]', 'password', 'token', 'secret'],
    censor: '[REDACTED]'
  },
  transport: !config.isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname'
        }
      }
    : undefined
});
