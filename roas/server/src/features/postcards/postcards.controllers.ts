import { Request, Response, NextFunction } from 'express';
import * as postcardsService from './postcards.services';
import { sendSuccess } from '../../utils/response';
import {
  CreatePostcardInput,
  UpdatePostcardInput,
  ListPostcardsQuery,
  BulkDeactivateInput,
} from './postcards.validators';

export const createPostcard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as CreatePostcardInput;
    const creatorId = req.user!.userId;

    const postcard = await postcardsService.createPostcard({
      ...data,
      createdBy: creatorId,
    });

    sendSuccess(res, postcard, 'Postcard created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listPostcards = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query as unknown as ListPostcardsQuery;

    const result = await postcardsService.listPostcards({
      page: parseInt(query.page || '1', 10),
      limit: parseInt(query.limit || '10', 10),
      sort: query.sort || 'createdAt',
      order: query.order || 'desc',
      search: query.search,
      vendor: query.vendor,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
      name: query.name,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getPostcardById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const postcard = await postcardsService.getPostcardById(req.params.id as string);
    sendSuccess(res, postcard);
  } catch (error) {
    next(error);
  }
};

export const updatePostcard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdatePostcardInput;
    const postcard = await postcardsService.updatePostcard(req.params.id as string, data);
    sendSuccess(res, postcard, 'Postcard updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deactivatePostcard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const postcard = await postcardsService.deactivatePostcard(req.params.id as string);
    sendSuccess(res, postcard, 'Postcard deactivated successfully');
  } catch (error) {
    next(error);
  }
};

export const activatePostcard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const postcard = await postcardsService.activatePostcard(req.params.id as string);
    sendSuccess(res, postcard, 'Postcard activated successfully');
  } catch (error) {
    next(error);
  }
};

export const bulkDeactivatePostcards = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { ids } = req.body as BulkDeactivateInput;
    const count = await postcardsService.bulkDeactivatePostcards(ids);
    sendSuccess(res, { deactivatedCount: count }, `${count} postcards deactivated successfully`);
  } catch (error) {
    next(error);
  }
};
