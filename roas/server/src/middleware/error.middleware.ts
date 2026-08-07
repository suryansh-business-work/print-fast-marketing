import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import config from '../config/config';
import { sendError } from '../utils/response';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  logger.error('Unhandled error:', err);

  const message =
    config.nodeEnv === 'production' ? 'Internal server error' : err.message || 'Unknown error';

  sendError(res, 'INTERNAL_ERROR', message, 500);
};
