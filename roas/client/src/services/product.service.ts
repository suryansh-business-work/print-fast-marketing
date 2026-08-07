import api from './api';
import { IApiResponse, IPaginatedResult } from '../types/user.types';
import { IProduct, IProductDetail, ICreateProductPayload, IUpdateProductPayload } from '../types/product.types';

interface ListProductsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  vendor?: string;
  filters?: Record<string, string>;
}

export const listProducts = async (
  params: ListProductsParams,
): Promise<IApiResponse<IPaginatedResult<IProduct>>> => {
  const { filters, ...rest } = params;
  const queryParams: Record<string, unknown> = { ...rest };
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams[key] = value;
      }
    });
  }
  const response = await api.get<IApiResponse<IPaginatedResult<IProduct>>>('/products', {
    params: queryParams,
  });
  return response.data;
};

export const getProductById = async (id: string): Promise<IApiResponse<IProductDetail>> => {
  const response = await api.get<IApiResponse<IProductDetail>>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (
  payload: ICreateProductPayload,
): Promise<IApiResponse<IProductDetail>> => {
  const response = await api.post<IApiResponse<IProductDetail>>('/products', payload);
  return response.data;
};

export const updateProduct = async (
  id: string,
  payload: IUpdateProductPayload,
): Promise<IApiResponse<IProductDetail>> => {
  const response = await api.patch<IApiResponse<IProductDetail>>(`/products/${id}`, payload);
  return response.data;
};

export const deactivateProduct = async (id: string): Promise<IApiResponse<IProductDetail>> => {
  const response = await api.patch<IApiResponse<IProductDetail>>(`/products/${id}/deactivate`);
  return response.data;
};

export const activateProduct = async (id: string): Promise<IApiResponse<IProductDetail>> => {
  const response = await api.patch<IApiResponse<IProductDetail>>(`/products/${id}/activate`);
  return response.data;
};

export const listAllActiveProducts = async (
  vendorId?: string,
): Promise<IApiResponse<IProduct[]>> => {
  const response = await api.get<IApiResponse<IProduct[]>>('/products/all-active', {
    params: vendorId ? { vendor: vendorId } : {},
  });
  return response.data;
};

export const bulkDeactivateProducts = async (
  ids: string[],
): Promise<IApiResponse<{ deactivatedCount: number }>> => {
  const response = await api.post<IApiResponse<{ deactivatedCount: number }>>(
    '/products/bulk-deactivate',
    { ids },
  );
  return response.data;
};
