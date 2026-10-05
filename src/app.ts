import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import { pinoHttp } from 'pino-http';

import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { apiKeyMiddleware } from './middleware/apiKey.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { v1Router } from './api/v1/index.js';
import { systemRouter } from './api/v1/routes/system.routes.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: config.cors.origin === '*' ? '*' : config.cors.origin.split(','),
      methods: ['GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Api-Key']
    })
  );

  // Gzip / Brotli Compression
  app.use(compression());

  // Request Parsers with Size Limits
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Request ID Tracking
  app.use(requestIdMiddleware);

  // Request Logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) =>
          req.url?.startsWith('/css') ||
          req.url?.startsWith('/js') ||
          req.url?.startsWith('/favicon') ||
          req.url === '/health'
      },
      customProps: (req) => ({
        requestId: (req as any).requestId
      })
    })
  );

  // Swagger UI Interactive OpenAPI Documentation
  const openapiSpecPath = path.resolve(process.cwd(), 'src/docs/openapi.json');
  try {
    const openapiSpec = require(openapiSpecPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: 'Quran API Docs' }));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: 'Quran API Docs' }));
  } catch (err: any) {
    logger.warn(`Could not load swagger documentation spec: ${err.message}`);
  }

  // System Health Endpoints at Root Level
  app.use('/', systemRouter);

  // Root Discovery Endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'Quran API',
      version: '1.0.0',
      description: 'Production-ready, offline-first, self-hosted Quran API',
      documentation: '/docs',
      health: '/health',
      v1: {
        surahs: '/v1/surahs',
        ayah: '/v1/ayahs/1',
        juz: '/v1/juz/1',
        page: '/v1/pages/1',
        search: '/v1/search?q=رحمة',
        tafsir: '/v1/tafsir/ar.muyassar/1/1',
        translation: '/v1/translations/en.saheeh/1/1',
        adhkar: '/v1/adhkar',
        duas: '/v1/duas'
      }
    });
  });

  // API Version 1 with Rate Limiter and Optional API Key Guard
  app.use('/v1', apiRateLimiter, apiKeyMiddleware, v1Router);

  // 404 & Global Error Handlers
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
