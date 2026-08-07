import api from './api';
import { IApiResponse, IPaginatedResult } from '../types/user.types';
import { IPostcard, IPostcardDetail, ICreatePostcardPayload, IUpdatePostcardPayload } from '../types/postcard.types';

interface ListPostcardsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  vendor?: string;
  filters?: Record<string, string>;
}

export const listPostcards = async (
  params: ListPostcardsParams,
): Promise<IApiResponse<IPaginatedResult<IPostcard>>> => {
  const { filters, ...rest } = params;
  const queryParams: Record<string, unknown> = { ...rest };
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams[key] = value;
      }
    });
  }
  const response = await api.get<IApiResponse<IPaginatedResult<IPostcard>>>('/postcards', {
    params: queryParams,
  });
  return response.data;
};

export const getPostcardById = async (id: string): Promise<IApiResponse<IPostcardDetail>> => {
  const response = await api.get<IApiResponse<IPostcardDetail>>(`/postcards/${id}`);
  return response.data;
};

export const createPostcard = async (
  payload: ICreatePostcardPayload,
): Promise<IApiResponse<IPostcardDetail>> => {
  const response = await api.post<IApiResponse<IPostcardDetail>>('/postcards', payload);
  return response.data;
};

export const updatePostcard = async (
  id: string,
  payload: IUpdatePostcardPayload,
): Promise<IApiResponse<IPostcardDetail>> => {
  const response = await api.patch<IApiResponse<IPostcardDetail>>(`/postcards/${id}`, payload);
  return response.data;
};

export const deactivatePostcard = async (id: string): Promise<IApiResponse<IPostcardDetail>> => {
  const response = await api.patch<IApiResponse<IPostcardDetail>>(`/postcards/${id}/deactivate`);
  return response.data;
};

export const activatePostcard = async (id: string): Promise<IApiResponse<IPostcardDetail>> => {
  const response = await api.patch<IApiResponse<IPostcardDetail>>(`/postcards/${id}/activate`);
  return response.data;
};

export const bulkDeactivatePostcards = async (
  ids: string[],
): Promise<IApiResponse<{ deactivatedCount: number }>> => {
  const response = await api.post<IApiResponse<{ deactivatedCount: number }>>(
    '/postcards/bulk-deactivate',
    { ids },
  );
  return response.data;
};
