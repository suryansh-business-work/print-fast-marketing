import { Request, Response, NextFunction } from 'express';
import * as jobsService from './jobs.services';
import { sendSuccess } from '../../utils/response';
import { JobsListQuery } from './jobs.validators';

export const listJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const vendorId = req.params.vendorId as string;
    const query = req.query as unknown as JobsListQuery;

    const result = await jobsService.listJobs({
      vendorId,
      page: parseInt(query.page || '1', 10),
      limit: parseInt(query.limit || '10', 10),
      sort: query.sort || 'createdAt',
      order: (query.order as 'asc' | 'desc') || 'desc',
      search: query.search,
      status: query.status,
      source: query.source,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const jobId = req.params.jobId as string;
    const job = await jobsService.getJobById(jobId);
    sendSuccess(res, job);
  } catch (error) {
    next(error);
  }
};
