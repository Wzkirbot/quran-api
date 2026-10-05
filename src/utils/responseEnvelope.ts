import { Response, Request } from 'express';
import { ApiResponse, ApiErrorResponse } from '../types/index.js';

export function sendSuccess<T>(
  req: Request,
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
  statusCode = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
      ...meta
    }
  };
  res.status(statusCode).json(response);
}

export function sendError(
  req: Request,
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: unknown
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId
    }
  };
  res.status(statusCode).json(response);
}
