import mongoose, { Schema, Document } from 'mongoose';

export interface IPostcard extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  images: string[];
  vendor: mongoose.Types.ObjectId;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postcardSchema = new Schema<IPostcard>(
  {
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
    images: {
      type: [String],
      default: [],
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

postcardSchema.index({ vendor: 1, isActive: 1 });
postcardSchema.index({ name: 1, isActive: 1 });

export const PostcardModel = mongoose.model<IPostcard>('Postcard', postcardSchema);
