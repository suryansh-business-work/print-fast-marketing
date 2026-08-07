export enum UserRole {
  GOD_USER = 'god_user',
  ADMIN_USER = 'admin_user',
  VENDOR_USER = 'vendor_user',
}

export interface IUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  vendorId: string | null;
}

export interface IAuthUser extends IUser {
  token: string;
}

export interface IUserDetail extends IUser {
  isActive: boolean;
  createdBy: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ISignupPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole.ADMIN_USER | UserRole.VENDOR_USER;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ICreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole.ADMIN_USER | UserRole.VENDOR_USER;
}

export interface ICreateUserResponse extends IUserDetail {
  generatedPassword?: string;
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

export interface IPaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface IPublicConfig {
  allowAdminSignup: boolean;
  allowSendGodCredentials: boolean;
}
