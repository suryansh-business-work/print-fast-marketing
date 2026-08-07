import { ProductModel, IProduct } from './products.models';
import { VendorModel } from '../vendors/vendors.models';
import { IPaginatedResult } from '../../types/common';
import { ConflictError, NotFoundError } from '../../utils/errors';
import logger from '../../utils/logger';

interface CreateProductData {
  name: string;
  description?: string;
  images?: string[];
  vendor: string;
  createdBy: string;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  images?: string[];
}

interface ListProductsParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  vendor?: string;
  isActive?: boolean;
  name?: string;
}

interface ProductResponse {
  productId: string;
  name: string;
  description: string;
  images: string[];
  vendor: {
    vendorId: string;
    name: string;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductListItem {
  productId: string;
  name: string;
  description: string;
  images: string[];
  vendorName: string;
  vendorId: string;
  isActive: boolean;
  createdAt: Date;
}

const toProductListItem = (product: IProduct): ProductListItem => {
  const vendorData = product.vendor as unknown as { _id: { toString(): string }; name: string };
  return {
    productId: product._id.toString(),
    name: product.name,
    description: product.description,
    images: product.images,
    vendorName: vendorData?.name || 'Unknown',
    vendorId: vendorData?._id?.toString() || '',
    isActive: product.isActive,
    createdAt: product.createdAt,
  };
};

const toProductResponse = (product: IProduct): ProductResponse => {
  const vendorData = product.vendor as unknown as { _id: { toString(): string }; name: string };
  return {
    productId: product._id.toString(),
    name: product.name,
    description: product.description,
    images: product.images,
    vendor: {
      vendorId: vendorData?._id?.toString() || '',
      name: vendorData?.name || 'Unknown',
    },
    isActive: product.isActive,
    createdBy: product.createdBy.toString(),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const createProduct = async (data: CreateProductData): Promise<ProductResponse> => {
  const vendor = await VendorModel.findById(data.vendor);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const existing = await ProductModel.findOne({
    name: data.name,
    vendor: data.vendor,
    isActive: true,
  });
  if (existing) {
    throw new ConflictError('Product with this name already exists for this vendor');
  }

  const product = await ProductModel.create({
    name: data.name,
    description: data.description || '',
    images: data.images || [],
    vendor: data.vendor,
    createdBy: data.createdBy,
  });

  const populated = await ProductModel.findById(product._id).populate('vendor', 'name');
  if (!populated) {
    throw new NotFoundError('Product not found after creation');
  }

  logger.info(`Product created: ${product._id}`);
  return toProductResponse(populated);
};

export const listProducts = async (
  params: ListProductsParams,
): Promise<IPaginatedResult<ProductListItem>> => {
  const { page, limit, sort, order, search, vendor, isActive, name } = params;

  const filter: Record<string, unknown> = {};
  if (isActive !== undefined) {
    filter.isActive = isActive;
  }
  if (vendor) {
    filter.vendor = vendor;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }

  const totalItems = await ProductModel.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
  const skip = (page - 1) * limit;

  const products = await ProductModel.find(filter)
    .populate('vendor', 'name')
    .sort({ [sort]: order === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  return {
    items: products.map(toProductListItem),
    totalItems,
    totalPages,
    currentPage: page,
    limit,
  };
};

export const getProductById = async (id: string): Promise<ProductResponse> => {
  const product = await ProductModel.findById(id).populate('vendor', 'name');
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return toProductResponse(product);
};

export const updateProduct = async (
  id: string,
  data: UpdateProductData,
): Promise<ProductResponse> => {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.images !== undefined) updateData.images = data.images;

  const product = await ProductModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true },
  ).populate('vendor', 'name');

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  logger.info(`Product updated: ${id}`);
  return toProductResponse(product);
};

export const deactivateProduct = async (id: string): Promise<ProductResponse> => {
  const product = await ProductModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  ).populate('vendor', 'name');

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  logger.info(`Product deactivated: ${id}`);
  return toProductResponse(product);
};

export const activateProduct = async (id: string): Promise<ProductResponse> => {
  const product = await ProductModel.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true },
  ).populate('vendor', 'name');

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  logger.info(`Product activated: ${id}`);
  return toProductResponse(product);
};

export const listAllActiveProducts = async (vendorId?: string): Promise<ProductListItem[]> => {
  const filter: Record<string, unknown> = { isActive: true };
  if (vendorId) {
    filter.vendor = vendorId;
  }
  const products = await ProductModel.find(filter)
    .populate('vendor', 'name')
    .sort({ name: 1 });
  return products.map(toProductListItem);
};

export const bulkDeactivateProducts = async (ids: string[]): Promise<number> => {
  const result = await ProductModel.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: false } },
  );
  logger.info(`Bulk deactivated ${result.modifiedCount} products`);
  return result.modifiedCount;
};
