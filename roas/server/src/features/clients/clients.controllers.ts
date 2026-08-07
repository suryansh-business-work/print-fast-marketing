import { Request, Response, NextFunction } from 'express';
import * as clientsService from './clients.services';
import { sendSuccess } from '../../utils/response';
import { CreateClientInput, UpdateClientInput, ListClientsQuery, BulkDeactivateInput } from './clients.validators';

export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as CreateClientInput;
    const creatorId = req.user!.userId;

    const client = await clientsService.createClient({
      ...data,
      createdBy: creatorId,
    });

    sendSuccess(res, client, 'Client created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listClients = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query as unknown as ListClientsQuery;

    const result = await clientsService.listClients({
      page: parseInt(query.page || '1', 10),
      limit: parseInt(query.limit || '10', 10),
      sort: query.sort || 'createdAt',
      order: query.order || 'desc',
      search: query.search,
      vendor: query.vendor,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
      name: query.name,
      email: query.email,
      label: query.label,
      category: query.category,
      tag: query.tag,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const client = await clientsService.getClientById(req.params.id as string);
    sendSuccess(res, client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as UpdateClientInput;
    const client = await clientsService.updateClient(req.params.id as string, data);
    sendSuccess(res, client, 'Client updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deactivateClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const client = await clientsService.deactivateClient(req.params.id as string);
    sendSuccess(res, client, 'Client deactivated successfully');
  } catch (error) {
    next(error);
  }
};

export const activateClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const client = await clientsService.activateClient(req.params.id as string);
    sendSuccess(res, client, 'Client activated successfully');
  } catch (error) {
    next(error);
  }
};

export const bulkDeactivateClients = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { ids } = req.body as BulkDeactivateInput;
    const count = await clientsService.bulkDeactivateClients(ids);
    sendSuccess(res, { deactivatedCount: count }, `${count} clients deactivated successfully`);
  } catch (error) {
    next(error);
  }
};
