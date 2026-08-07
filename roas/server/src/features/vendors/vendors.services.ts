import { VendorModel, IVendor } from './vendors.models';
import { UserModel } from '../users/users.models';
import { IPaginatedResult } from '../../types/common';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { generatePassword } from '../../utils/password';
import { sendEmail } from '../../utils/email';
import bcrypt from 'bcrypt';
import logger from '../../utils/logger';

const BCRYPT_ROUNDS = 12;

interface CreateVendorData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  createdBy: string;
}

interface ListVendorsParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  city?: string;
  state?: string;
}

interface VendorResponse {
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const toVendorResponse = (vendor: IVendor): VendorResponse => ({
  vendorId: vendor._id.toString(),
  name: vendor.name,
  email: vendor.email,
  phone: vendor.phone,
  address: vendor.address,
  city: vendor.city,
  state: vendor.state,
  zipCode: vendor.zipCode,
  contactPerson: vendor.contactPerson,
  isActive: vendor.isActive,
  createdBy: vendor.createdBy.toString(),
  createdAt: vendor.createdAt,
  updatedAt: vendor.updatedAt,
});

export const createVendor = async (data: CreateVendorData): Promise<VendorResponse> => {
  const existing = await VendorModel.findOne({ email: data.email });
  if (existing) {
    throw new ConflictError('Vendor with this email already exists');
  }

  // Generate credential password for the vendor user account
  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

  const vendor = await VendorModel.create({
    ...data,
    credentialPassword: plainPassword,
  });

  // Create a vendor user account linked to this vendor
  const existingUser = await UserModel.findOne({ email: data.email });
  if (!existingUser) {
    await UserModel.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.contactPerson.split(' ')[0] || data.name,
      lastName: data.contactPerson.split(' ').slice(1).join(' ') || '',
      role: 'vendor_user',
      vendor: vendor._id,
      createdBy: data.createdBy,
    });
  } else {
    // Link existing user to vendor if not already linked
    if (!existingUser.vendor) {
      existingUser.vendor = vendor._id;
      await existingUser.save();
    }
  }

  // Send credential email
  try {
    await sendEmail(
      data.email,
      'Your ROAS PrintFast Account Credentials',
      `Hello ${data.contactPerson},\n\nYour vendor account has been created on ROAS PrintFast.\n\nEmail: ${data.email}\nPassword: ${plainPassword}\n\nPlease login and change your password at your earliest convenience.\n\nBest regards,\nROAS PrintFast Team`,
    );
  } catch (error) {
    logger.warn(`Failed to send credential email to ${data.email}:`, error);
  }

  logger.info(`Vendor created: ${vendor._id}`);
  return toVendorResponse(vendor);
};

export const listVendors = async (
  params: ListVendorsParams,
): Promise<IPaginatedResult<VendorResponse>> => {
  const {
    page,
    limit,
    sort,
    order,
    search,
    isActive,
    name,
    email,
    phone,
    contactPerson,
    city,
    state,
  } = params;

  const filter: Record<string, unknown> = {};
  if (isActive !== undefined) {
    filter.isActive = isActive;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
    ];
  }

  // Column-level filters
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }
  if (email) {
    filter.email = { $regex: email, $options: 'i' };
  }
  if (phone) {
    filter.phone = { $regex: phone, $options: 'i' };
  }
  if (contactPerson) {
    filter.contactPerson = { $regex: contactPerson, $options: 'i' };
  }
  if (city) {
    filter.city = { $regex: city, $options: 'i' };
  }
  if (state) {
    filter.state = { $regex: state, $options: 'i' };
  }

  const totalItems = await VendorModel.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
  const skip = (page - 1) * limit;

  const vendors = await VendorModel.find(filter)
    .sort({ [sort]: order === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  return {
    items: vendors.map(toVendorResponse),
    totalItems,
    totalPages,
    currentPage: page,
    limit,
  };
};

export const getVendorById = async (id: string): Promise<VendorResponse> => {
  const vendor = await VendorModel.findById(id);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }
  return toVendorResponse(vendor);
};

export const updateVendor = async (
  id: string,
  data: Partial<CreateVendorData>,
): Promise<VendorResponse> => {
  if (data.email) {
    const existing = await VendorModel.findOne({ email: data.email, _id: { $ne: id } });
    if (existing) {
      throw new ConflictError('Vendor with this email already exists');
    }
  }

  const vendor = await VendorModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }
  logger.info(`Vendor updated: ${vendor._id}`);
  return toVendorResponse(vendor);
};

export const deactivateVendor = async (id: string): Promise<VendorResponse> => {
  const vendor = await VendorModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }
  logger.info(`Vendor deactivated: ${vendor._id}`);
  return toVendorResponse(vendor);
};

export const activateVendor = async (id: string): Promise<VendorResponse> => {
  const vendor = await VendorModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }
  logger.info(`Vendor activated: ${vendor._id}`);
  return toVendorResponse(vendor);
};

export const listAllActiveVendors = async (): Promise<VendorResponse[]> => {
  const vendors = await VendorModel.find({ isActive: true }).sort({ name: 1 });
  return vendors.map(toVendorResponse);
};

export const sendCredentials = async (id: string): Promise<void> => {
  const vendor = await VendorModel.findById(id).select('+credentialPassword');
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const password = vendor.credentialPassword;
  if (!password) {
    throw new NotFoundError('No stored credentials found for this vendor');
  }

  await sendEmail(
    vendor.email,
    'Your ROAS PrintFast Account Credentials',
    `Hello ${vendor.contactPerson},\n\nHere are your ROAS PrintFast credentials:\n\nEmail: ${vendor.email}\nPassword: ${password}\n\nPlease login and change your password at your earliest convenience.\n\nBest regards,\nROAS PrintFast Team`,
  );

  logger.info(`Credentials sent to vendor: ${id}`);
};

export const getVendorPassword = async (id: string): Promise<string> => {
  const vendor = await VendorModel.findById(id).select('+credentialPassword');
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  if (!vendor.credentialPassword) {
    throw new NotFoundError('No stored credentials found for this vendor');
  }

  return vendor.credentialPassword;
};

export const bulkDeactivateVendors = async (ids: string[]): Promise<number> => {
  const result = await VendorModel.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: false } },
  );
  logger.info(`Bulk deactivated ${result.modifiedCount} vendors`);
  return result.modifiedCount;
};
