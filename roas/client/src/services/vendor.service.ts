import api from './api';
import { IApiResponse, IPaginatedResult } from '../types/user.types';
import { IVendor, ICreateVendorPayload, IUpdateVendorPayload } from '../types/vendor.types';

interface ListVendorsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, string>;
}

export const listVendors = async (
  params: ListVendorsParams,
): Promise<IApiResponse<IPaginatedResult<IVendor>>> => {
  const { filters, ...rest } = params;
  const queryParams: Record<string, unknown> = { ...rest };
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams[key] = value;
      }
    });
  }
  const response = await api.get<IApiResponse<IPaginatedResult<IVendor>>>('/vendors', {
    params: queryParams,
  });
  return response.data;
};

export const getVendorById = async (id: string): Promise<IApiResponse<IVendor>> => {
  const response = await api.get<IApiResponse<IVendor>>(`/vendors/${id}`);
  return response.data;
};

export const createVendor = async (data: ICreateVendorPayload): Promise<IApiResponse<IVendor>> => {
  const response = await api.post<IApiResponse<IVendor>>('/vendors', data);
  return response.data;
};

export const updateVendor = async (
  id: string,
  data: IUpdateVendorPayload,
): Promise<IApiResponse<IVendor>> => {
  const response = await api.patch<IApiResponse<IVendor>>(`/vendors/${id}`, data);
  return response.data;
};

export const deactivateVendor = async (id: string): Promise<IApiResponse<IVendor>> => {
  const response = await api.patch<IApiResponse<IVendor>>(`/vendors/${id}/deactivate`);
  return response.data;
};

export const activateVendor = async (id: string): Promise<IApiResponse<IVendor>> => {
  const response = await api.patch<IApiResponse<IVendor>>(`/vendors/${id}/activate`);
  return response.data;
};

export const listAllActiveVendors = async (): Promise<IApiResponse<IVendor[]>> => {
  const response = await api.get<IApiResponse<IVendor[]>>('/vendors/all-active');
  return response.data;
};

export const sendCredentials = async (id: string): Promise<IApiResponse<undefined>> => {
  const response = await api.post<IApiResponse<undefined>>(`/vendors/${id}/send-credentials`);
  return response.data;
};

export const getVendorPassword = async (
  id: string,
): Promise<IApiResponse<{ password: string }>> => {
  const response = await api.get<IApiResponse<{ password: string }>>(`/vendors/${id}/password`);
  return response.data;
};

export const bulkDeactivateVendors = async (
  ids: string[],
): Promise<IApiResponse<{ deactivatedCount: number }>> => {
  const response = await api.post<IApiResponse<{ deactivatedCount: number }>>(
    '/vendors/bulk-deactivate',
    { ids },
  );
  return response.data;
};
