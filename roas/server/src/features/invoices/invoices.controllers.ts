import { Request, Response, NextFunction } from 'express';
import * as invoicesService from './invoices.services';
import { sendSuccess } from '../../utils/response';
import { InvoicesListQuery } from './invoices.validators';

export const listInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const vendorId = req.params.vendorId as string;
    const query = req.query as unknown as InvoicesListQuery;

    const result = await invoicesService.listInvoices({
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

export const getInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const invoiceId = req.params.invoiceId as string;
    const invoice = await invoicesService.getInvoiceById(invoiceId);
    sendSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
};
