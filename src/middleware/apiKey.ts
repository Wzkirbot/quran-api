import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { config } from '../config/env.js';
import { sendError } from '../utils/responseEnvelope.js';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  // If API Keys are not required by configuration, proceed immediately
  if (!config.apiKey.required) {
    return next();
  }

  const rawApiKey = req.headers[config.apiKey.headerName];
  const apiKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : '';

  if (!apiKey) {
    sendError(req, res, 'UNAUTHORIZED', 'API Key is required to access this resource.', 401);
    return;
  }

  const masterKey = process.env.API_MASTER_KEY;
  if (!masterKey || masterKey.trim().length === 0) {
    sendError(req, res, 'SERVER_CONFIGURATION_ERROR', 'API key verification is misconfigured on the server.', 500);
    return;
  }

  const keyBuffer = Buffer.from(apiKey);
  const masterBuffer = Buffer.from(masterKey);

  const isValid = keyBuffer.length === masterBuffer.length && crypto.timingSafeEqual(keyBuffer, masterBuffer);

  if (!isValid) {
    sendError(req, res, 'INVALID_API_KEY', 'The provided API Key is invalid or expired.', 403);
    return;
  }

  next();
}
