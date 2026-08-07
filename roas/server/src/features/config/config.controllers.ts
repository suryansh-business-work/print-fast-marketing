import { Request, Response, NextFunction } from 'express';
import config from '../../config/config';
import { sendSuccess } from '../../utils/response';

export const getPublicConfig = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    sendSuccess(res, {
      allowAdminSignup: config.allowAdminSignup,
      allowSendGodCredentials: config.allowSendGodCredentials,
    });
  } catch (error) {
    next(error);
  }
};
