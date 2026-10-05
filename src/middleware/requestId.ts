import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.headers['x-request-id'] as string;
  const requestId = existingId || crypto.randomUUID();

  (req as any).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
