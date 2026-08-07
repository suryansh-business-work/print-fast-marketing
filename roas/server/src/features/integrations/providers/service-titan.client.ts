import config from '../../../config/config';
import logger from '../../../utils/logger';

interface ServiceTitanTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ServiceTitanJob {
  id: number;
  number: string;
  summary?: string;
  status: string;
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  location?: {
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  scheduledOn?: string;
  completedOn?: string;
  total?: number;
  items?: Array<{
    skuName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface ServiceTitanInvoice {
  id: number;
  number: string;
  status: string;
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  job?: {
    id: number;
  };
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: number;
  salesTax?: number;
  total?: number;
  balance?: number;
  items?: Array<{
    skuName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface ServiceTitanPaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  continueFrom?: string;
}

export const authenticate = async (
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; expiresAt: Date }> => {
  const response = await fetch(config.serviceTitanAuthUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('ServiceTitan authentication failed:', errorText);
    throw new Error('Failed to authenticate with ServiceTitan');
  }

  const data = (await response.json()) as ServiceTitanTokenResponse;
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  return {
    accessToken: data.access_token,
    expiresAt,
  };
};

const apiRequest = async <T>(
  accessToken: string,
  tenantId: string,
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> => {
  const url = new URL(`${config.serviceTitanApiUrl}/v2/tenant/${tenantId}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'ST-App-Key': config.serviceTitanAppKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`ServiceTitan API request failed for ${endpoint}:`, errorText);
    throw new Error(`ServiceTitan API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};

export const fetchJobs = async (
  accessToken: string,
  tenantId: string,
  continueFrom?: string,
): Promise<ServiceTitanPaginatedResponse<ServiceTitanJob>> => {
  const params: Record<string, string> = { pageSize: '50' };
  if (continueFrom) {
    params.page = continueFrom;
  }

  const data = await apiRequest<{
    data: Array<{
      id: number;
      number: string;
      summary?: string;
      jobStatus: string;
      customer?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
        address?: {
          street: string;
          city: string;
          state: string;
          zip: string;
          country: string;
        };
      };
      location?: {
        address?: {
          street: string;
          city: string;
          state: string;
          zip: string;
          country: string;
        };
      };
      scheduledOn?: string;
      completedOn?: string;
      total?: number;
      items?: Array<{
        skuName: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    }>;
    hasMore: boolean;
    continueFrom?: string;
  }>(accessToken, tenantId, '/jpm/v2/jobs', params);

  const jobs: ServiceTitanJob[] = data.data.map((job) => ({
    id: job.id,
    number: job.number,
    summary: job.summary,
    status: job.jobStatus,
    customer: job.customer,
    location: job.location,
    scheduledOn: job.scheduledOn,
    completedOn: job.completedOn,
    total: job.total,
    items: job.items,
  }));

  return {
    data: jobs,
    hasMore: data.hasMore,
    continueFrom: data.continueFrom,
  };
};

export const fetchInvoices = async (
  accessToken: string,
  tenantId: string,
  continueFrom?: string,
): Promise<ServiceTitanPaginatedResponse<ServiceTitanInvoice>> => {
  const params: Record<string, string> = { pageSize: '50' };
  if (continueFrom) {
    params.page = continueFrom;
  }

  const data = await apiRequest<{
    data: Array<{
      id: number;
      number: string;
      status: string;
      customer?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
      };
      job?: {
        id: number;
      };
      invoiceDate?: string;
      dueDate?: string;
      subtotal?: number;
      salesTax?: number;
      total?: number;
      balance?: number;
      items?: Array<{
        skuName: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    }>;
    hasMore: boolean;
    continueFrom?: string;
  }>(accessToken, tenantId, '/accounting/v2/invoices', params);

  const invoices: ServiceTitanInvoice[] = data.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    customer: inv.customer,
    job: inv.job,
    invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate,
    subtotal: inv.subtotal,
    salesTax: inv.salesTax,
    total: inv.total,
    balance: inv.balance,
    items: inv.items,
  }));

  return {
    data: invoices,
    hasMore: data.hasMore,
    continueFrom: data.continueFrom,
  };
};

export type { ServiceTitanJob, ServiceTitanInvoice };
