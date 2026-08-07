import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignWeek {
  weekNumber: number;
  inHomesWeekOf: Date;
  mailingQuantity: number;
  totalPayments: number;
  productService: mongoose.Types.ObjectId | null;
}

export interface ICampaign extends Document {
  _id: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  name: string;
  description: string;
  currentProduct: string;
  totalMailingQuantity: number;
  totalWeeks: number;
  startDate: Date;
  paymentDay: string;
  nextScheduledProduct: string;
  nextScheduledArtworkDueDate: Date;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  postcardImageUrl: string;
  weeks: ICampaignWeek[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const campaignWeekSchema = new Schema<ICampaignWeek>(
  {
    weekNumber: {
      type: Number,
      required: true,
    },
    inHomesWeekOf: {
      type: Date,
      required: true,
    },
    mailingQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPayments: {
      type: Number,
      required: true,
      min: 0,
    },
    productService: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
  },
  { _id: false },
);

const campaignSchema = new Schema<ICampaign>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    currentProduct: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    totalMailingQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    totalWeeks: {
      type: Number,
      required: true,
      min: 1,
      max: 52,
    },
    startDate: {
      type: Date,
      required: true,
    },
    paymentDay: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    nextScheduledProduct: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    nextScheduledArtworkDueDate: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    postcardImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    weeks: {
      type: [campaignWeekSchema],
      default: [],
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

campaignSchema.index({ vendor: 1, isActive: 1 });
campaignSchema.index({ name: 1, isActive: 1 });

export const CampaignModel = mongoose.model<ICampaign>('Campaign', campaignSchema);
