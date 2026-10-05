import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';
import { sendError } from '../utils/responseEnvelope.js';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  // If API Keys are not required by configuration, proceed immediately
  if (!config.apiKey.required) {
    return next();
  }

  const apiKey = req.headers[config.apiKey.headerName] as string;

  if (!apiKey || apiKey.trim().length === 0) {
    sendError(req, res, 'UNAUTHORIZED', 'API Key is required to access this resource.', 401);
    return;
  }

  // Example placeholder for key verification (hash lookup / env key)
  const masterKey = process.env.API_MASTER_KEY;
  if (masterKey && apiKey !== masterKey) {
    sendError(req, res, 'INVALID_API_KEY', 'The provided API Key is invalid or expired.', 403);
    return;
  }

  next();
}
