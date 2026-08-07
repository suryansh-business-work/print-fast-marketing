import { Request, Response, NextFunction } from 'express';
import * as uploadService from './upload.services';
import { sendSuccess } from '../../utils/response';
import { UploadFileQuery } from './upload.validators';

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'File is required' },
      });
      return;
    }

    const query = req.query as unknown as UploadFileQuery;
    const folder = query.folder || 'general';

    const result = await uploadService.uploadFile(req.file.buffer, req.file.originalname, folder);

    sendSuccess(res, result, 'File uploaded successfully');
  } catch (error) {
    next(error);
  }
};
