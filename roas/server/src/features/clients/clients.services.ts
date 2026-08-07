import { ClientModel, IClient } from './clients.models';
import { VendorModel } from '../vendors/vendors.models';
import { IPaginatedResult } from '../../types/common';
import { NotFoundError } from '../../utils/errors';
import logger from '../../utils/logger';

interface CreateClientData {
  name: string;
  email: string;
  label?: string;
  category?: string;
  tag?: string;
  vendor: string;
  createdBy: string;
}

interface UpdateClientData {
  name?: string;
  email?: string;
  label?: string;
  category?: string;
  tag?: string;
}

interface ListClientsParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  vendor?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
  label?: string;
  category?: string;
  tag?: string;
}

interface ClientResponse {
  clientId: string;
  name: string;
  email: string;
  label: string;
  category: string;
  tag: string;
  vendor: {
    vendorId: string;
    name: string;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientListItem {
  clientId: string;
  name: string;
  email: string;
  label: string;
  category: string;
  tag: string;
  vendorName: string;
  vendorId: string;
  isActive: boolean;
  createdAt: Date;
}

const toClientListItem = (client: IClient): ClientListItem => {
  const vendorData = client.vendor as unknown as { _id: { toString(): string }; name: string };
  return {
    clientId: client._id.toString(),
    name: client.name,
    email: client.email,
    label: client.label,
    category: client.category,
    tag: client.tag,
    vendorName: vendorData?.name || 'Unknown',
    vendorId: vendorData?._id?.toString() || '',
    isActive: client.isActive,
    createdAt: client.createdAt,
  };
};

const toClientResponse = (client: IClient): ClientResponse => {
  const vendorData = client.vendor as unknown as { _id: { toString(): string }; name: string };
  return {
    clientId: client._id.toString(),
    name: client.name,
    email: client.email,
    label: client.label,
    category: client.category,
    tag: client.tag,
    vendor: {
      vendorId: vendorData?._id?.toString() || '',
      name: vendorData?.name || 'Unknown',
    },
    isActive: client.isActive,
    createdBy: client.createdBy.toString(),
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
};

export const createClient = async (data: CreateClientData): Promise<ClientResponse> => {
  const vendor = await VendorModel.findById(data.vendor);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const client = await ClientModel.create({
    name: data.name,
    email: data.email,
    label: data.label || '',
    category: data.category || '',
    tag: data.tag || '',
    vendor: data.vendor,
    createdBy: data.createdBy,
  });

  const populated = await ClientModel.findById(client._id).populate('vendor', 'name');
  if (!populated) {
    throw new NotFoundError('Client not found after creation');
  }

  logger.info(`Client created: ${client._id}`);
  return toClientResponse(populated);
};

export const listClients = async (
  params: ListClientsParams,
): Promise<IPaginatedResult<ClientListItem>> => {
  const { page, limit, sort, order, search, vendor, isActive, name, email, label, category, tag } =
    params;

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
      { email: { $regex: search, $options: 'i' } },
      { label: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { tag: { $regex: search, $options: 'i' } },
    ];
  }

  // Column-level filters
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }
  if (email) {
    filter.email = { $regex: email, $options: 'i' };
  }
  if (label) {
    filter.label = { $regex: label, $options: 'i' };
  }
  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }
  if (tag) {
    filter.tag = { $regex: tag, $options: 'i' };
  }

  const totalItems = await ClientModel.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
  const skip = (page - 1) * limit;

  const clients = await ClientModel.find(filter)
    .populate('vendor', 'name')
    .sort({ [sort]: order === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  return {
    items: clients.map(toClientListItem),
    totalItems,
    totalPages,
    currentPage: page,
    limit,
  };
};

export const getClientById = async (id: string): Promise<ClientResponse> => {
  const client = await ClientModel.findById(id).populate('vendor', 'name');
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  return toClientResponse(client);
};

export const updateClient = async (
  id: string,
  data: UpdateClientData,
): Promise<ClientResponse> => {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.label !== undefined) updateData.label = data.label;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.tag !== undefined) updateData.tag = data.tag;

  const client = await ClientModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true },
  ).populate('vendor', 'name');

  if (!client) {
    throw new NotFoundError('Client not found');
  }

  logger.info(`Client updated: ${id}`);
  return toClientResponse(client);
};

export const deactivateClient = async (id: string): Promise<ClientResponse> => {
  const client = await ClientModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  ).populate('vendor', 'name');

  if (!client) {
    throw new NotFoundError('Client not found');
  }

  logger.info(`Client deactivated: ${id}`);
  return toClientResponse(client);
};

export const activateClient = async (id: string): Promise<ClientResponse> => {
  const client = await ClientModel.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true },
  ).populate('vendor', 'name');

  if (!client) {
    throw new NotFoundError('Client not found');
  }

  logger.info(`Client activated: ${id}`);
  return toClientResponse(client);
};

export const bulkDeactivateClients = async (ids: string[]): Promise<number> => {
  const result = await ClientModel.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: false } },
  );
  logger.info(`Bulk deactivated ${result.modifiedCount} clients`);
  return result.modifiedCount;
};
