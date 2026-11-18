import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || 500;
  const requestId = (req.headers['x-request-id'] as string) || Math.random().toString(36).substring(7);

  logger.error({ err, requestId, path: req.path }, 'Unhandled Request Error');

  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      requestId
    }
  });
}
