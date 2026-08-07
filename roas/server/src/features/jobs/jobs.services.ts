import { JobModel } from './jobs.models';
import { IPaginatedResult } from '../../types/common';
import { NotFoundError } from '../../utils/errors';

interface JobResponse {
  jobId: string;
  vendorId: string;
  integrationId: string;
  source: string;
  externalId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  title: string;
  description?: string;
  status: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  completedAt?: Date;
  totalAmount: number;
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const toJobResponse = (job: InstanceType<typeof JobModel>): JobResponse => ({
  jobId: job._id.toString(),
  vendorId: job.vendor.toString(),
  integrationId: job.integration.toString(),
  source: job.source,
  externalId: job.externalId,
  customerName: job.customerName,
  customerEmail: job.customerEmail,
  customerPhone: job.customerPhone,
  customerAddress: job.customerAddress,
  title: job.title,
  description: job.description,
  status: job.status,
  scheduledStart: job.scheduledStart,
  scheduledEnd: job.scheduledEnd,
  completedAt: job.completedAt,
  totalAmount: job.totalAmount,
  lineItems: job.lineItems.map((li) => ({
    name: li.name,
    description: li.description,
    quantity: li.quantity,
    unitPrice: li.unitPrice,
    totalPrice: li.totalPrice,
  })),
  isActive: job.isActive,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

interface ListJobsParams {
  vendorId: string;
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  source?: string;
}

export const listJobs = async (
  params: ListJobsParams,
): Promise<IPaginatedResult<JobResponse>> => {
  const { vendorId, page, limit, sort, order, search, status, source } = params;

  const filter: Record<string, unknown> = { vendor: vendorId, isActive: true };

  if (status) filter.status = status;
  if (source) filter.source = source;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { externalId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };

  const [items, totalItems] = await Promise.all([
    JobModel.find(filter).sort(sortObj).skip(skip).limit(limit),
    JobModel.countDocuments(filter),
  ]);

  return {
    items: items.map(toJobResponse),
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    limit,
  };
};

export const getJobById = async (jobId: string): Promise<JobResponse> => {
  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new NotFoundError('Job not found');
  }
  return toJobResponse(job);
};
