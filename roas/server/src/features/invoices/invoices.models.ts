import mongoose, { Schema, Document } from 'mongoose';

export enum InvoiceSource {
  JOBBER = 'jobber',
  SERVICE_TITAN = 'service_titan',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  VOID = 'void',
}

export interface IInvoiceLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  integration: mongoose.Types.ObjectId;
  job?: mongoose.Types.ObjectId;
  source: InvoiceSource;
  externalId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  status: InvoiceStatus;
  issuedAt?: Date;
  dueDate?: Date;
  paidAt?: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  lineItems: IInvoiceLineItem[];
  rawData: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceLineItemSchema = new Schema<IInvoiceLineItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const invoiceSchema = new Schema<IInvoice>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    integration: {
      type: Schema.Types.ObjectId,
      ref: 'Integration',
      required: true,
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      index: true,
    },
    source: {
      type: String,
      required: true,
      enum: Object.values(InvoiceSource),
      index: true,
    },
    externalId: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    customerAddress: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.DRAFT,
      index: true,
    },
    issuedAt: { type: Date },
    dueDate: { type: Date },
    paidAt: { type: Date },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    amountDue: {
      type: Number,
      required: true,
      default: 0,
    },
    lineItems: [invoiceLineItemSchema],
    rawData: {
      type: Schema.Types.Mixed,
      default: {},
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

invoiceSchema.index({ vendor: 1, source: 1, externalId: 1 }, { unique: true });
invoiceSchema.index({ vendor: 1, status: 1 });
invoiceSchema.index({ vendor: 1, dueDate: 1 });

export const InvoiceModel = mongoose.model<IInvoice>('Invoice', invoiceSchema);
