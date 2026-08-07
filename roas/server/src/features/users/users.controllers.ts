import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.services';
import { sendSuccess } from '../../utils/response';
import { CreateUserInput, UpdateUserInput, ListUsersQuery, BulkDeactivateInput } from './users.validators';
import { UserRole } from '../../types/enums';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as CreateUserInput;
    const creatorId = req.user!.userId;
    const creatorRole = req.user!.role;

    const user = await usersService.createUser(
      {
        ...data,
        createdBy: creatorId,
      },
      creatorRole,
    );

    sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as unknown as ListUsersQuery;

    const result = await usersService.listUsers({
      page: parseInt(query.page || '1', 10),
      limit: parseInt(query.limit || '10', 10),
      sort: query.sort || 'createdAt',
      order: query.order || 'desc',
      search: query.search,
      role: query.role as UserRole | undefined,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
      firstName: query.firstName,
      lastName: query.lastName,
      email: query.email,
      requesterRole: req.user!.role,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.getUserById(req.params.id as string);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdateUserInput;
    const user = await usersService.updateUser(req.params.id as string, data);
    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.deactivateUser(req.params.id as string);
    sendSuccess(res, user, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};

export const activateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.activateUser(req.params.id as string);
    sendSuccess(res, user, 'User activated successfully');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.getUserById(req.user!.userId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdateUserInput;
    const userId = req.user!.userId;
    const user = await usersService.updateUser(userId, data);

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const bulkDeactivateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { ids } = req.body as BulkDeactivateInput;
    const count = await usersService.bulkDeactivateUsers(ids);
    sendSuccess(res, { deactivatedCount: count }, `${count} users deactivated successfully`);
  } catch (error) {
    next(error);
  }
};
