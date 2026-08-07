import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.services';
import { sendSuccess } from '../../utils/response';
import { signToken } from '../../utils/jwt';
import { LoginInput, SignupInput, ChangePasswordInput } from './auth.validators';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;
    const user = await authService.loginUser(email, password);
    const token = signToken(user);

    sendSuccess(res, { ...user, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body as SignupInput;
    const user = await authService.signupUser({
      email,
      password,
      firstName,
      lastName,
      role,
    });
    const token = signToken(user);

    sendSuccess(res, { ...user, token }, 'Account created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, undefined, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, req.user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;
    const userId = req.user!.userId;

    await authService.changePassword(userId, currentPassword, newPassword);

    sendSuccess(res, undefined, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const sendGodUserCredentials = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await authService.sendGodUserCredentials();
    sendSuccess(res, undefined, 'Credentials sent to Super Admin email.');
  } catch (error) {
    next(error);
  }
};
