import api from './api';
import { IApiResponse, IPublicConfig } from '../types/user.types';

export const getPublicConfig = async (): Promise<IApiResponse<IPublicConfig>> => {
  const response = await api.get<IApiResponse<IPublicConfig>>('/config/public');
  return response.data;
};
