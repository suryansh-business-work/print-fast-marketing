import logger from '../../../utils/logger';

interface JobberTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface JobberJob {
  id: string;
  title: string;
  jobNumber?: number;
  instructions?: string;
  status: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  property?: {
    address?: {
      street1?: string;
      street2?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      country?: string;
    };
  };
  startAt?: string;
  endAt?: string;
  completedAt?: string;
  total?: number;
  lineItems?: Array<{
    name?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawNode?: Record<string, any>;
}

interface JobberInvoice {
  id: string;
  invoiceNumber: string;
  subject?: string;
  status: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  job?: {
    id: string;
  };
  issuedDate?: string;
  dueDate?: string;
  paidDate?: string;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  amountPaid?: number;
  amountOwing?: number;
  lineItems?: Array<{
    name?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawNode?: Record<string, any>;
}

interface JobberPaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
  endCursor?: string;
}

export interface JobberAppCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

const JOBBER_API_URL = 'https://api.getjobber.com/api/graphql';
const JOBBER_TOKEN_URL = 'https://api.getjobber.com/api/oauth/token';
const JOBBER_DEFAULT_REDIRECT_URI = 'http://localhost:9003/api/v1/integrations/jobber/callback';
const JOBBER_PAGE_SIZE = 20;
const JOBBER_MAX_RETRIES = 5;
const JOBBER_BASE_DELAY_MS = 2000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const getOAuthUrl = (vendorId: string, creds: JobberAppCredentials): string => {
  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: creds.redirectUri || JOBBER_DEFAULT_REDIRECT_URI,
    response_type: 'code',
    state: vendorId,
  });
  return `https://api.getjobber.com/api/oauth/authorize?${params.toString()}`;
};

export const exchangeCodeForTokens = async (
  code: string,
  creds: JobberAppCredentials,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await fetch(JOBBER_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: creds.redirectUri || JOBBER_DEFAULT_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Jobber token exchange failed:', errorText);
    throw new Error('Failed to exchange Jobber OAuth code for tokens');
  }

  const data = (await response.json()) as JobberTokenResponse;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
};

export const refreshAccessToken = async (
  refreshToken: string,
  creds: JobberAppCredentials,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await fetch(JOBBER_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Jobber token refresh failed:', errorText);
    throw new Error('Failed to refresh Jobber token');
  }

  const data = (await response.json()) as JobberTokenResponse;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
};

const graphqlRequest = async <T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> => {
  for (let attempt = 0; attempt <= JOBBER_MAX_RETRIES; attempt++) {
    const response = await fetch(JOBBER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-JOBBER-GRAPHQL-VERSION': '2025-01-20',
      },
      body: JSON.stringify({ query, variables }),
    });

    // Handle HTTP-level rate limiting (429)
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : JOBBER_BASE_DELAY_MS * Math.pow(2, attempt);
      logger.warn(`Jobber rate limited (HTTP 429), retrying in ${waitMs}ms (attempt ${attempt + 1}/${JOBBER_MAX_RETRIES})`);
      await sleep(waitMs);
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Jobber GraphQL request failed [${response.status} ${response.statusText}]:`, errorText || '(empty body)');
      throw new Error(`Jobber API request failed with status ${response.status}: ${errorText || response.statusText}`);
    }

    const responseText = await response.text();
    let result: { data: T; errors?: Array<{ message: string; extensions?: Record<string, unknown> }> };

    try {
      result = JSON.parse(responseText) as { data: T; errors?: Array<{ message: string; extensions?: Record<string, unknown> }> };
    } catch {
      logger.error('Jobber GraphQL response is not valid JSON:', responseText.substring(0, 500));
      throw new Error('Jobber API returned invalid JSON response');
    }

    // Handle GraphQL-level throttling
    if (result.errors && result.errors.length > 0) {
      const isThrottled = result.errors.some((e) => e.message?.toLowerCase().includes('throttled'));
      if (isThrottled && attempt < JOBBER_MAX_RETRIES) {
        const waitMs = JOBBER_BASE_DELAY_MS * Math.pow(2, attempt);
        logger.warn(`Jobber API throttled, retrying in ${waitMs}ms (attempt ${attempt + 1}/${JOBBER_MAX_RETRIES})`);
        await sleep(waitMs);
        continue;
      }

      logger.error('Jobber GraphQL errors:', JSON.stringify(result.errors));
      throw new Error(`Jobber GraphQL error: ${result.errors[0].message}`);
    }

    return result.data;
  }

  throw new Error('Jobber API request failed: max retries exceeded due to throttling');
};

export const fetchJobs = async (
  accessToken: string,
  after?: string,
): Promise<JobberPaginatedResponse<JobberJob>> => {
  // Minimal safe query — only fields confirmed in Jobber's GraphQL schema
  const query = `
    query FetchJobs($first: Int!, $after: String) {
      jobs(first: $first, after: $after) {
        nodes {
          id
          title
          jobNumber
          instructions
          jobStatus
          client {
            id
            name
          }
          property {
            address {
              street1
              street2
              city
              province
              postalCode
              country
            }
          }
          startAt
          endAt
          completedAt
          total
          lineItems {
            nodes {
              name
              description
              quantity
              unitPrice
              totalPrice
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await graphqlRequest<{ jobs: { nodes: any[]; pageInfo: { hasNextPage: boolean; endCursor?: string } } }>(
    accessToken,
    query,
    { first: JOBBER_PAGE_SIZE, after },
  );

  const jobs: JobberJob[] = data.jobs.nodes.map((node) => {
    return {
      id: node.id,
      title: node.title || '',
      jobNumber: node.jobNumber,
      instructions: node.instructions,
      status: node.jobStatus || '',
      client: node.client
        ? {
            id: node.client.id,
            name: node.client.name || 'Unknown',
            email: undefined,
            phone: undefined,
          }
        : undefined,
      property: node.property,
      startAt: node.startAt,
      endAt: node.endAt,
      completedAt: node.completedAt,
      total: node.total,
      lineItems: node.lineItems?.nodes,
      rawNode: node,
    };
  });

  return {
    data: jobs,
    hasNextPage: data.jobs.pageInfo.hasNextPage,
    endCursor: data.jobs.pageInfo.endCursor,
  };
};

export const fetchInvoices = async (
  accessToken: string,
  after?: string,
): Promise<JobberPaginatedResponse<JobberInvoice>> => {
  // Minimal safe query — only fields confirmed in Jobber's GraphQL schema
  const query = `
    query FetchInvoices($first: Int!, $after: String) {
      invoices(first: $first, after: $after) {
        nodes {
          id
          invoiceNumber
          subject
          invoiceStatus
          client {
            id
            name
          }
          jobs {
            nodes { id }
          }
          issuedDate
          dueDate
          paidDate
          amounts {
            subtotal
            total
            taxAmount
            depositAmount
            paymentsTotal
            discountAmount
            invoiceBalance
          }
          lineItems {
            nodes {
              name
              description
              quantity
              unitPrice
              totalPrice
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await graphqlRequest<{ invoices: { nodes: any[]; pageInfo: { hasNextPage: boolean; endCursor?: string } } }>(
    accessToken,
    query,
    { first: JOBBER_PAGE_SIZE, after },
  );

  const invoices: JobberInvoice[] = data.invoices.nodes.map((node) => {
    return {
      id: node.id,
      invoiceNumber: node.invoiceNumber || node.id,
      subject: node.subject,
      status: node.invoiceStatus || '',
      client: node.client
        ? {
            id: node.client.id,
            name: node.client.name || 'Unknown',
            email: undefined,
            phone: undefined,
          }
        : undefined,
      job: node.jobs?.nodes?.[0] ? { id: node.jobs.nodes[0].id } : undefined,
      issuedDate: node.issuedDate,
      dueDate: node.dueDate,
      paidDate: node.paidDate,
      subtotal: node.amounts?.subtotal,
      taxAmount: node.amounts?.taxAmount,
      total: node.amounts?.total,
      amountPaid: node.amounts?.paymentsTotal,
      amountOwing: node.amounts?.invoiceBalance,
      lineItems: node.lineItems?.nodes,
      rawNode: node,
    };
  });

  return {
    data: invoices,
    hasNextPage: data.invoices.pageInfo.hasNextPage,
    endCursor: data.invoices.pageInfo.endCursor,
  };
};

export type { JobberJob, JobberInvoice };
