import mongoose, { Schema, Document } from 'mongoose';

export enum JobSource {
  JOBBER = 'jobber',
  SERVICE_TITAN = 'service_titan',
}

export enum JobStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IJobLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  integration: mongoose.Types.ObjectId;
  source: JobSource;
  externalId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  title: string;
  description?: string;
  status: JobStatus;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  completedAt?: Date;
  totalAmount: number;
  lineItems: IJobLineItem[];
  rawData: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobLineItemSchema = new Schema<IJobLineItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const jobSchema = new Schema<IJob>(
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
    source: {
      type: String,
      required: true,
      enum: Object.values(JobSource),
      index: true,
    },
    externalId: {
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
      index: true,
    },
    scheduledStart: { type: Date },
    scheduledEnd: { type: Date },
    completedAt: { type: Date },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    lineItems: [jobLineItemSchema],
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

jobSchema.index({ vendor: 1, source: 1, externalId: 1 }, { unique: true });
jobSchema.index({ vendor: 1, status: 1 });
jobSchema.index({ vendor: 1, scheduledStart: 1 });

export const JobModel = mongoose.model<IJob>('Job', jobSchema);
