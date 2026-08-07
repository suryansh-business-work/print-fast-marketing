import { Request, Response, NextFunction } from 'express';
import * as productsService from './products.services';
import { sendSuccess } from '../../utils/response';
import { CreateProductInput, UpdateProductInput, ListProductsQuery, BulkDeactivateInput } from './products.validators';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as CreateProductInput;
    const creatorId = req.user!.userId;

    const product = await productsService.createProduct({
      ...data,
      createdBy: creatorId,
    });

    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query as unknown as ListProductsQuery;

    const result = await productsService.listProducts({
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

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await productsService.getProductById(req.params.id as string);
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdateProductInput;
    const product = await productsService.updateProduct(req.params.id as string, data);
    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deactivateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await productsService.deactivateProduct(req.params.id as string);
    sendSuccess(res, product, 'Product deactivated successfully');
  } catch (error) {
    next(error);
  }
};

export const activateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await productsService.activateProduct(req.params.id as string);
    sendSuccess(res, product, 'Product activated successfully');
  } catch (error) {
    next(error);
  }
};

export const listAllActiveProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const vendorId = req.query.vendor as string | undefined;
    const products = await productsService.listAllActiveProducts(vendorId);
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
};

export const bulkDeactivateProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { ids } = req.body as BulkDeactivateInput;
    const count = await productsService.bulkDeactivateProducts(ids);
    sendSuccess(res, { deactivatedCount: count }, `${count} products deactivated successfully`);
  } catch (error) {
    next(error);
  }
};
