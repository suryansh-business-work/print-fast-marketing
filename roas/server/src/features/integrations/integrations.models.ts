import mongoose, { Schema, Document } from 'mongoose';

export enum IntegrationProvider {
  SERVICE_TITAN = 'service_titan',
  JOBBER = 'jobber',
  SERVICE_WARE = 'service_ware',
}

export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
}

export interface IIntegration extends Document {
  _id: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  credentials: {
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    environment?: string;
    redirectUri?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
  };
  connectedAt: Date | null;
  lastSyncAt: Date | null;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const integrationSchema = new Schema<IIntegration>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: Object.values(IntegrationProvider),
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(IntegrationStatus),
      default: IntegrationStatus.DISCONNECTED,
    },
    credentials: {
      tenantId: { type: String, trim: true, select: false },
      clientId: { type: String, trim: true, select: false },
      clientSecret: { type: String, trim: true, select: false },
      environment: { type: String, trim: true },
      redirectUri: { type: String, trim: true, select: false },
      accessToken: { type: String, trim: true, select: false },
      refreshToken: { type: String, trim: true, select: false },
      tokenExpiresAt: { type: Date, select: false },
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

integrationSchema.index({ vendor: 1, provider: 1 }, { unique: true });

export const IntegrationModel = mongoose.model<IIntegration>('Integration', integrationSchema);
