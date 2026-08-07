import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  label: string;
  category: string;
  tag: string;
  vendor: mongoose.Types.ObjectId;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    tag: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
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

clientSchema.index({ vendor: 1, isActive: 1 });
clientSchema.index({ name: 1, isActive: 1 });
clientSchema.index({ email: 1, vendor: 1 });

export const ClientModel = mongoose.model<IClient>('Client', clientSchema);
