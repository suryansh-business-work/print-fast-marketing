import api from './api';
import { IApiResponse, IPaginatedResult } from '../types/user.types';
import { IClient, IClientDetail, ICreateClientPayload, IUpdateClientPayload } from '../types/client.types';

interface ListClientsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  vendor?: string;
  filters?: Record<string, string>;
}

export const listClients = async (
  params: ListClientsParams,
): Promise<IApiResponse<IPaginatedResult<IClient>>> => {
  const { filters, ...rest } = params;
  const queryParams: Record<string, unknown> = { ...rest };
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams[key] = value;
      }
    });
  }
  const response = await api.get<IApiResponse<IPaginatedResult<IClient>>>('/clients', {
    params: queryParams,
  });
  return response.data;
};

export const getClientById = async (id: string): Promise<IApiResponse<IClientDetail>> => {
  const response = await api.get<IApiResponse<IClientDetail>>(`/clients/${id}`);
  return response.data;
};

export const createClient = async (
  payload: ICreateClientPayload,
): Promise<IApiResponse<IClientDetail>> => {
  const response = await api.post<IApiResponse<IClientDetail>>('/clients', payload);
  return response.data;
};

export const updateClient = async (
  id: string,
  payload: IUpdateClientPayload,
): Promise<IApiResponse<IClientDetail>> => {
  const response = await api.patch<IApiResponse<IClientDetail>>(`/clients/${id}`, payload);
  return response.data;
};

export const deactivateClient = async (id: string): Promise<IApiResponse<IClientDetail>> => {
  const response = await api.patch<IApiResponse<IClientDetail>>(`/clients/${id}/deactivate`);
  return response.data;
};

export const activateClient = async (id: string): Promise<IApiResponse<IClientDetail>> => {
  const response = await api.patch<IApiResponse<IClientDetail>>(`/clients/${id}/activate`);
  return response.data;
};

export const bulkDeactivateClients = async (
  ids: string[],
): Promise<IApiResponse<{ deactivatedCount: number }>> => {
  const response = await api.post<IApiResponse<{ deactivatedCount: number }>>(
    '/clients/bulk-deactivate',
    { ids },
  );
  return response.data;
};
