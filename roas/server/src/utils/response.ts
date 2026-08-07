import { Response } from 'express';
import { IApiResponse } from '../types/common';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
): void => {
  const response: IApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, code: string, message: string, statusCode = 500): void => {
  const response: IApiResponse = {
    success: false,
    error: { code, message },
  };
  res.status(statusCode).json(response);
};
