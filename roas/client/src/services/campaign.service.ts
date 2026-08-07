import api from './api';
import { IApiResponse, IPaginatedResult } from '../types/user.types';
import {
  ICampaignListItem,
  ICampaignDetail,
  ICreateCampaignPayload,
  IUpdateCampaignPayload,
} from '../types/campaign.types';

interface ListCampaignsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, string>;
}

export const listCampaigns = async (
  params: ListCampaignsParams,
): Promise<IApiResponse<IPaginatedResult<ICampaignListItem>>> => {
  const { filters, ...rest } = params;
  const queryParams: Record<string, unknown> = { ...rest };
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams[key] = value;
      }
    });
  }
  const response = await api.get<IApiResponse<IPaginatedResult<ICampaignListItem>>>('/campaigns', {
    params: queryParams,
  });
  return response.data;
};

export const getCampaignById = async (id: string): Promise<IApiResponse<ICampaignDetail>> => {
  const response = await api.get<IApiResponse<ICampaignDetail>>(`/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (
  payload: ICreateCampaignPayload,
): Promise<IApiResponse<ICampaignDetail>> => {
  const response = await api.post<IApiResponse<ICampaignDetail>>('/campaigns', payload);
  return response.data;
};

export const updateCampaign = async (
  id: string,
  payload: IUpdateCampaignPayload,
): Promise<IApiResponse<ICampaignDetail>> => {
  const response = await api.patch<IApiResponse<ICampaignDetail>>(`/campaigns/${id}`, payload);
  return response.data;
};

export const uploadPostcardPdf = async (
  id: string,
  file: File,
): Promise<IApiResponse<ICampaignDetail>> => {
  const formData = new FormData();
  formData.append('postcardImage', file);
  const response = await api.post<IApiResponse<ICampaignDetail>>(
    `/campaigns/${id}/postcard-image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

export const deactivateCampaign = async (id: string): Promise<IApiResponse<ICampaignDetail>> => {
  const response = await api.patch<IApiResponse<ICampaignDetail>>(`/campaigns/${id}/deactivate`);
  return response.data;
};

export const activateCampaign = async (id: string): Promise<IApiResponse<ICampaignDetail>> => {
  const response = await api.patch<IApiResponse<ICampaignDetail>>(`/campaigns/${id}/activate`);
  return response.data;
};

export const bulkDeactivateCampaigns = async (
  ids: string[],
): Promise<IApiResponse<{ deactivatedCount: number }>> => {
  const response = await api.post<IApiResponse<{ deactivatedCount: number }>>(
    '/campaigns/bulk-deactivate',
    { ids },
  );
  return response.data;
};
