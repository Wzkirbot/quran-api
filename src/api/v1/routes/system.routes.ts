import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../../../database/connection.js';
import { cache } from '../../../cache/cache.service.js';
import { sendSuccess } from '../../../utils/responseEnvelope.js';

export const systemRouter = Router();

// GET /health - Liveness probe
systemRouter.get('/health', (req: Request, res: Response) => {
  sendSuccess(req, res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// GET /ready - Readiness probe checking database and cache
systemRouter.get('/ready', async (req: Request, res: Response) => {
  const dbStatus = db.getStatus();
  const cacheStatus = cache.getStatus();

  const isReady = true; // Local dataset in-memory is always ready, DB/Redis enrich performance

  sendSuccess(req, res, {
    status: isReady ? 'ready' : 'degraded',
    database: dbStatus,
    cache: cacheStatus,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// GET /version - Version and dataset manifests metadata
systemRouter.get('/version', (req: Request, res: Response) => {
  const manifests: Record<string, any> = {};

  const readManifest = (domain: string) => {
    try {
      const p = path.resolve(process.cwd(), `data/${domain}/manifest.json`);
      if (fs.existsSync(p)) {
        manifests[domain] = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch {}
  };

  readManifest('quran');
  readManifest('adhkar');
  readManifest('dua');
  readManifest('tafsir');
  readManifest('translations');

  sendSuccess(req, res, {
    apiVersion: '1.0.0',
    service: 'Quran API',
    license: 'MIT',
    nodeVersion: process.version,
    datasets: manifests
  });
});
