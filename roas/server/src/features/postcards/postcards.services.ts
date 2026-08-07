import { PostcardModel, IPostcard } from './postcards.models';
import { VendorModel } from '../vendors/vendors.models';
import { IPaginatedResult } from '../../types/common';
import { ConflictError, NotFoundError } from '../../utils/errors';
import logger from '../../utils/logger';

interface CreatePostcardData {
  name: string;
  description?: string;
  images?: string[];
  vendor: string;
  createdBy: string;
}

interface UpdatePostcardData {
  name?: string;
  description?: string;
  images?: string[];
}

interface ListPostcardsParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  vendor?: string;
  isActive?: boolean;
  name?: string;
}

interface PostcardResponse {
  postcardId: string;
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

interface PostcardListItem {
  postcardId: string;
  name: string;
  description: string;
  images: string[];
  vendorName: string;
  vendorId: string;
  isActive: boolean;
  createdAt: Date;
}

const toPostcardListItem = (postcard: IPostcard): PostcardListItem => {
  const vendorData = postcard.vendor as unknown as { _id: { toString(): string }; name: string };
  return {
    postcardId: postcard._id.toString(),
    name: postcard.name,
    description: postcard.description,
    images: postcard.images,
    vendorName: vendorData?.name || 'Unknown',
    vendorId: vendorData?._id?.toString() || '',
    isActive: postcard.isActive,
    createdAt: postcard.createdAt,
  };
};

const toPostcardResponse = (postcard: IPostcard): PostcardResponse => {
  const vendorData = postcard.vendor as unknown as { _id: { toString(): string }; name: string };
  return {
    postcardId: postcard._id.toString(),
    name: postcard.name,
    description: postcard.description,
    images: postcard.images,
    vendor: {
      vendorId: vendorData?._id?.toString() || '',
      name: vendorData?.name || 'Unknown',
    },
    isActive: postcard.isActive,
    createdBy: postcard.createdBy.toString(),
    createdAt: postcard.createdAt,
    updatedAt: postcard.updatedAt,
  };
};

export const createPostcard = async (data: CreatePostcardData): Promise<PostcardResponse> => {
  const vendor = await VendorModel.findById(data.vendor);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const existing = await PostcardModel.findOne({
    name: data.name,
    vendor: data.vendor,
    isActive: true,
  });
  if (existing) {
    throw new ConflictError('Postcard with this name already exists for this vendor');
  }

  const postcard = await PostcardModel.create({
    name: data.name,
    description: data.description || '',
    images: data.images || [],
    vendor: data.vendor,
    createdBy: data.createdBy,
  });

  const populated = await PostcardModel.findById(postcard._id).populate('vendor', 'name');
  if (!populated) {
    throw new NotFoundError('Postcard not found after creation');
  }

  logger.info(`Postcard created: ${postcard._id}`);
  return toPostcardResponse(populated);
};

export const listPostcards = async (
  params: ListPostcardsParams,
): Promise<IPaginatedResult<PostcardListItem>> => {
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

  const totalItems = await PostcardModel.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
  const skip = (page - 1) * limit;

  const postcards = await PostcardModel.find(filter)
    .populate('vendor', 'name')
    .sort({ [sort]: order === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  return {
    items: postcards.map(toPostcardListItem),
    totalItems,
    totalPages,
    currentPage: page,
    limit,
  };
};

export const getPostcardById = async (id: string): Promise<PostcardResponse> => {
  const postcard = await PostcardModel.findById(id).populate('vendor', 'name');
  if (!postcard) {
    throw new NotFoundError('Postcard not found');
  }
  return toPostcardResponse(postcard);
};

export const updatePostcard = async (
  id: string,
  data: UpdatePostcardData,
): Promise<PostcardResponse> => {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.images !== undefined) updateData.images = data.images;

  const postcard = await PostcardModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true },
  ).populate('vendor', 'name');

  if (!postcard) {
    throw new NotFoundError('Postcard not found');
  }

  logger.info(`Postcard updated: ${id}`);
  return toPostcardResponse(postcard);
};

export const deactivatePostcard = async (id: string): Promise<PostcardResponse> => {
  const postcard = await PostcardModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  ).populate('vendor', 'name');

  if (!postcard) {
    throw new NotFoundError('Postcard not found');
  }

  logger.info(`Postcard deactivated: ${id}`);
  return toPostcardResponse(postcard);
};

export const activatePostcard = async (id: string): Promise<PostcardResponse> => {
  const postcard = await PostcardModel.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true },
  ).populate('vendor', 'name');

  if (!postcard) {
    throw new NotFoundError('Postcard not found');
  }

  logger.info(`Postcard activated: ${id}`);
  return toPostcardResponse(postcard);
};

export const bulkDeactivatePostcards = async (ids: string[]): Promise<number> => {
  const result = await PostcardModel.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: false } },
  );
  logger.info(`Bulk deactivated ${result.modifiedCount} postcards`);
  return result.modifiedCount;
};
