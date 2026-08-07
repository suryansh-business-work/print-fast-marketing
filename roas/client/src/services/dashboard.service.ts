import api from './api';
import { IApiResponse } from '../types/user.types';
import { IVendorDashboardStats, IAdminDashboardStats } from '../types/dashboard.types';

export const getDashboardStats = async (): Promise<
  IApiResponse<IVendorDashboardStats | IAdminDashboardStats>
> => {
  const response = await api.get<IApiResponse<IVendorDashboardStats | IAdminDashboardStats>>(
    '/dashboard/stats',
  );
  return response.data;
};
