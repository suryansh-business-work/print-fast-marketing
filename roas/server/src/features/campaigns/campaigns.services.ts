import mongoose from 'mongoose';
import { CampaignModel, ICampaign, ICampaignWeek } from './campaigns.models';
import { VendorModel } from '../vendors/vendors.models';
import { IPaginatedResult } from '../../types/common';
import { NotFoundError, ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';

interface CreateCampaignData {
  vendor: string;
  name: string;
  description?: string;
  currentProduct: string;
  totalMailingQuantity: number;
  totalWeeks: number;
  startDate: string;
  paymentDay: string;
  nextScheduledProduct?: string;
  nextScheduledArtworkDueDate?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  createdBy: string;
}

interface UpdateCampaignData {
  name?: string;
  description?: string;
  currentProduct?: string;
  totalMailingQuantity?: number;
  totalWeeks?: number;
  startDate?: string;
  paymentDay?: string;
  nextScheduledProduct?: string;
  nextScheduledArtworkDueDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

interface ListCampaignsParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  vendor?: string;
  isActive?: boolean;
  name?: string;
  currentProduct?: string;
  vendorName?: string;
}

interface CampaignWeekResponse {
  weekNumber: number;
  inHomesWeekOf: Date;
  mailingQuantity: number;
  totalPayments: number;
  productService: string | null;
}

interface CampaignResponse {
  campaignId: string;
  vendor: {
    vendorId: string;
    name: string;
  };
  name: string;
  description: string;
  currentProduct: string;
  totalMailingQuantity: number;
  totalWeeks: number;
  startDate: Date;
  paymentDay: string;
  nextScheduledProduct: string;
  nextScheduledArtworkDueDate: Date | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  postcardImageUrl: string;
  weeks: CampaignWeekResponse[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignListItem {
  campaignId: string;
  vendorName: string;
  vendorId: string;
  name: string;
  description: string;
  currentProduct: string;
  totalMailingQuantity: number;
  totalWeeks: number;
  startDate: Date;
  isActive: boolean;
  createdAt: Date;
}

const toCampaignListItem = (campaign: ICampaign): CampaignListItem => {
  const vendorData = campaign.vendor as unknown as { _id: { toString(): string }; name: string };
  return {
    campaignId: campaign._id.toString(),
    vendorName: vendorData?.name || 'Unknown',
    vendorId: vendorData?._id?.toString() || '',
    name: campaign.name,
    description: campaign.description,
    currentProduct: campaign.currentProduct,
    totalMailingQuantity: campaign.totalMailingQuantity,
    totalWeeks: campaign.totalWeeks,
    startDate: campaign.startDate,
    isActive: campaign.isActive,
    createdAt: campaign.createdAt,
  };
};

const toCampaignResponse = (campaign: ICampaign): CampaignResponse => {
  const vendorData = campaign.vendor as unknown as { _id: { toString(): string }; name: string };
  return {
    campaignId: campaign._id.toString(),
    vendor: {
      vendorId: vendorData?._id?.toString() || '',
      name: vendorData?.name || 'Unknown',
    },
    name: campaign.name,
    description: campaign.description,
    currentProduct: campaign.currentProduct,
    totalMailingQuantity: campaign.totalMailingQuantity,
    totalWeeks: campaign.totalWeeks,
    startDate: campaign.startDate,
    paymentDay: campaign.paymentDay,
    nextScheduledProduct: campaign.nextScheduledProduct,
    nextScheduledArtworkDueDate: campaign.nextScheduledArtworkDueDate || null,
    address: campaign.address,
    city: campaign.city,
    state: campaign.state,
    zipCode: campaign.zipCode,
    latitude: campaign.latitude,
    longitude: campaign.longitude,
    postcardImageUrl: campaign.postcardImageUrl,
    weeks: campaign.weeks.map((w: ICampaignWeek) => ({
      weekNumber: w.weekNumber,
      inHomesWeekOf: w.inHomesWeekOf,
      mailingQuantity: w.mailingQuantity,
      totalPayments: w.totalPayments,
      productService: w.productService?.toString() || null,
    })),
    isActive: campaign.isActive,
    createdBy: campaign.createdBy.toString(),
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
};

const generateWeeks = (
  totalWeeks: number,
  totalMailingQuantity: number,
  startDate: Date,
): ICampaignWeek[] => {
  const baseQuantity = Math.floor(totalMailingQuantity / totalWeeks);
  let remainder = totalMailingQuantity % totalWeeks;

  const weeks: ICampaignWeek[] = [];
  for (let i = 1; i <= totalWeeks; i++) {
    const weekDate = new Date(startDate);
    weekDate.setDate(weekDate.getDate() + (i - 1) * 7);

    const quantity = baseQuantity + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    weeks.push({
      weekNumber: i,
      inHomesWeekOf: weekDate,
      mailingQuantity: quantity,
      totalPayments: 0,
      productService: null,
    } as ICampaignWeek);
  }
  return weeks;
};

export const createCampaign = async (data: CreateCampaignData): Promise<CampaignResponse> => {
  const vendor = await VendorModel.findById(data.vendor);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const weeks = generateWeeks(data.totalWeeks, data.totalMailingQuantity, new Date(data.startDate));

  const campaign = await CampaignModel.create({
    vendor: data.vendor,
    name: data.name,
    description: data.description || '',
    currentProduct: data.currentProduct,
    totalMailingQuantity: data.totalMailingQuantity,
    totalWeeks: data.totalWeeks,
    startDate: new Date(data.startDate),
    paymentDay: data.paymentDay,
    nextScheduledProduct: data.nextScheduledProduct || '',
    nextScheduledArtworkDueDate: data.nextScheduledArtworkDueDate
      ? new Date(data.nextScheduledArtworkDueDate)
      : null,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    weeks,
    createdBy: data.createdBy,
  });

  const populated = await CampaignModel.findById(campaign._id).populate('vendor', 'name');
  if (!populated) {
    throw new NotFoundError('Campaign not found after creation');
  }

  logger.info(`Campaign created: ${campaign._id}`);
  return toCampaignResponse(populated);
};

export const listCampaigns = async (
  params: ListCampaignsParams,
): Promise<IPaginatedResult<CampaignListItem>> => {
  const { page, limit, sort, order, search, vendor, isActive, name, currentProduct, vendorName } =
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
      { currentProduct: { $regex: search, $options: 'i' } },
    ];
  }

  // Column-level filters
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }
  if (currentProduct) {
    filter.currentProduct = { $regex: currentProduct, $options: 'i' };
  }
  if (vendorName && !vendor) {
    const matchingVendors = await VendorModel.find({
      name: { $regex: vendorName, $options: 'i' },
    }).select('_id');
    const vendorIds = matchingVendors.map((v) => v._id);
    if (vendorIds.length > 0) {
      filter.vendor = { $in: vendorIds };
    } else {
      return { items: [], totalItems: 0, totalPages: 0, currentPage: page, limit };
    }
  }

  const totalItems = await CampaignModel.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
  const skip = (page - 1) * limit;

  const campaigns = await CampaignModel.find(filter)
    .populate('vendor', 'name')
    .sort({ [sort]: order === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  return {
    items: campaigns.map(toCampaignListItem),
    totalItems,
    totalPages,
    currentPage: page,
    limit,
  };
};

export const getCampaignById = async (id: string): Promise<CampaignResponse> => {
  const campaign = await CampaignModel.findById(id).populate('vendor', 'name');
  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }
  return toCampaignResponse(campaign);
};

export const updateCampaign = async (
  id: string,
  data: UpdateCampaignData,
): Promise<CampaignResponse> => {
  const campaign = await CampaignModel.findById(id);
  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.currentProduct !== undefined) updateData.currentProduct = data.currentProduct;
  if (data.paymentDay !== undefined) updateData.paymentDay = data.paymentDay;
  if (data.nextScheduledProduct !== undefined)
    updateData.nextScheduledProduct = data.nextScheduledProduct;
  if (data.nextScheduledArtworkDueDate !== undefined)
    updateData.nextScheduledArtworkDueDate = new Date(data.nextScheduledArtworkDueDate);
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;

  // If totalWeeks or totalMailingQuantity change, regenerate weeks
  const needsWeekRegeneration =
    data.totalWeeks !== undefined ||
    data.totalMailingQuantity !== undefined ||
    data.startDate !== undefined;

  if (needsWeekRegeneration) {
    const newTotalWeeks = data.totalWeeks ?? campaign.totalWeeks;
    const newTotalQty = data.totalMailingQuantity ?? campaign.totalMailingQuantity;
    const newStartDate = data.startDate ? new Date(data.startDate) : campaign.startDate;

    updateData.totalWeeks = newTotalWeeks;
    updateData.totalMailingQuantity = newTotalQty;
    updateData.startDate = newStartDate;
    updateData.weeks = generateWeeks(newTotalWeeks, newTotalQty, newStartDate);
  }

  const updated = await CampaignModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true },
  ).populate('vendor', 'name');

  if (!updated) {
    throw new NotFoundError('Campaign not found');
  }

  logger.info(`Campaign updated: ${id}`);
  return toCampaignResponse(updated);
};

export const updateCampaignWeek = async (
  campaignId: string,
  weekNumber: number,
  data: { mailingQuantity?: number; totalPayments?: number; inHomesWeekOf?: string; productService?: string | null },
): Promise<CampaignResponse> => {
  const campaign = await CampaignModel.findById(campaignId);
  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  const weekIndex = campaign.weeks.findIndex((w) => w.weekNumber === weekNumber);
  if (weekIndex === -1) {
    throw new ValidationError(`Week ${weekNumber} not found in campaign`);
  }

  if (data.mailingQuantity !== undefined) {
    campaign.weeks[weekIndex].mailingQuantity = data.mailingQuantity;
  }
  if (data.totalPayments !== undefined) {
    campaign.weeks[weekIndex].totalPayments = data.totalPayments;
  }
  if (data.inHomesWeekOf) {
    campaign.weeks[weekIndex].inHomesWeekOf = new Date(data.inHomesWeekOf);
  }
  if (data.productService !== undefined) {
    campaign.weeks[weekIndex].productService = data.productService
      ? new mongoose.Types.ObjectId(data.productService)
      : null;
  }

  await campaign.save();

  const populated = await CampaignModel.findById(campaignId).populate('vendor', 'name');
  if (!populated) {
    throw new NotFoundError('Campaign not found');
  }

  logger.info(`Campaign week ${weekNumber} updated: ${campaignId}`);
  return toCampaignResponse(populated);
};

export const updatePostcardImage = async (
  campaignId: string,
  imageUrl: string,
): Promise<CampaignResponse> => {
  const campaign = await CampaignModel.findByIdAndUpdate(
    campaignId,
    { postcardImageUrl: imageUrl },
    { new: true },
  ).populate('vendor', 'name');

  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  logger.info(`Campaign postcard image updated: ${campaignId}`);
  return toCampaignResponse(campaign);
};

export const deactivateCampaign = async (id: string): Promise<CampaignResponse> => {
  const campaign = await CampaignModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  ).populate('vendor', 'name');

  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  logger.info(`Campaign deactivated: ${id}`);
  return toCampaignResponse(campaign);
};

export const activateCampaign = async (id: string): Promise<CampaignResponse> => {
  const campaign = await CampaignModel.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true },
  ).populate('vendor', 'name');

  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  logger.info(`Campaign activated: ${id}`);
  return toCampaignResponse(campaign);
};

export const bulkDeactivateCampaigns = async (ids: string[]): Promise<number> => {
  const result = await CampaignModel.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: false } },
  );
  logger.info(`Bulk deactivated ${result.modifiedCount} campaigns`);
  return result.modifiedCount;
};
