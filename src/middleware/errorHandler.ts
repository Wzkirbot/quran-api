import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseEnvelope.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(req, res, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found.`, 404);
}

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  logger.error({
    err: {
      message: err.message,
      stack: config.isProduction ? undefined : err.stack,
      code: err.code
    },
    req: {
      method: req.method,
      url: req.originalUrl,
      requestId: (req as any).requestId
    }
  }, 'Request error encountered');

  const safeMessage = config.isProduction && statusCode === 500
    ? 'An internal server error occurred. Please try again later.'
    : err.message || 'An unexpected error occurred.';

  sendError(
    req,
    res,
    errorCode,
    safeMessage,
    statusCode,
    !config.isProduction ? err.details : undefined
  );
}
