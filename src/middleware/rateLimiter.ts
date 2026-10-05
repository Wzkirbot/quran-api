import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env.js';
import { sendError } from '../utils/responseEnvelope.js';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendError(
      req,
      res,
      'RATE_LIMIT_EXCEEDED',
      `Too many requests. Limit is ${config.rateLimit.max} requests per ${Math.round(config.rateLimit.windowMs / 1000)} seconds.`,
      429
    );
  }
});
