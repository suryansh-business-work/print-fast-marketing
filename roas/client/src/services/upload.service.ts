import api from './api';
import { IApiResponse } from '../types/user.types';

export interface IUploadResult {
  url: string;
  fileId: string;
  name: string;
  filePath: string;
  thumbnailUrl: string;
}

export const uploadFile = async (
  file: File,
  folder: 'postcards' | 'profiles' | 'general' = 'general',
): Promise<IApiResponse<IUploadResult>> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<IApiResponse<IUploadResult>>(
    `/upload?folder=${folder}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};
