import { InvoiceModel } from './invoices.models';
import { IPaginatedResult } from '../../types/common';
import { NotFoundError } from '../../utils/errors';

interface InvoiceResponse {
  invoiceId: string;
  vendorId: string;
  integrationId: string;
  jobId?: string;
  source: string;
  externalId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  status: string;
  issuedAt?: Date;
  dueDate?: Date;
  paidAt?: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
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

const toInvoiceResponse = (invoice: InstanceType<typeof InvoiceModel>): InvoiceResponse => ({
  invoiceId: invoice._id.toString(),
  vendorId: invoice.vendor.toString(),
  integrationId: invoice.integration.toString(),
  jobId: invoice.job?.toString(),
  source: invoice.source,
  externalId: invoice.externalId,
  invoiceNumber: invoice.invoiceNumber,
  customerName: invoice.customerName,
  customerEmail: invoice.customerEmail,
  customerPhone: invoice.customerPhone,
  customerAddress: invoice.customerAddress,
  status: invoice.status,
  issuedAt: invoice.issuedAt,
  dueDate: invoice.dueDate,
  paidAt: invoice.paidAt,
  subtotal: invoice.subtotal,
  taxAmount: invoice.taxAmount,
  totalAmount: invoice.totalAmount,
  amountPaid: invoice.amountPaid,
  amountDue: invoice.amountDue,
  lineItems: invoice.lineItems.map((li) => ({
    name: li.name,
    description: li.description,
    quantity: li.quantity,
    unitPrice: li.unitPrice,
    totalPrice: li.totalPrice,
  })),
  isActive: invoice.isActive,
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt,
});

interface ListInvoicesParams {
  vendorId: string;
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  source?: string;
}

export const listInvoices = async (
  params: ListInvoicesParams,
): Promise<IPaginatedResult<InvoiceResponse>> => {
  const { vendorId, page, limit, sort, order, search, status, source } = params;

  const filter: Record<string, unknown> = { vendor: vendorId, isActive: true };

  if (status) filter.status = status;
  if (source) filter.source = source;
  if (search) {
    filter.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { externalId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };

  const [items, totalItems] = await Promise.all([
    InvoiceModel.find(filter).sort(sortObj).skip(skip).limit(limit),
    InvoiceModel.countDocuments(filter),
  ]);

  return {
    items: items.map(toInvoiceResponse),
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    limit,
  };
};

export const getInvoiceById = async (invoiceId: string): Promise<InvoiceResponse> => {
  const invoice = await InvoiceModel.findById(invoiceId);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  return toInvoiceResponse(invoice);
};
