import { UserRole } from './enums';

export interface ISessionUser {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  vendorId: string | null;
}

export interface IApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface IPaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface IPaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
