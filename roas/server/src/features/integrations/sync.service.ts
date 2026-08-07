import {
  IntegrationModel,
  IIntegration,
  IntegrationProvider,
  IntegrationStatus,
} from './integrations.models';
import { JobModel, JobSource, JobStatus } from '../jobs/jobs.models';
import { InvoiceModel, InvoiceSource, InvoiceStatus } from '../invoices/invoices.models';
import * as jobberClient from './providers/jobber.client';
import * as serviceTitanClient from './providers/service-titan.client';
import logger from '../../utils/logger';

const JOBBER_STATUS_MAP: Record<string, JobStatus> = {
  active: JobStatus.IN_PROGRESS,
  completed: JobStatus.COMPLETED,
  cancelled: JobStatus.CANCELLED,
  archived: JobStatus.COMPLETED,
  upcoming: JobStatus.SCHEDULED,
  unscheduled: JobStatus.PENDING,
  today: JobStatus.SCHEDULED,
  requires_invoicing: JobStatus.COMPLETED,
  overdue: JobStatus.IN_PROGRESS,
  late: JobStatus.IN_PROGRESS,
  on_hold: JobStatus.PENDING,
  action_required: JobStatus.IN_PROGRESS,
};

const ST_JOB_STATUS_MAP: Record<string, JobStatus> = {
  Pending: JobStatus.PENDING,
  Scheduled: JobStatus.SCHEDULED,
  InProgress: JobStatus.IN_PROGRESS,
  Completed: JobStatus.COMPLETED,
  Canceled: JobStatus.CANCELLED,
  Hold: JobStatus.PENDING,
};

const JOBBER_INVOICE_STATUS_MAP: Record<string, InvoiceStatus> = {
  draft: InvoiceStatus.DRAFT,
  awaiting_payment: InvoiceStatus.SENT,
  paid: InvoiceStatus.PAID,
  past_due: InvoiceStatus.OVERDUE,
  bad_debt: InvoiceStatus.VOID,
};

const ST_INVOICE_STATUS_MAP: Record<string, InvoiceStatus> = {
  Pending: InvoiceStatus.DRAFT,
  Open: InvoiceStatus.SENT,
  Paid: InvoiceStatus.PAID,
  Void: InvoiceStatus.VOID,
  WrittenOff: InvoiceStatus.VOID,
};

const getIntegrationWithCredentials = async (
  integrationId: string,
): Promise<IIntegration | null> => {
  return IntegrationModel.findById(integrationId)
    .select('+credentials.accessToken +credentials.refreshToken +credentials.tokenExpiresAt +credentials.tenantId +credentials.clientId +credentials.clientSecret +credentials.environment +credentials.redirectUri')
    .exec();
};

const ensureJobberToken = async (integration: IIntegration): Promise<string> => {
  const creds = integration.credentials;
  if (!creds.accessToken) {
    throw new Error('No Jobber access token available');
  }

  return creds.accessToken;
};

const ensureServiceTitanToken = async (integration: IIntegration): Promise<string> => {
  const creds = integration.credentials;

  if (creds.accessToken && creds.tokenExpiresAt && new Date(creds.tokenExpiresAt) > new Date()) {
    return creds.accessToken;
  }

  if (!creds.clientId || !creds.clientSecret) {
    throw new Error('ServiceTitan credentials missing');
  }

  logger.info(`Authenticating ServiceTitan for integration ${integration._id}`);
  const authResult = await serviceTitanClient.authenticate(creds.clientId, creds.clientSecret);

  await IntegrationModel.findByIdAndUpdate(integration._id, {
    'credentials.accessToken': authResult.accessToken,
    'credentials.tokenExpiresAt': authResult.expiresAt,
  });

  return authResult.accessToken;
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const syncJobberJobs = async (integration: IIntegration, accessToken: string): Promise<number> => {
  let synced = 0;
  let after: string | undefined;

  do {
    const result = await jobberClient.fetchJobs(accessToken, after);

    for (const job of result.data) {
      try {
        const addressParts = job.property?.address;
        const street = [addressParts?.street1, addressParts?.street2].filter(Boolean).join(', ');
        const address = addressParts
          ? `${street}, ${addressParts.city || ''}, ${addressParts.province || ''} ${addressParts.postalCode || ''}`.trim()
          : undefined;

        await JobModel.findOneAndUpdate(
          {
            vendor: integration.vendor,
            source: JobSource.JOBBER,
            externalId: job.id,
          },
          {
            integration: integration._id,
            customerName: job.client?.name || 'Unknown',
            customerEmail: job.client?.email || undefined,
            customerPhone: job.client?.phone || undefined,
            customerAddress: address,
            title: job.title || `Job ${job.id}`,
            description: job.instructions || undefined,
            status: JOBBER_STATUS_MAP[job.status?.toLowerCase()] || JobStatus.PENDING,
            scheduledStart: job.startAt ? new Date(job.startAt) : undefined,
            scheduledEnd: job.endAt ? new Date(job.endAt) : undefined,
            completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
            totalAmount: job.total || 0,
            lineItems: (job.lineItems || []).map((li) => ({
              name: li.name || 'Item',
              description: li.description,
              quantity: li.quantity || 1,
              unitPrice: li.unitPrice || 0,
              totalPrice: li.totalPrice || 0,
            })),
            rawData: job.rawNode || job,
            isActive: true,
          },
          { upsert: true, new: true },
        );
        synced++;
      } catch (err) {
        logger.error(`Failed to sync Jobber job ${job.id}:`, err);
      }
    }

    after = result.hasNextPage ? result.endCursor : undefined;
    if (after) await sleep(1000); // Delay between pages to avoid Jobber throttling
  } while (after);

  return synced;
};

const syncJobberInvoices = async (
  integration: IIntegration,
  accessToken: string,
): Promise<number> => {
  let synced = 0;
  let after: string | undefined;

  do {
    const result = await jobberClient.fetchInvoices(accessToken, after);

    for (const inv of result.data) {
      try {
        const jobRef = inv.job?.id
          ? await JobModel.findOne({
              vendor: integration.vendor,
              source: JobSource.JOBBER,
              externalId: inv.job.id,
            })
          : null;

        await InvoiceModel.findOneAndUpdate(
          {
            vendor: integration.vendor,
            source: InvoiceSource.JOBBER,
            externalId: inv.id,
          },
          {
            integration: integration._id,
            job: jobRef?._id,
            invoiceNumber: inv.invoiceNumber || inv.id,
            customerName: inv.client?.name || 'Unknown',
            customerEmail: inv.client?.email || undefined,
            customerPhone: inv.client?.phone || undefined,
            status: JOBBER_INVOICE_STATUS_MAP[inv.status?.toLowerCase()] || InvoiceStatus.DRAFT,
            issuedAt: inv.issuedDate ? new Date(inv.issuedDate) : undefined,
            dueDate: inv.dueDate ? new Date(inv.dueDate) : undefined,
            paidAt: inv.paidDate ? new Date(inv.paidDate) : undefined,
            subtotal: inv.subtotal || 0,
            taxAmount: inv.taxAmount || 0,
            totalAmount: inv.total || 0,
            amountPaid: inv.amountPaid || 0,
            amountDue: inv.amountOwing || 0,
            lineItems: (inv.lineItems || []).map((li) => ({
              name: li.name || 'Item',
              description: li.description,
              quantity: li.quantity || 1,
              unitPrice: li.unitPrice || 0,
              totalPrice: li.totalPrice || 0,
            })),
            rawData: inv.rawNode || inv,
            isActive: true,
          },
          { upsert: true, new: true },
        );
        synced++;
      } catch (err) {
        logger.error(`Failed to sync Jobber invoice ${inv.id}:`, err);
      }
    }

    after = result.hasNextPage ? result.endCursor : undefined;
    if (after) await sleep(1000); // Delay between pages to avoid Jobber throttling
  } while (after);

  return synced;
};

const syncServiceTitanJobs = async (
  integration: IIntegration,
  accessToken: string,
): Promise<number> => {
  let synced = 0;
  let continueFrom: string | undefined;
  const tenantId = integration.credentials.tenantId;

  if (!tenantId) {
    throw new Error('ServiceTitan tenantId missing');
  }

  do {
    const result = await serviceTitanClient.fetchJobs(accessToken, tenantId, continueFrom);

    for (const job of result.data) {
      const address = job.location?.address
        ? `${job.location.address.street}, ${job.location.address.city}, ${job.location.address.state} ${job.location.address.zip}`
        : job.customer?.address
          ? `${job.customer.address.street}, ${job.customer.address.city}, ${job.customer.address.state} ${job.customer.address.zip}`
          : undefined;

      await JobModel.findOneAndUpdate(
        {
          vendor: integration.vendor,
          source: JobSource.SERVICE_TITAN,
          externalId: String(job.id),
        },
        {
          integration: integration._id,
          customerName: job.customer?.name || 'Unknown',
          customerEmail: job.customer?.email,
          customerPhone: job.customer?.phone,
          customerAddress: address,
          title: job.summary || `Job #${job.number}`,
          status: ST_JOB_STATUS_MAP[job.status] || JobStatus.PENDING,
          scheduledStart: job.scheduledOn ? new Date(job.scheduledOn) : undefined,
          completedAt: job.completedOn ? new Date(job.completedOn) : undefined,
          totalAmount: job.total || 0,
          lineItems: (job.items || []).map((item) => ({
            name: item.skuName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
          rawData: job,
          isActive: true,
        },
        { upsert: true, new: true },
      );
      synced++;
    }

    continueFrom = result.hasMore ? result.continueFrom : undefined;
  } while (continueFrom);

  return synced;
};

const syncServiceTitanInvoices = async (
  integration: IIntegration,
  accessToken: string,
): Promise<number> => {
  let synced = 0;
  let continueFrom: string | undefined;
  const tenantId = integration.credentials.tenantId;

  if (!tenantId) {
    throw new Error('ServiceTitan tenantId missing');
  }

  do {
    const result = await serviceTitanClient.fetchInvoices(accessToken, tenantId, continueFrom);

    for (const inv of result.data) {
      const jobRef = inv.job?.id
        ? await JobModel.findOne({
            vendor: integration.vendor,
            source: JobSource.SERVICE_TITAN,
            externalId: String(inv.job.id),
          })
        : null;

      const totalAmount = inv.total || 0;
      const balance = inv.balance || 0;

      await InvoiceModel.findOneAndUpdate(
        {
          vendor: integration.vendor,
          source: InvoiceSource.SERVICE_TITAN,
          externalId: String(inv.id),
        },
        {
          integration: integration._id,
          job: jobRef?._id,
          invoiceNumber: inv.number || String(inv.id),
          customerName: inv.customer?.name || 'Unknown',
          customerEmail: inv.customer?.email,
          customerPhone: inv.customer?.phone,
          status: ST_INVOICE_STATUS_MAP[inv.status] || InvoiceStatus.DRAFT,
          issuedAt: inv.invoiceDate ? new Date(inv.invoiceDate) : undefined,
          dueDate: inv.dueDate ? new Date(inv.dueDate) : undefined,
          paidAt: inv.status === 'Paid' ? new Date() : undefined,
          subtotal: inv.subtotal || 0,
          taxAmount: inv.salesTax || 0,
          totalAmount,
          amountPaid: totalAmount - balance,
          amountDue: balance,
          lineItems: (inv.items || []).map((item) => ({
            name: item.skuName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
          rawData: inv,
          isActive: true,
        },
        { upsert: true, new: true },
      );
      synced++;
    }

    continueFrom = result.hasMore ? result.continueFrom : undefined;
  } while (continueFrom);

  return synced;
};

export const syncIntegration = async (integrationId: string): Promise<{ jobs: number; invoices: number }> => {
  const integration = await getIntegrationWithCredentials(integrationId);

  if (!integration || integration.status !== IntegrationStatus.CONNECTED) {
    throw new Error('Integration not found or not connected');
  }

  let jobsSynced = 0;
  let invoicesSynced = 0;

  try {
    if (integration.provider === IntegrationProvider.JOBBER) {
      const accessToken = await ensureJobberToken(integration);
      jobsSynced = await syncJobberJobs(integration, accessToken);
      invoicesSynced = await syncJobberInvoices(integration, accessToken);
    } else if (integration.provider === IntegrationProvider.SERVICE_TITAN) {
      const accessToken = await ensureServiceTitanToken(integration);
      jobsSynced = await syncServiceTitanJobs(integration, accessToken);
      invoicesSynced = await syncServiceTitanInvoices(integration, accessToken);
    }

    await IntegrationModel.findByIdAndUpdate(integrationId, {
      lastSyncAt: new Date(),
    });

    logger.info(
      `Sync completed for integration ${integrationId}: ${jobsSynced} jobs, ${invoicesSynced} invoices`,
    );
  } catch (error) {
    logger.error(`Sync failed for integration ${integrationId}:`, error);
    throw error;
  }

  return { jobs: jobsSynced, invoices: invoicesSynced };
};

export const syncAllActiveIntegrations = async (): Promise<void> => {
  const integrations = await IntegrationModel.find({
    status: IntegrationStatus.CONNECTED,
    isActive: true,
    provider: { $in: [IntegrationProvider.JOBBER, IntegrationProvider.SERVICE_TITAN] },
  });

  logger.info(`Starting scheduled sync for ${integrations.length} active integrations`);

  for (const integration of integrations) {
    try {
      await syncIntegration(integration._id.toString());
    } catch (error) {
      logger.error(
        `Scheduled sync failed for integration ${integration._id}:`,
        error,
      );
    }
  }

  logger.info('Scheduled sync completed for all integrations');
};
