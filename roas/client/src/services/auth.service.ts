import api from './api';
import { setStoredToken, removeStoredToken } from './api';
import {
  IApiResponse,
  IUser,
  IAuthUser,
  ILoginPayload,
  ISignupPayload,
  IChangePasswordPayload,
} from '../types/user.types';

export const login = async (payload: ILoginPayload): Promise<IApiResponse<IAuthUser>> => {
  const response = await api.post<IApiResponse<IAuthUser>>('/auth/login', payload);
  if (response.data.success && response.data.data?.token) {
    setStoredToken(response.data.data.token);
  }
  return response.data;
};

export const signup = async (payload: ISignupPayload): Promise<IApiResponse<IAuthUser>> => {
  const response = await api.post<IApiResponse<IAuthUser>>('/auth/signup', payload);
  if (response.data.success && response.data.data?.token) {
    setStoredToken(response.data.data.token);
  }
  return response.data;
};

export const logout = async (): Promise<IApiResponse> => {
  const response = await api.post<IApiResponse>('/auth/logout');
  removeStoredToken();
  return response.data;
};

export const getMe = async (): Promise<IApiResponse<IUser>> => {
  const response = await api.get<IApiResponse<IUser>>('/auth/me');
  return response.data;
};

export const changePassword = async (payload: IChangePasswordPayload): Promise<IApiResponse> => {
  const response = await api.post<IApiResponse>('/auth/change-password', payload);
  return response.data;
};

export const sendSuperAdminCredentials = async (): Promise<IApiResponse> => {
  const response = await api.post<IApiResponse>('/auth/send-god-user-credentials');
  return response.data;
};
